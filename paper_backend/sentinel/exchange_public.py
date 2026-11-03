"""Public SPOT candles for Binance and CoinDCX. No API keys or order functions.

Sources:
Binance: https://github.com/binance/binance-spot-api-docs/blob/master/faqs/market_data_only.md
CoinDCX: https://docs.coindcx.com/ (market details + candle endpoints)
USDT quotes are NOT exactly USD; every response exposes quote_currency.
"""
from __future__ import annotations

import math
import time
from typing import Literal

import httpx
from sentinel.scanner import Bar, FRAMES, MarketDataError, validate_bars

EXCHANGES = ("binance", "coindcx")
ASSETS = ("BTC", "ETH", "SOL")
QUOTE = "USDT"
MAX_CANDLES = 720
BINANCE_BASE = "https://data-api.binance.vision"
COINDCX_BASE = "https://api.coindcx.com"


def _number(value) -> float:
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise MarketDataError("Invalid candle numeric field") from exc
    if not math.isfinite(result):
        raise MarketDataError("Nonfinite candle field")
    return result


def _validate_request(exchange: str, asset: str, frame: str):
    if exchange not in EXCHANGES or asset not in ASSETS or frame not in FRAMES:
        raise MarketDataError("Unsupported spot exchange, asset or timeframe")


def _closed(bar: Bar, interval_seconds: int, now: float):
    return bar.timestamp >= 0 and bar.timestamp + interval_seconds <= now


def _aggregate_utc_4h(hourly: list[Bar], now: float) -> list[Bar]:
    """Build a 4h candle only from four contiguous complete UTC-aligned 1h bars."""
    groups: dict[int, list[Bar]] = {}
    for bar in hourly:
        bucket = (bar.timestamp // 14400) * 14400
        groups.setdefault(bucket, []).append(bar)
    aggregated: list[Bar] = []
    for bucket in sorted(groups):
        group = sorted(groups[bucket], key=lambda bar: bar.timestamp)
        if len(group) != 4 or [bar.timestamp for bar in group] != [
            bucket + 3600 * i for i in range(4)
        ]:
            continue
        if bucket + 14400 > now:
            continue
        aggregated.append(
            Bar(bucket, max(bar.high for bar in group),
                min(bar.low for bar in group), group[-1].close, group[0].open)
        )
    return aggregated


def _binance(asset: str, frame: str, client: httpx.Client, now: float):
    interval = "1h" if frame == "intraday" else "4h"
    response = client.get(
        f"{BINANCE_BASE}/api/v3/klines",
        params={"symbol": f"{asset}{QUOTE}", "interval": interval, "limit": MAX_CANDLES},
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise MarketDataError("Invalid Binance candle response")
    interval_seconds = FRAMES[frame] * 60
    bars = [
        Bar(int(row[0]) // 1000, _number(row[2]), _number(row[3]),
            _number(row[4]), _number(row[1]))
        for row in payload
        if isinstance(row, list) and len(row) >= 7
        and int(row[6]) < now * 1000
    ]
    return validate_bars(bars, FRAMES[frame], now)


def _coindcx_pair(asset: str, client: httpx.Client) -> str:
    # Verify the *actual* active spot pair, never assume Binance-linked markets exist.
    response = client.get(f"{COINDCX_BASE}/exchange/v1/markets_details")
    response.raise_for_status()
    markets = response.json()
    if not isinstance(markets, list):
        raise MarketDataError("Invalid CoinDCX market details")
    candidates = []
    for item in markets:
        if not isinstance(item, dict):
            continue
        pair = item.get("pair")
        if not isinstance(pair, str):
            continue
        if pair.endswith(f"-{asset}_{QUOTE}") and item.get("status") == "active":
            candidates.append(pair)
    if not candidates:
        raise MarketDataError(f"No active CoinDCX {asset}/{QUOTE} spot market")
    # Match documented spot pair prefixes; prefer B when available.
    candidates.sort(key=lambda p: (0 if p.startswith("B-") else 1, p))
    return candidates[0]


def _coindcx(asset: str, frame: str, client: httpx.Client, now: float):
    pair = _coindcx_pair(asset, client)
    # CoinDCX documented spot intervals are 1m, 15m, 1h, 1d; aggregate 1h -> 4h.
    interval_seconds = 3600
    response = client.get(
        f"{COINDCX_BASE}/market_data/candles",
        params={"pair": pair, "interval": "1h", "limit": 1000},
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise MarketDataError("Invalid CoinDCX candles")
    bars = []
    for row in payload:
        if not isinstance(row, dict):
            raise MarketDataError("Malformed CoinDCX candle")
        bar = Bar(int(row["time"]) // 1000, _number(row["high"]),
                  _number(row["low"]), _number(row["close"]), _number(row["open"]))
        if _closed(bar, interval_seconds, now):
            bars.append(bar)
    bars.sort(key=lambda bar: bar.timestamp)
    if frame == "swing":
        bars = _aggregate_utc_4h(bars, now)
    return validate_bars(bars, FRAMES[frame], now)


def exchange_candles(exchange: Literal["binance", "coindcx"], asset: str, frame: str,
                     client: httpx.Client | None = None, now: float | None = None) -> list[Bar]:
    """Return only completed candles. No fallback to a different exchange or fake prices."""
    _validate_request(exchange, asset, frame)
    now = time.time() if now is None else now
    owned = client is None
    client = client or httpx.Client(timeout=httpx.Timeout(12.0), trust_env=False,
                                     follow_redirects=False)
    try:
        if exchange == "binance":
            return _binance(asset, frame, client, now)
        return _coindcx(asset, frame, client, now)
    except MarketDataError:
        raise
    except (httpx.HTTPError, ValueError, TypeError, KeyError, IndexError, OverflowError) as exc:
        raise MarketDataError(f"{exchange} spot feed unavailable or malformed") from exc
    finally:
        if owned:
            client.close()
