"""Offline alert lifecycle regression tests."""
import json
from sentinel.scanner import Bar
from sentinel.scanner_job import scan_once
from sentinel import scanner_job

NOW=2_000_000_000

def fixture(symbol,frame):
    minutes=60 if frame=="intraday" else 240
    step=minutes*60
    # Strong uptrend with last completed candle one interval ago.
    return [Bar(NOW-(90-i)*step,100+i*0.3+0.5,100+i*0.3-0.5,100+i*0.3)
            for i in range(90)]

def test_scans_all_six_combinations_without_sending_orders():
    results=scan_once(fetch=fixture,clock=lambda:NOW)
    assert len(results)==6
    assert {r["symbol"] for r in results}=={"BTC","ETH","SOL"}
    assert {r["timeframe"] for r in results}=={"intraday","swing"}
    assert all(r["mode"]=="read_only_research" for r in results)

def test_alerts_dedupe_only_after_delivery(tmp_path,monkeypatch):
    state=tmp_path/"signals.json"
    delivered=[]
    # Force one entry_watch outcome so the notifier state path is tested.
    monkeypatch.setattr(scanner_job,"analyze",lambda symbol,frame,bars,now: {
        "symbol":symbol,"timeframe":frame,"signal":"entry_watch",
        "as_of_candle":111,"mode":"read_only_research"})
    first=scan_once(notify=lambda record:False,fetch=fixture,clock=lambda:NOW,state_path=state)
    assert len(first)==6
    assert json.loads(state.read_text())=={}
    scan_once(notify=lambda record:delivered.append(record) or True,
              fetch=fixture,clock=lambda:NOW,state_path=state)
    assert len(delivered)==6
    scan_once(notify=lambda record:delivered.append(record) or True,
              fetch=fixture,clock=lambda:NOW,state_path=state)
    assert len(delivered)==6

def test_data_outage_never_emits_alerts(tmp_path):
    def offline(symbol,frame):
        from sentinel.scanner import MarketDataError
        raise MarketDataError("provider offline")
    delivered=[]
    result=scan_once(notify=lambda record:delivered.append(record) or True,
                     fetch=offline,clock=lambda:NOW,state_path=tmp_path/"s.json")
    assert len(result)==6
    assert all(r["status"]=="unavailable" for r in result)
    assert delivered==[]
