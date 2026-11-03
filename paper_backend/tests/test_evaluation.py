"""Fee-aware holdout evaluator: deterministic isolated tests."""
import math
import pytest
import sentinel.evaluation as evaluator
from sentinel.scanner import Bar, MarketDataError

NOW=2_000_000_000
STEP=3600
def candles(count=250):
    out=[]
    for i in range(count):
        p=100+0.08*i+math.sin(i/5)*1.2
        out.append(Bar(NOW-(count-i)*STEP,p+2,p-2,p,p))
    return out

def test_holdout_is_chronological_and_paper_only():
    result=evaluator.evaluate(candles(),"intraday",now=NOW)
    assert result["mode"]=="historical_research_only"
    assert result["holdout_bars"]==75
    assert result["assumptions"]["entry"]=="next_bar_open"
    assert result["assumptions"]["stop_target_same_bar"]=="stop_first"
    assert all(t["timestamp"]>=result["holdout_start"] for t in result["trades"])

def test_fee_and_slippage_decrease_equity_when_entering(monkeypatch):
    monkeypatch.setattr(evaluator,"analyze",lambda symbol,frame,bars,now: {
        "signal":"entry_watch", "hypothetical_long_stop_usd":50,
        "hypothetical_long_target_usd":99999})
    no_cost=evaluator.evaluate(candles(),"intraday",fee_bps=0,slippage_bps=0,now=NOW)
    expensive=evaluator.evaluate(candles(),"intraday",fee_bps=80,slippage_bps=80,now=NOW)
    assert expensive["ending_equity_usd"]<no_cost["ending_equity_usd"]
    assert all(t["side"]=="buy" for t in no_cost["trades"])

def test_bogus_or_missing_ohlc_cannot_evaluate():
    bad=candles()
    bad[10]=Bar(bad[10].timestamp,bad[10].high,bad[10].low,bad[10].close,None)
    with pytest.raises(MarketDataError):
        evaluator.evaluate(bad,"intraday",now=NOW)
    with pytest.raises(MarketDataError):
        evaluator.evaluate(candles(100),"intraday",now=NOW)
    with pytest.raises(MarketDataError):
        evaluator.evaluate(candles(),"intraday",fee_bps=-1,now=NOW)
