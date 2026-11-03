# Crypto Sentinel — Council Engineering Brief
Updated 2026-11-03 (UTC). This is a checkpoint, NOT a finished trading system.

## User outcome and fixed scope
- Build one Crypto Sentinel assistant for **intraday (hourly)** and **swing (4-hourly)** cryptocurrency analysis and, eventually, permissioned automated real-money trading.
- Requirements: accurate market data, explainable entry/exit signals, stop and target scenarios, 24/7 monitoring, actionable notifications, backtesting, risk protection, robust production operations.
- Preserve the original four Lovable concept projects; **no Lovable AI credits**.
- Trading using actual money is the desired future capability; **NO approval to spend, trade, or deploy unverified execution has been inferred**. Exchange/account, credentials, jurisdiction, capital limits and loss budgets remain unspecified.
- The GitHub repository has been public. Never add exchange credentials or personal sensitive information.

## Verified implementation
1. Phase A — read-only market intelligence (new): `sentinel/scanner.py` uses Kraken public OHLC for BTC/ETH/SOL; requests completed 1h and 4h bars, rejects gaps/stale/nonfinite values; computes EMA9/21, RSI14, ATR14 and 20-bar breakout.
2. Phase B — explainable research signals (new): `analyze()` returns `entry_watch`, `exit_watch`, or `no_trade`, with indicator reasons and hypothetical ATR stop/target. This is an **unvalidated example strategy**, not a trade recommendation. Authenticated `GET /research/scan/{symbol}/{frame}`; React `/market-scanner`.
3. Phase C — automation foundation (new): `python -m sentinel.scanner_job` processes six combinations, records dedup state on *confirmed successful alert delivery*, supports optional Telegram environment secrets, and fails closed for provider outage. **No 24/7 worker or recurring schedule is enabled**; no Telegram credentials configured.
4. Phase D — offline regression tests (new): `tests/test_scanner.py` and `tests/test_scanner_job.py` cover feed validity, trend direction, outage, and dedup behaviour. Existing API/frontend CI preserved. **New tests/builds have not been independently verified passing in this session**.
5. Existing: React dashboard and Paper Lab, authenticated FastAPI simulated account ledger, paper orders, historical SMA backtest, paper-only kill switch. No live exchange adapter or live-order endpoint.

## Run the research scanner locally
Install with `python -m pip install -r paper_backend/requirements.txt` then:
```sh
PYTHONPATH=paper_backend python -m pytest -q paper_backend/tests
PYTHONPATH=paper_backend python -m sentinel.scanner_job
```
PowerShell: `$env:PYTHONPATH="paper_backend"; python -m sentinel.scanner_job`.
The script scans ONCE. A scheduler, persistent backend, and deployment health monitoring are still required for recurring operation.
Optional `SENTINEL_TELEGRAM_BOT_TOKEN` and `SENTINEL_TELEGRAM_CHAT_ID` env values enable read-only alerts, with a durable and access-controlled state file. Never commit tokens.

## Phase D / real-money acceptance criteria — blocked
- Reproduce green GitHub CI: Python + frontend tests, lint and production build; test on desktop/mobile browsers.
- Verify Kraken API contracts, rate limits, provider outages, partial bars, UTC synchronization and data provenance across multiple live observations.
- Walk-forward and out-of-sample evaluation with execution fees, slippage, spread, liquidity, funding (if applicable), drawdowns, benchmark comparisons, and no data leakage.
- Run forward paper-trading over a meaningful sample of real market conditions; document wins, losses and statistical uncertainty before considering live trading.
- Secure server deployment with HTTPS, access control, rate limiting, secret management, backups, persistence, logs, alert delivery tests, uptime monitoring, incident response and verified rollback.
- Verify exchange-account requirements and jurisdictional compliance. Add a **separate, opt-in, tightly capped** live-order service only after security review; API keys must be scoped to trade only, withdrawals disabled, and never placed in browser/localStorage/GitHub.
- Require max account exposure, max loss/trade/day, limits per instrument, position sizing, order types, risk on open orders, exchange minimum quantities and testnet validation.
- Implement exchange state reconciliation, idempotent client order IDs, partial fills, rejections, retries, network timeout handling, outage halt, human-controlled kill switch and order-state observability.
- Perform an independent security/code review and complete end-to-end staging tests.
- **Live trading remains hard-disabled**. No execution of real money orders has occurred.

## Decision history
- 2026-11-03: Kept existing paper-only server and added separate *read-only* scanner rather than converting it to live execution. Reason: live accounts/limits are unspecified, existing controls lack real-broker reconciliation and release verification. Revisit when evidence and explicit limits are supplied.
- 2026-11-03: Chose Kraken completed hourly/four-hourly candles as an initial public research feed; avoid trading based on incomplete bars. Revisit if provider contract, availability or freshness tests fail.
- 2026-11-03: Alert delivery opt-in and externally scheduled rather than silently activating GitHub jobs or paid services. Revisit when deployment destination, alert channel and budget are confirmed.

## Next action
Run CI/test suite and inspect actual failure logs; fix any failures; validate live provider responses; deploy a protected staging research scanner; then test alerts and run prolonged forward paper monitoring. Do not claim four phases are complete until each measurable release gate is satisfied.
