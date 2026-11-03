"""Offline scanner regression tests: deterministic synthetic research fixtures."""
import time
import pytest
from sentinel.scanner import Bar, MarketDataError, analyze, validate_bars, kraken_candles

NOW = 2_000_000_000
STEP = 3600

def bars(trend=0.2):
    return [Bar(int(NOW - (90-i)*STEP), 100 + trend*i + 0.6,
                100 + trend*i - 0.6, 100 + trend*i) for i in range(90)]

def test_steady_rally_does_not_force_a_buy():
    result=analyze("BTC","intraday",bars(),NOW)
    assert result["signal"] in ("entry_watch","no_trade")
    assert result["mode"]=="read_only_research"
    assert result["hypothetical_long_target_usd"]>result["price_usd"]

def test_downtrend_never_returns_entry_watch():
    result=analyze("ETH","intraday",bars(-0.2),NOW)
    assert result["signal"]!="entry_watch"

def test_stale_gap_duplicate_and_invalid_prices_fail_closed():
    valid=bars()
    with pytest.raises(MarketDataError):
        validate_bars(valid,60,NOW + 4*STEP)
    with pytest.raises(MarketDataError):
        validate_bars(valid + [valid[-1]],60,NOW)
    with pytest.raises(MarketDataError):
        validate_bars(valid[:-1]+[Bar(valid[-1].timestamp,1,2,3)],60,NOW)
    with pytest.raises(MarketDataError):
        validate_bars(valid[:30]+valid[40:],60,NOW)

def test_rejects_unsupported_symbols_before_network():
    with pytest.raises(MarketDataError):
        kraken_candles("DOGE","intraday")
    with pytest.raises(MarketDataError):
        kraken_candles("BTC","five_second")

def test_flat_market_rsi_is_neutral():
    from sentinel.scanner import rsi
    assert rsi([100.0]*70)==50.0

def test_kraken_ohlc_excludes_unfinished_final_bar():
    import httpx
    rows=[]
    for i in range(90):
        ts=int(NOW-(90-i)*STEP)
        p=100+i*0.2
        rows.append([ts,str(p),str(p+0.6),str(p-0.6),str(p),"0","1","1"])
    rows.append([int(NOW), "100", "999999", "1", "999999", "0", "1", "1"])
    def handler(request):
        assert request.url.params["pair"]=="XBTUSD"
        return httpx.Response(200,json={"error":[],"result":{"XXBTZUSD":rows,"last":NOW}})
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        observed=kraken_candles("BTC","intraday",client=client,now=NOW)
    assert len(observed)==90
    assert observed[-1].close < 999999

def test_provider_errors_fail_closed():
    import httpx
    def handler(request):
        return httpx.Response(200,json={"error":["EQuery:Rate limit exceeded"],"result":{}})
    with httpx.Client(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(MarketDataError):
            kraken_candles("BTC","intraday",client=client,now=NOW)
