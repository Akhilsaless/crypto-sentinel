"""Headless read-only exchange scanner. Can run once or as a single-replica worker.

No authentication keys, balance endpoints or order functions.
Use a persistent volume for per-exchange alert deduplication and heartbeat.
"""
import json
import os
from pathlib import Path
import sys
import time

from sentinel.exchange_public import EXCHANGES, exchange_candles
from sentinel.scanner import PAIRS
from sentinel.scanner_job import scan_once, telegram_notify

STATE_DIR=Path(os.getenv("SENTINEL_STATE_DIR", "sentinel-worker-state"))
INTERVAL_SECONDS=900  # 15 minutes; each alert deduped to its completed candle
HEARTBEAT_MAX_AGE=3600


def run_round(now=None, state_dir=None, providers=EXCHANGES, notify=telegram_notify):
    now=time.time() if now is None else now
    directory=Path(state_dir) if state_dir else STATE_DIR
    directory.mkdir(parents=True,exist_ok=True)
    all_results=[]
    for name in providers:
        if name not in EXCHANGES:
            raise ValueError("Unsupported exchange provider")
        def fetch(symbol,frame,provider=name):
            return exchange_candles(provider,symbol,frame)
        try:
            results=scan_once(notify=notify,state_path=directory / f"{name}.json",
                              fetch=fetch,clock=lambda:now)
        except Exception:
            # Never log alert credentials or provider URLs.
            results=[{"exchange":name,"status":"unavailable",
                      "error":"Scanner or delivery failure; no trade attempted"}]
        for item in results:
            all_results.append({"exchange":name,**item,
                                "quote_currency":"USDT" if "status" not in item else None})
    success=sum(item.get("mode")=="read_only_research" for item in all_results)
    heartbeat={"time":time.time(),"mode":"research_only",
               "live_execution_enabled":False,"available_scans":success,
               "requested_scans":len(providers)*len(PAIRS)*2,
               "status":"ok" if success==len(providers)*len(PAIRS)*2 else "degraded"}
    temporary=directory / "heartbeat.tmp"
    temporary.write_text(json.dumps(heartbeat),encoding="utf-8")
    temporary.replace(directory / "heartbeat.json")
    return heartbeat, all_results


def healthcheck(directory=None,now=None):
    directory=Path(directory) if directory else STATE_DIR
    try:
        heartbeat=json.loads((directory/"heartbeat.json").read_text(encoding="utf-8"))
        current=time.time() if now is None else now
        return (heartbeat.get("mode")=="research_only"
                and heartbeat.get("live_execution_enabled") is False
                and 0 <= current-heartbeat["time"] < HEARTBEAT_MAX_AGE)
    except (OSError,KeyError,ValueError,TypeError):
        return False


def main():
    if len(sys.argv)>1 and sys.argv[1]=="healthcheck":
        return 0 if healthcheck() else 1
    if any(name not in ("--once","--forever") for name in sys.argv[1:]):
        raise SystemExit("Allowed modes: --once or --forever")
    if os.getenv("LIVE_TRADING_ENABLED", "").lower() in ("1","true","yes"):
        raise SystemExit("Live trading is hard-disabled; unset LIVE_TRADING_ENABLED")
    mode="--forever" if "--forever" in sys.argv else "--once"
    while True:
        started=time.monotonic()
        heartbeat,records=run_round()
        print(json.dumps({"health":heartbeat,"results":records}),flush=True)
        if mode=="--once":
            return 0 if heartbeat["status"]=="ok" else 2
        time.sleep(max(5,INTERVAL_SECONDS-(time.monotonic()-started)))


if __name__=="__main__":
    sys.exit(main())
