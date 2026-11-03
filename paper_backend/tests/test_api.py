import time
import pytest
from fastapi.testclient import TestClient
from sentinel.main import build_app
from sentinel.backtest import BacktestRequest, run_backtest

class Quotes:
    price = 10000
    age = 0
    def quote(self, symbol):
        return {"symbol":symbol,"price_cents":self.price,
                "timestamp":time.time()-self.age,"source":"test","is_sample":True}

@pytest.fixture
def env(tmp_path):
    quotes=Quotes()
    with TestClient(build_app(str(tmp_path/"paper.test.sqlite3"),quotes)) as c:
        yield c,quotes

def authorize(c, name="alice"):
    assert c.post("/auth/register",json={"username":name,"password":"strong-test-password"}).status_code==201
    r=c.post("/auth/login",json={"username":name,"password":"strong-test-password"})
    assert r.status_code==200
    return {"Authorization":"Bearer "+r.json()["access_token"]}

def order(c,h,oid="order-0001",side="buy",quantity="1",symbol="BTC"):
    return c.post("/paper/orders",headers=h,json={"client_order_id":oid,
                  "side":side,"quantity":quantity,"symbol":symbol})

def candles():
    return [{"timestamp":i+1,"open":100+i*.1,"close":100+i*.1} for i in range(45)]

def test_no_live_route_or_unauthenticated_orders(env):
    c,_=env
    assert c.get("/health").json()["live_trading"]=="hard_disabled"
    assert c.post("/live/orders").status_code==404
    assert c.get("/paper/account").status_code==401

def test_auth_logout_and_wrong_password(env):
    c,_=env
    h=authorize(c)
    assert c.post("/auth/login",json={"username":"alice","password":"incorrect-password"}).status_code==401
    assert c.get("/paper/account",headers=h).status_code==200
    assert c.post("/auth/logout",headers=h).status_code==200
    assert c.get("/paper/account",headers=h).status_code==401

def test_idempotency_and_conflicts(env):
    c,_=env
    h=authorize(c)
    a=order(c,h);b=order(c,h)
    assert a.status_code==201 and b.status_code==201
    assert b.json()["duplicate"] and a.json()["id"]==b.json()["id"]
    assert order(c,h,quantity="2").status_code==409
    assert len(c.get("/paper/orders",headers=h).json()["orders"])==1

def test_account_isolation(env):
    c,_=env
    a=authorize(c,"alice")
    b=authorize(c,"bob")
    assert order(c,a).status_code==201
    assert c.get("/paper/account",headers=b).json()["positions"]==[]
    assert c.get("/paper/orders",headers=b).json()["orders"]==[]

def test_kill_switch_prevents_new_orders(env):
    c,_=env
    h=authorize(c)
    assert order(c,h).status_code==201
    result=c.post("/paper/kill",headers=h).json()
    assert result["new_orders_disabled"] and not result["positions_closed"]
    assert order(c,h,"order-0002").status_code==423

def test_stale_prices_fail_closed(env):
    c,q=env
    h=authorize(c)
    q.age=200
    assert order(c,h).status_code==503
    assert c.get("/paper/account",headers=h).json()["cash_usd"]=="10000"

def test_risk_limits_cannot_loosen(env):
    c,_=env
    h=authorize(c)
    assert c.put("/paper/risk",headers=h,json={"max_order_usd":"100","max_daily_loss_usd":"20","max_positions":1}).status_code==200
    assert c.put("/paper/risk",headers=h,json={"max_order_usd":"200","max_daily_loss_usd":"20","max_positions":1}).status_code==422

def test_oversell_and_notional_caps(env):
    c,_=env
    h=authorize(c)
    assert order(c,h,side="sell").status_code==422
    assert order(c,h,quantity="30").status_code==422

def test_sample_prices_rejected_outside_test_database(tmp_path):
    q=Quotes()
    with TestClient(build_app(str(tmp_path/"normal.sqlite3"),q)) as c:
        h=authorize(c)
        assert order(c,h).status_code==503

def test_backtesting_requires_auth(env):
    c,_=env
    assert c.post("/research/backtest",json={"candles":candles()}).status_code==401

def test_backtest_is_next_bar_and_fee_sensitive():
    clean=run_backtest(BacktestRequest(candles=candles(),fee_bps=0,slippage_bps=0))
    costly=run_backtest(BacktestRequest(candles=candles(),fee_bps=50,slippage_bps=50))
    assert clean["trades"][0]["timestamp"]==22
    assert costly["ending_equity"]<clean["ending_equity"]

def test_backtest_does_not_change_account(env):
    c,_=env
    h=authorize(c)
    assert c.post("/research/backtest",headers=h,json={"candles":candles()}).status_code==200
    assert c.get("/paper/account",headers=h).json()["cash_usd"]=="10000"
