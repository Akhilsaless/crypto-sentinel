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
   Additional evaluation: `sentinel/evaluation.py` executes scanner rules on a chronological 30% holdout using only closed prior candles, next-bar opens, fee/slippage assumptions, stop-first behavior, max 20% notional and 1% planned stop risk. `/research/evaluate/{symbol}/{frame}` and the market scanner UI expose results. This is an unvalidated model, **not evidence of profitability**.
3. Phase C — automation foundation (new): `python -m sentinel.scanner_job` processes six combinations, records dedup state on *confirmed successful alert delivery*, supports optional Telegram environment secrets, and fails closed for provider outage. **No 24/7 worker or recurring schedule is enabled**; no Telegram credentials configured.
4. Phase D — offline regression tests (new): `tests/test_scanner.py` and `tests/test_scanner_job.py` and `tests/test_evaluation.py` cover feed validity, trend direction, outage, dedup, fee sensitivity and chronological holdout behavior. Existing API/frontend CI preserved. **New tests/builds have not been independently verified passing in this session**.
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

## CI findings during the current session
- GitHub Actions run 41591484574: backend green; frontend red (mobile navigation test broken by new sidebar item).
- GitHub Actions run 41591733138: backend green; frontend had one outdated expected route count. Both navigation defects were corrected.
- GitHub Actions run 41591868738: frontend green; backend failed one malformed synthetic Kraken OHLC fixture. Fixture was corrected at commit 7ad6849.
- Latest additions to the evaluation engine and tests require fresh independent CI verification. **Do not infer green status from the absence of a failure email.**

## 2026-11-03 — CoinDCX + Binance integration/deployment milestone

**New explicit requirement:** both CoinDCX and Binance, live public market feeds, both intraday and swing research, and eventual continuously hosted 24/7 automation with separate verified and permissioned real-money trading.

### Code delivered to GitHub (not yet production verified)
- `sentinel/exchange_public.py`: no-credential, read-only BTC/ETH/SOL **spot USDT** candle adapters. Binance public `/api/v3/klines` 1h/4h; CoinDCX actual active pair from `/exchange/v1/markets_details` and spot `/market_data/candles` 1h, with UTC-complete 4h aggregation. Reject malformed/missing/stale candles. No fallback or manufactured prices.
- Backend authenticated routes `/research/exchanges/{exchange}/scan/{symbol}/{frame}` and `/research/exchanges/{exchange}/evaluate/{symbol}/{frame}`. No exchange account data or authenticated orders.
- React market scanner exchange selector; Exchanges page explicitly states adapter versus verified connectivity and USDT vs USD distinction.
- `sentinel/exchange_worker.py`: read-only multi-exchange one-shot and 15-minute looping worker, heartbeat, degraded mode, durable per-exchange local dedup state and opt-in Telegram research alerts.
- `deploy/Dockerfile.scanner`, `deploy/docker-compose.yml`: single replica, non-root, read-only container filesystem, no inbound ports, persistent scanner volume. The container was **not built or run on a host** in this session.
- `.github/workflows/read-only-exchange-scan.yml`: scheduled hourly, manual and code-change-triggered **best-effort** cloud public-market check. GitHub Actions schedule does **not** guarantee 24/7 continuous uptime, and runtime success has not yet been confirmed.
- `tests/test_exchange_public.py` and `tests/test_exchange_worker.py`: offline endpoint/provider/worker tests committed; latest-run CI outcome still requires verification.

### Relevant official API facts and safeguards
- Binance spot public market-data endpoint `https://data-api.binance.vision/api/v3/klines` requires no credentials; official Binance docs.
- CoinDCX public candles and markets details are unauthenticated. Official CoinDCX API FAQ explicitly states that it currently does **not** provide read-only authenticated API keys. **Do not gather CoinDCX private API keys for monitoring or assume granular key permissions.**
- Binance and CoinDCX spot quotes in USDT are not identical to cash USD. Do not label them guaranteed USD.
- No account balances, authenticated exchange connections, exchange withdrawals, real order placement, or 24/7 hosted scanner verified.

### Current blockers and next actions
1. Latest GitHub CI validation and cloud provider smoke job need a confirmed green result. Tests/builds cannot be marked passing from commits alone.
2. A user-authorized persistent Docker host or equivalent always-on service plus acceptable ongoing cost and access must be selected before true 24/7 deployment. No Crypto Sentinel Vercel project was found in the connected project search; Vercel static frontend alone is not a durable worker.
3. Host-side checks required: public market availability from server region, outbound networking, secrets, monitoring, alert delivery, backup/restore, restart recovery, network outage and durability.
4. Explicit separately approved exchange account, jurisdiction, risk budget and spending limits; verified supported API scopes; and independent security/order lifecycle tests are mandatory prior to any real-money trade. CoinDCX keys require enhanced caution due to lack of read-only permissions.
5. Live trading **hard disabled**. User's intent to eventually trade real money does not supply valid per-order limits, keys, credentials, production approval or permission to spend infrastructure funds.

**Decision:** read-only public market integration and deployment scaffolding proceed at zero known direct spend; user money remains untouched. No production completion claim until test, host and account gates clear.
