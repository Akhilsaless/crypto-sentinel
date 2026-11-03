"""Offline contract tests for official public CoinDCX and Binance spot REST feeds."""
import httpx
import pytest
from sentinel.exchange_public import (
    exchange_candles, _aggregate_utc_4h
)
from sentinel.scanner import Bar, MarketDataError

NOW=2_000_000_000
HOUR=3600

def binance_payload():
    # 90 complete UTC-aligned 1h candles plus the unfinished one.
    base=(NOW//HOUR-91)*HOUR
    rows=[]
    for i in range(92):
        t=(base+i*HOUR)*1000
        p=100+i
        rows.append([t,str(p),str(p+2),str(p-2),str(p+1),"10",
                     t+HOUR*1000-1,"0","1","0","0","0"])
    return rows

def test_binance_public_klines_only_includes_completed_bars():
    def handler(request):
        assert request.url.host=="data-api.binance.vision"
        assert request.url.path=="/api/v3/klines"
        assert request.url.params["symbol"]=="BTCUSDT"
        return httpx.Response(200,json=binance_payload())
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        bars=exchange_candles("binance","BTC","intraday",client,now=NOW)
    assert len(bars)>=60
    assert bars[-1].timestamp+HOUR<=NOW
    assert bars[-1].open is not None

def test_coindcx_selects_active_spot_pair_and_aggregates_4h():
    base=(NOW//(4*HOUR)-93)*4*HOUR
    payload=[]
    for i in range(93*4):
        t=(base+i*HOUR)*1000
        p=100+i/10
        payload.append({"time":t,"open":p,"high":p+2,"low":p-2,"close":p+1})
    markets=[
        {"pair":"B-BTC_USDT","status":"active"},
        {"pair":"I-BTC_INR","status":"active"},
        {"pair":"B-ETH_USDT","status":"inactive"}]
    def handler(request):
        if request.url.path=="/exchange/v1/markets_details":
            return httpx.Response(200,json=markets)
        assert request.url.path=="/market_data/candles"
        assert request.url.params["pair"]=="B-BTC_USDT"
        assert request.url.params["interval"]=="1h"
        return httpx.Response(200,json=list(reversed(payload)))
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        bars=exchange_candles("coindcx","BTC","swing",client,now=NOW)
    assert len(bars)>=60
    assert all(x.timestamp%14400==0 for x in bars)
    assert bars[-1].timestamp+14400<=NOW

def test_non_active_pair_is_never_assumed():
    def handler(request):
        return httpx.Response(200,json=[{"pair":"B-BTC_USDT","status":"inactive"}])
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(MarketDataError,match="No active"):
            exchange_candles("coindcx","BTC","intraday",client,now=NOW)

def test_short_stale_or_invalid_responses_fail_closed():
    with httpx.Client(transport=httpx.MockTransport(lambda req:httpx.Response(200,json=[]))) as client:
        with pytest.raises(MarketDataError):
            exchange_candles("binance","BTC","intraday",client,now=NOW)
    with pytest.raises(MarketDataError):
        exchange_candles("binance","DOGE","intraday")
    with pytest.raises(MarketDataError):
        exchange_candles("coindcx","BTC","15sec")

def test_incomplete_four_hour_buckets_not_aggregated():
    base=2000000*14400
    candles=[Bar(base+i*HOUR,102,98,100,100) for i in range(3)]
    assert _aggregate_utc_4h(candles,now=base+4*HOUR)==[]


def test_exchange_scanner_requires_authentication_and_remains_read_only(tmp_path,monkeypatch):
    from fastapi.testclient import TestClient
    from sentinel.main import build_app
    import sentinel.main as module
    now=2_000_000_000
    def fake_candles(exchange,asset,frame):
        interval=(60 if frame=="intraday" else 240)*60
        current=__import__("time").time()
        return [Bar(int(current-(90-i)*interval),120+i,100+i,110+i,110+i)
                for i in range(90)]
    monkeypatch.setattr(module,"exchange_candles",fake_candles)
    with TestClient(build_app(str(tmp_path/"integrations.test.sqlite3"))) as client:
        assert client.get("/research/exchanges/binance/scan/BTC/intraday").status_code==401
        client.post("/auth/register",json={"username":"trial","password":"strong-test-password"})
        login=client.post("/auth/login",json={"username":"trial","password":"strong-test-password"})
        assert login.status_code==200
        token={"Authorization":"Bearer "+login.json()["access_token"]}
        got=client.get("/research/exchanges/binance/scan/BTC/intraday",headers=token)
        assert got.status_code==200
        assert got.json()["exchange"]=="binance"
        assert got.json()["quote_currency"]=="USDT"
        assert got.json()["mode"]=="read_only_research"
        assert client.post("/live/orders",headers=token).status_code==404
        assert client.get("/research/exchanges/unknown/scan/BTC/intraday",headers=token).status_code==422


def test_binance_does_not_silently_skip_bad_rows_or_gaps():
    data=binance_payload()
    data[12]=["bad-row"]
    with httpx.Client(transport=httpx.MockTransport(
            lambda req:httpx.Response(200,json=data))) as client:
        with pytest.raises(MarketDataError):
            exchange_candles("binance","BTC","intraday",client,now=NOW)
    gap=binance_payload()
    del gap[24]
    with httpx.Client(transport=httpx.MockTransport(
            lambda req:httpx.Response(200,json=gap))) as client:
        with pytest.raises(MarketDataError,match="Missing"):
            exchange_candles("binance","BTC","intraday",client,now=NOW)
