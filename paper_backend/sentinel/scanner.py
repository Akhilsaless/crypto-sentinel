"""Read-only, fail-closed crypto scanner for research (NOT a live trading bot).

Kraken REST OHLC endpoint returns the current unfinished bar last; exclude it.
No private credentials, exchange order methods, leverage, or portfolio mutations.
"""
from __future__ import annotations
import math
import time
from dataclasses import dataclass
from typing import Literal
import httpx

PAIRS = {"BTC": "XBTUSD", "ETH": "ETHUSD", "SOL": "SOLUSD"}
FRAMES = {"intraday": 60, "swing": 240}  # candles in minutes
MIN_BARS = 60

class MarketDataError(ValueError):
    pass

@dataclass(frozen=True)
class Bar:
    timestamp: int
    high: float
    low: float
    close: float
    open: float | None = None

def validate_bars(raw: list[Bar], minutes: int, now: float | None = None) -> list[Bar]:
    now = time.time() if now is None else now
    if len(raw) < MIN_BARS:
        raise MarketDataError("Not enough completed candles")
    if any(not all(math.isfinite(p) and p > 0 for p in (b.high, b.low, b.close))
           or not b.low <= b.close <= b.high for b in raw):
        raise MarketDataError("Invalid candle prices")
    if any(b.open is not None and (not math.isfinite(b.open) or not b.low <= b.open <= b.high) for b in raw):
        raise MarketDataError("Invalid OHLC opening price")
    if any(b.timestamp <= a.timestamp for a, b in zip(raw, raw[1:])):
        raise MarketDataError("Missing ordering or duplicate timestamps")
    if raw[-1].timestamp > now or now - raw[-1].timestamp > minutes * 60 * 3:
        raise MarketDataError("Latest completed candle missing or stale")
    if any(b.timestamp - a.timestamp > minutes * 60 * 2 for a, b in zip(raw, raw[1:])):
        raise MarketDataError("Market data has excessive gaps")
    return raw

def kraken_candles(symbol: str, frame: str, client: httpx.Client | None = None,
                   now: float | None = None) -> list[Bar]:
    if symbol not in PAIRS or frame not in FRAMES:
        raise MarketDataError("Unsupported symbol or timeframe")
    minutes = FRAMES[frame]
    own_client = client is None
    client = client or httpx.Client(timeout=10, trust_env=False)
    try:
        response = client.get("https://api.kraken.com/0/public/OHLC",
                              params={"pair": PAIRS[symbol], "interval": minutes})
        response.raise_for_status()
        payload = response.json()
        if payload.get("error"):
            raise MarketDataError("Market provider returned an error")
        result = payload["result"]
        key = next((k for k in result if k != "last"), None)
        if key is None or not isinstance(result[key], list):
            raise MarketDataError("Missing candles")
        # Kraken documents the last OHLC row as the currently uncommitted candle.
        closed = result[key][:-1]
        bars = [Bar(int(r[0]), float(r[2]), float(r[3]), float(r[4]), float(r[1]))
                for r in closed]
        return validate_bars(bars, minutes, now)
    except (httpx.HTTPError, KeyError, TypeError, ValueError, StopIteration) as e:
        if isinstance(e, MarketDataError):
            raise
        raise MarketDataError("Market feed unavailable or invalid") from e
    finally:
        if own_client:
            client.close()

def ema(values: list[float], period: int) -> float:
    alpha = 2 / (period + 1)
    value = sum(values[:period]) / period
    for point in values[period:]:
        value = alpha * point + (1 - alpha) * value
    return value

def rsi(values: list[float], period: int = 14) -> float:
    diffs = [b - a for a, b in zip(values, values[1:])]
    gains = [max(d, 0.0) for d in diffs]
    losses = [max(-d, 0.0) for d in diffs]
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    for gain, loss in zip(gains[period:], losses[period:]):
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
    if avg_gain == avg_loss == 0:
        return 50.0
    return 100.0 if avg_loss == 0 else 100.0 - 100.0 / (1 + avg_gain / avg_loss)

def atr(bars: list[Bar], period: int = 14) -> float:
    tr = [max(b.high - b.low, abs(b.high - prev.close), abs(b.low - prev.close))
          for prev, b in zip(bars, bars[1:])]
    value = sum(tr[:period]) / period
    for point in tr[period:]:
        value = (value * (period - 1) + point) / period
    return value

def analyze(symbol: str, frame: Literal["intraday", "swing"], bars: list[Bar],
            now: float | None = None) -> dict:
    validate_bars(bars, FRAMES[frame], now)
    closes = [b.close for b in bars]
    price = closes[-1]
    fast = ema(closes, 9)
    slow = ema(closes, 21)
    momentum = rsi(closes)
    volatility = atr(bars)
    breakout = price > max(b.high for b in bars[-21:-1])
    weak = fast < slow and momentum < 45
    strong = fast > slow and 52 <= momentum <= 70 and breakout
    # An analyzable setup is not a recommendation or an order.
    signal = "entry_watch" if strong else "exit_watch" if weak else "no_trade"
    stop = price - 2 * volatility
    target = price + 3 * volatility
    reasons = [
        "EMA9 above EMA21" if fast > slow else "EMA9 not above EMA21",
        f"RSI14 {momentum:.1f}",
        "20-bar high breakout" if breakout else "No confirmed breakout",
        f"ATR14 {volatility:.4f}",
    ]
    return {
        "mode": "read_only_research", "symbol": symbol, "timeframe": frame,
        "interval_minutes": FRAMES[frame], "signal": signal,
        "as_of_candle": bars[-1].timestamp, "price_usd": round(price, 6),
        "ema9": round(fast, 6), "ema21": round(slow, 6),
        "rsi14": round(momentum, 2), "atr14": round(volatility, 6),
        "hypothetical_long_stop_usd": round(max(stop, 0.0), 6),
        "hypothetical_long_target_usd": round(target, 6),
        "reasons": reasons,
        "warning": "Unvalidated research signal. No live order; stop/target are not guaranteed.",
    }
