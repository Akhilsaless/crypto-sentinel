"""Crypto Sentinel: paper-only development API. NO exchange order adapter.

This is a single-process prototype. Do not deploy publicly without security,
operational and market-data reviews. Virtual funds only.
"""
import hashlib
import os
import secrets
import sqlite3
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_EVEN
from typing import Literal
from uuid import uuid4

import httpx
from argon2 import PasswordHasher
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from sentinel.backtest import BacktestRequest, run_backtest

COINS = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana"}
UNIT = 1_000_000
INITIAL_CASH = 1_000_000   # $10,000 simulated, stored in cents
MAX_NOTIONAL = 250_000    # $2,500 per order
MAX_DAILY_LOSS = 20_000   # $200 realized loss
MAX_POSITIONS = 3
MAX_QUOTE_AGE = 120
SESSION_SECONDS = 3600
PH = PasswordHasher()

def cents(v):
    try:
        d = Decimal(str(v))
        if not d.is_finite() or d <= 0 or d > Decimal("1000000000"):
            raise ValueError("Amount must be positive and finite")
        return int((d*100).quantize(Decimal("1"),rounding=ROUND_HALF_EVEN))
    except (InvalidOperation,TypeError) as e:
        raise ValueError("Invalid amount") from e

def units(v):
    try:
        d=Decimal(str(v))
        if not d.is_finite() or d<=0 or d>100000 or d.as_tuple().exponent < -6:
            raise ValueError("Invalid quantity or excess precision")
        n=int(d*UNIT)
        if n<=0: raise ValueError("Quantity too small")
        return n
    except (InvalidOperation,TypeError) as e:
        raise ValueError("Invalid quantity") from e

def fmt(value,scale):
    return str(Decimal(value)/scale)

class PublicQuotes:
    """Read-only public market data; no credential support or order placement."""
    def __init__(self):
        self.cache={}
        self.lock=threading.Lock()
    def quote(self,symbol):
        if symbol not in COINS:
            raise HTTPException(422,"Supported: BTC ETH SOL")
        with self.lock:
            old=self.cache.get(symbol)
            if old and time.time()-old["timestamp"]<30:
                return dict(old)
            try:
                response=httpx.get("https://api.coingecko.com/api/v3/simple/price",
                    params={"ids":COINS[symbol],"vs_currencies":"usd"},timeout=8)
                response.raise_for_status()
                price=cents(response.json()[COINS[symbol]]["usd"])
                if price<=0: raise ValueError("Invalid market quote")
            except Exception as e:
                raise HTTPException(503,"Market price unavailable; no order executed") from e
            quote={"symbol":symbol,"price_cents":price,"timestamp":time.time(),
                   "source":"coingecko-public","is_sample":False}
            self.cache[symbol]=quote
            return dict(quote)

class Register(BaseModel):
    username:str=Field(min_length=3,max_length=50,pattern=r"^[a-zA-Z0-9_-]+$")
    password:str=Field(min_length=12,max_length=256)

class PaperOrder(BaseModel):
    side:Literal["buy","sell"]
    symbol:Literal["BTC","ETH","SOL"]
    quantity:str=Field(min_length=1,max_length=40)
    client_order_id:str=Field(min_length=8,max_length=100,pattern=r"^[a-zA-Z0-9_-]+$")

class Risk(BaseModel):
    max_order_usd:str="2500"
    max_daily_loss_usd:str="200"
    max_positions:int=Field(ge=1,le=MAX_POSITIONS,default=3)

def build_app(db_path=None,quote_provider=None):
    app=FastAPI(title="Crypto Sentinel — PAPER ONLY",version="0.1.0")
    app.state.path=db_path or os.getenv("SENTINEL_DB","sentinel-paper.sqlite3")
    app.state.provider=quote_provider or PublicQuotes()
    app.state.lock=threading.RLock()

    def connect():
        db=sqlite3.connect(app.state.path,timeout=15,isolation_level=None,check_same_thread=False)
        db.row_factory=sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        db.execute("PRAGMA busy_timeout=15000")
        return db

    @contextmanager
    def tx():
        with app.state.lock:
            db=connect()
            try:
                db.execute("BEGIN IMMEDIATE")
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise
            finally:
                db.close()

    with tx() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,cash_cents INTEGER NOT NULL,killed INTEGER NOT NULL DEFAULT 0,
          max_order_cents INTEGER NOT NULL DEFAULT 250000,
          max_daily_loss_cents INTEGER NOT NULL DEFAULT 20000,
          max_positions INTEGER NOT NULL DEFAULT 3);
        CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id),expires REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS positions(user_id TEXT NOT NULL REFERENCES users(id),
          symbol TEXT NOT NULL,units INTEGER NOT NULL,cost_cents INTEGER NOT NULL,
          PRIMARY KEY(user_id,symbol));
        CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id),client_order_id TEXT NOT NULL,
          side TEXT NOT NULL,symbol TEXT NOT NULL,units INTEGER NOT NULL,
          price_cents INTEGER NOT NULL,notional_cents INTEGER NOT NULL,
          realized_pnl_cents INTEGER NOT NULL,timestamp TEXT NOT NULL,
          UNIQUE(user_id,client_order_id));
        CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,event TEXT NOT NULL,detail TEXT NOT NULL,
          timestamp TEXT NOT NULL);
        """)

    def audit(db,user,event,detail):
        db.execute("INSERT INTO audit(user_id,event,detail,timestamp) VALUES(?,?,?,?)",
          (user,event,detail,datetime.now(timezone.utc).isoformat()))

    def auth(authorization:str|None=Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(401,"Bearer token required")
        hashed=hashlib.sha256(authorization[7:].encode()).hexdigest()
        with connect() as db:
            row=db.execute("""SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
                       WHERE s.token_hash=? AND s.expires>?""",
                       (hashed,time.time())).fetchone()
        if row is None: raise HTTPException(401,"Session invalid or expired")
        return dict(row)

    @app.get("/health")
    def health():
        return {"status":"ok","mode":"paper_only","live_trading":"hard_disabled",
                "exchange_order_adapter":"absent"}

    @app.post("/auth/register",status_code=201)
    def register(body:Register):
        uid=str(uuid4())
        with tx() as db:
            if db.execute("SELECT 1 FROM users WHERE username=?",(body.username.lower(),)).fetchone():
                raise HTTPException(409,"Username already exists")
            db.execute("INSERT INTO users(id,username,password_hash,cash_cents) VALUES(?,?,?,?)",
              (uid,body.username.lower(),PH.hash(body.password),INITIAL_CASH))
            audit(db,uid,"registered","Paper-only virtual account")
        return {"account_id":uid,"mode":"paper_only"}

    @app.post("/auth/login")
    def login(body:Register):
        with connect() as db:
            user=db.execute("SELECT * FROM users WHERE username=?",(body.username.lower(),)).fetchone()
        if not user: raise HTTPException(401,"Invalid credentials")
        try: PH.verify(user["password_hash"],body.password)
        except Exception as e: raise HTTPException(401,"Invalid credentials") from e
        token=secrets.token_urlsafe(32)
        with tx() as db:
            db.execute("INSERT INTO sessions VALUES(?,?,?)",
              (hashlib.sha256(token.encode()).hexdigest(),user["id"],time.time()+SESSION_SECONDS))
            audit(db,user["id"],"login","Session issued")
        return {"access_token":token,"token_type":"bearer","expires_in":SESSION_SECONDS}

    @app.post("/auth/logout")
    def logout(authorization:str|None=Header(None),user=Depends(auth)):
        with tx() as db:
            db.execute("DELETE FROM sessions WHERE token_hash=?",
              (hashlib.sha256(authorization[7:].encode()).hexdigest(),))
            audit(db,user["id"],"logout","Session revoked")
        return {"status":"logged_out"}

    @app.get("/market/{symbol}")
    def market(symbol:str,user=Depends(auth)):
        q=app.state.provider.quote(symbol.upper())
        return {**q,"price_usd":fmt(q["price_cents"],100),
                "note":"Read-only quote, not a guaranteed exchange execution price"}

    @app.post("/research/backtest")
    def backtest(body:BacktestRequest,user=Depends(auth)):
        return run_backtest(body)

    @app.get("/paper/account")
    def account(user=Depends(auth)):
        with connect() as db:
            positions=db.execute("SELECT symbol,units,cost_cents FROM positions WHERE user_id=?",
                      (user["id"],)).fetchall()
        return {"mode":"paper_only","cash_usd":fmt(user["cash_cents"],100),
           "killed":bool(user["killed"]),
           "positions":[{"symbol":p["symbol"],"quantity":fmt(p["units"],UNIT),
                         "cost_basis_usd":fmt(p["cost_cents"],100)} for p in positions],
           "warning":"Virtual funds only, no unrealized P&L without live market quotes"}

    @app.put("/paper/risk")
    def configure_risk(body:Risk,user=Depends(auth)):
        try:
            max_order=cents(body.max_order_usd)
            max_loss=cents(body.max_daily_loss_usd)
        except ValueError as e: raise HTTPException(422,str(e))
        if not (0<max_order<=MAX_NOTIONAL and 0<max_loss<=MAX_DAILY_LOSS):
            raise HTTPException(422,"Limits may only be tightened")
        with tx() as db:
            current=db.execute("""SELECT max_order_cents,max_daily_loss_cents,max_positions
                        FROM users WHERE id=?""",(user["id"],)).fetchone()
            if (max_order>current["max_order_cents"] or max_loss>current["max_daily_loss_cents"]
                    or body.max_positions>current["max_positions"]):
                raise HTTPException(422,"Existing limits cannot be loosened")
            db.execute("""UPDATE users SET max_order_cents=?,max_daily_loss_cents=?,
                       max_positions=? WHERE id=?""",
                       (max_order,max_loss,body.max_positions,user["id"]))
            audit(db,user["id"],"risk_updated",f"{max_order}:{max_loss}:{body.max_positions}")
        return {"updated":True,"mode":"paper_only"}

    @app.post("/paper/kill")
    def kill(user=Depends(auth)):
        with tx() as db:
            db.execute("UPDATE users SET killed=1 WHERE id=?",(user["id"],))
            audit(db,user["id"],"kill","Paper orders disabled; no liquidation")
        return {"killed":True,"new_orders_disabled":True,"positions_closed":False,
                "note":"No liquidation. Reviewed reset procedure required."}

    @app.post("/paper/orders",status_code=201)
    def create_order(body:PaperOrder,user=Depends(auth)):
        try: qty=units(body.quantity)
        except ValueError as e: raise HTTPException(422,str(e))
        with tx() as db:
            prev=db.execute("SELECT * FROM orders WHERE user_id=? AND client_order_id=?",
                            (user["id"],body.client_order_id)).fetchone()
            if prev:
                if prev["side"]!=body.side or prev["symbol"]!=body.symbol or prev["units"]!=qty:
                    raise HTTPException(409,"Idempotency key reused with another order")
                return {"id":prev["id"],"status":"paper_filled","duplicate":True,"mode":"paper_only"}
            u=db.execute("SELECT * FROM users WHERE id=?",(user["id"],)).fetchone()
            if u["killed"]: raise HTTPException(423,"Kill switch active")
            quote=app.state.provider.quote(body.symbol)
            if quote.get("is_sample") or quote.get("source")=="mock":
                if not str(app.state.path).endswith(".test.sqlite3"):
                    raise HTTPException(503,"Sample quotes cannot fill orders on deployed server")
            if (not isinstance(quote.get("timestamp"),(int,float)) or
                abs(time.time()-quote["timestamp"])>MAX_QUOTE_AGE):
                raise HTTPException(503,"Stale market quote")
            price=quote.get("price_cents")
            if type(price) is not int or price<=0:
                raise HTTPException(503,"Invalid market quote")
            notional=(qty*price+UNIT//2)//UNIT
            if not 0<notional<=u["max_order_cents"]:
                raise HTTPException(422,"Order violates notional limit")
            realized_today=db.execute("""SELECT COALESCE(SUM(realized_pnl_cents),0)
                  FROM orders WHERE user_id=? AND timestamp>=?""",
                  (user["id"],datetime.now(timezone.utc).date().isoformat())).fetchone()[0]
            if realized_today<=-u["max_daily_loss_cents"]:
                raise HTTPException(423,"Daily loss limit reached")
            pos=db.execute("SELECT units,cost_cents FROM positions WHERE user_id=? AND symbol=?",
                           (user["id"],body.symbol)).fetchone()
            realized=0
            if body.side=="buy":
                if u["cash_cents"]<notional:
                    raise HTTPException(422,"Insufficient virtual funds")
                count=db.execute("SELECT COUNT(*) FROM positions WHERE user_id=? AND units>0",
                                 (user["id"],)).fetchone()[0]
                if pos is None and count>=u["max_positions"]:
                    raise HTTPException(422,"Max positions reached")
                db.execute("UPDATE users SET cash_cents=cash_cents-? WHERE id=?",
                           (notional,user["id"]))
                if pos:
                    db.execute("""UPDATE positions SET units=units+?,cost_cents=cost_cents+?
                               WHERE user_id=? AND symbol=?""",
                               (qty,notional,user["id"],body.symbol))
                else:
                    db.execute("INSERT INTO positions VALUES(?,?,?,?)",
                               (user["id"],body.symbol,qty,notional))
            else:
                if not pos or pos["units"]<qty:
                    raise HTTPException(422,"Cannot short or oversell virtual holdings")
                allocated=(pos["cost_cents"] if pos["units"]==qty else
                           round(pos["cost_cents"]*qty/pos["units"]))
                realized=notional-allocated
                if realized_today+min(realized,0)<-u["max_daily_loss_cents"]:
                    raise HTTPException(423,"This trade breaches daily realized-loss limit")
                db.execute("UPDATE users SET cash_cents=cash_cents+? WHERE id=?",
                           (notional,user["id"]))
                if pos["units"]==qty:
                    db.execute("DELETE FROM positions WHERE user_id=? AND symbol=?",
                               (user["id"],body.symbol))
                else:
                    db.execute("""UPDATE positions SET units=units-?,cost_cents=cost_cents-?
                               WHERE user_id=? AND symbol=?""",
                               (qty,allocated,user["id"],body.symbol))
            oid=str(uuid4())
            db.execute("INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?)",
                       (oid,user["id"],body.client_order_id,body.side,body.symbol,qty,
                        price,notional,realized,datetime.now(timezone.utc).isoformat()))
            audit(db,user["id"],"paper_fill",f"{oid}:{body.side}:{body.symbol}:{qty}")
        return {"id":oid,"status":"paper_filled","duplicate":False,"mode":"paper_only",
                "price_usd":fmt(price,100),"notional_usd":fmt(notional,100),
                "realized_pnl_usd":fmt(realized,100)}

    @app.get("/paper/orders")
    def list_orders(user=Depends(auth)):
        with connect() as db:
            rows=db.execute("""SELECT id,side,symbol,units,price_cents,notional_cents,
                       realized_pnl_cents,timestamp FROM orders WHERE user_id=?
                       ORDER BY timestamp DESC LIMIT 100""",(user["id"],)).fetchall()
        return {"mode":"paper_only","orders":[{"id":r["id"],"side":r["side"],
           "symbol":r["symbol"],"quantity":fmt(r["units"],UNIT),
           "price_usd":fmt(r["price_cents"],100),
           "notional_usd":fmt(r["notional_cents"],100),
           "realized_pnl_usd":fmt(r["realized_pnl_cents"],100),
           "timestamp":r["timestamp"]} for r in rows]}

    @app.get("/audit")
    def audit_events(user=Depends(auth)):
        with connect() as db:
            rows=db.execute("SELECT event,detail,timestamp FROM audit WHERE user_id=? ORDER BY id DESC LIMIT 100",
                    (user["id"],)).fetchall()
        return {"events":[dict(r) for r in rows],
                "note":"Development audit log is not tamper-evident"}

    return app

app=build_app()
