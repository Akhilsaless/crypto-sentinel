"""Offline worker tests; no live provider or notification network calls."""
import json
from sentinel import exchange_worker
from sentinel.scanner import Bar, MarketDataError

NOW=2_000_000_000
def fixture(provider, symbol, frame):
    interval=(60 if frame=="intraday" else 240)*60
    return [Bar(NOW-(90-i)*interval, 102+i, 98+i, 100+i, 100+i)
            for i in range(90)]


def test_both_exchange_worker_writes_heartbeat_and_no_trades(tmp_path,monkeypatch):
    monkeypatch.setattr(exchange_worker,"exchange_candles",fixture)
    heartbeat,records=exchange_worker.run_round(
        now=NOW,state_dir=tmp_path,notify=None)
    assert heartbeat["mode"]=="research_only"
    assert heartbeat["live_execution_enabled"] is False
    assert heartbeat["available_scans"]==12
    assert len(records)==12
    assert {r["exchange"] for r in records}=={"binance","coindcx"}
    saved=json.loads((tmp_path/"heartbeat.json").read_text())
    assert saved["available_scans"]==12


def test_provider_failure_sets_degraded_and_does_not_invent_signal(tmp_path,monkeypatch):
    def unavailable(provider,symbol,frame):
        raise MarketDataError("feed unavailable")
    monkeypatch.setattr(exchange_worker,"exchange_candles",unavailable)
    heartbeat,records=exchange_worker.run_round(
        now=NOW,state_dir=tmp_path,notify=None)
    assert heartbeat["status"]=="degraded"
    assert heartbeat["available_scans"]==0
    assert all(r.get("status")=="unavailable" for r in records)


def test_healthcheck_requires_recent_explicit_paper_only_heartbeat(tmp_path):
    (tmp_path/"heartbeat.json").write_text(json.dumps({
        "time":1000,"mode":"research_only","live_execution_enabled":False}))
    assert exchange_worker.healthcheck(tmp_path, now=1100)
    assert not exchange_worker.healthcheck(tmp_path, now=5000)
    (tmp_path/"heartbeat.json").write_text(json.dumps({
        "time":1100,"mode":"research_only","live_execution_enabled":True}))
    assert not exchange_worker.healthcheck(tmp_path, now=1100)
