"""One-shot, read-only scanner for cron/systemd/GitHub scheduler use.

Example: PYTHONPATH=paper_backend python -m sentinel.scanner_job
Optional delivery: SENTINEL_TELEGRAM_BOT_TOKEN and SENTINEL_TELEGRAM_CHAT_ID
Secrets must remain in a deployment secret manager, never the repository.
No scheduler is automatically enabled by importing or running the package.
"""
import json
import os
import pathlib
import sys
import time
import httpx
from sentinel.scanner import PAIRS, FRAMES, MarketDataError, analyze, kraken_candles

def scan_once(notify=None, state_path=None, fetch=kraken_candles, clock=time.time):
    """Deduplicate alerts by completed candle and classification.

    A failing feed never creates a signal. State is local development storage;
    use durable transactional storage for distributed production workers.
    """
    path=pathlib.Path(state_path) if state_path else None
    state={}
    if path and path.exists():
        state=json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(state,dict):
            raise ValueError("Invalid scanner state file")
    output=[]
    new_state=dict(state)
    for symbol in PAIRS:
        for frame in FRAMES:
            key=f"{symbol}:{frame}"
            try:
                record=analyze(symbol,frame,fetch(symbol,frame),clock())
                output.append(record)
                marker=f"{record['as_of_candle']}:{record['signal']}"
                if record["signal"] in ("entry_watch","exit_watch") and state.get(key)!=marker:
                    if notify and notify(record) is True:
                        new_state[key]=marker
            except MarketDataError as err:
                output.append({"symbol":symbol,"timeframe":frame,"status":"unavailable","error":str(err)})
    if path:
        path.parent.mkdir(parents=True,exist_ok=True)
        staging=path.with_suffix(path.suffix+".tmp")
        staging.write_text(json.dumps(new_state,sort_keys=True),encoding="utf-8")
        staging.replace(path)
    return output

def telegram_notify(record):
    token=os.environ.get("SENTINEL_TELEGRAM_BOT_TOKEN")
    chat=os.environ.get("SENTINEL_TELEGRAM_CHAT_ID")
    if not token or not chat:
        return False
    message=(f"Crypto Sentinel RESEARCH ONLY: {record['symbol']} {record['timeframe']} "
             f"{record['signal']} at indicative ${record['price_usd']} USD. "
             f"Candle {record['as_of_candle']}. NOT a trade recommendation.")
    response=httpx.post(f"https://api.telegram.org/bot{token}/sendMessage",
                        json={"chat_id":chat,"text":message},timeout=10)
    response.raise_for_status()
    return True

def main():
    state=os.environ.get("SENTINEL_SCANNER_STATE","sentinel-scanner-state.json")
    records=scan_once(notify=telegram_notify,state_path=state)
    print(json.dumps(records,indent=2))
    if any(row.get("status")=="unavailable" for row in records):
        return 2
    return 0

if __name__=="__main__":
    sys.exit(main())
