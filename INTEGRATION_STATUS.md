# Crypto Sentinel — Integration & Release Gate

Current repository: imported Lovable Phase 1 React UI plus a **separate**, paper-only FastAPI development backend under `paper_backend/`.

**Not production ready.** The frontend still displays synthetic portfolio/signal data. It does not yet authenticate to the Python backend. Do not deploy it as a real trading product or advertise paper executions as connected until integrated and tested.

## Run locally
Frontend: `npm ci && npm test && npm run dev`.

Backend: `python -m venv .venv`, activate it, `pip install -r paper_backend/requirements.txt`, then from `paper_backend`: `uvicorn sentinel.main:app --reload`.

Backend test: from `paper_backend`: `pytest -q`.

## Safety boundaries
- Never place exchange API keys or secrets in Vite frontend variables, source code, or this repository.
- There are no routes to execute live orders; market adapter is read-only.
- The kill switch blocks new paper orders but does not liquidate positions.
- A development market adapter is not a guarantee of broker fill prices; fees and slippage must be modeled before realistic paper simulations.
- The development auth and SQLite setup require rate limiting, CSRF/CORS/session threat model, credential recovery, deployment secrets, monitoring, and adversarial tests before public exposure.
- Local alerts do not run in the background; sample signal scores are not financial recommendations.
- GitHub repo was found PUBLIC at import time. Do not add personal information or trading credentials.

## Work remaining to close phases 2–4
1. Independently run CI and fix any test/build failures.
2. Implement versioned `/api` client in React and an auth/session flow; keep sample-vs-paper contexts separate.
3. Add backed paper-account view and explicit order confirmation; prove no live trading path exists.
4. Validate quote freshness, source reliability, fees/slippage, delayed-data UI and outage failure modes.
5. Security review and public deployment review (hosting, backups, abuse controls, audit integrity, rollback).
6. Complete mobile/desktop accessibility and end-to-end smoke tests.

## November 3, 2026 — current implementation checkpoint

- Phase 1: Imported React research UI and its sample-only screens are preserved. No Lovable credits used and source Lovable projects were not edited.
- Phase 2: Separate FastAPI paper engine with login, user isolation, virtual portfolio/orders, backtesting, read-only quote lookup, idempotent order IDs, risk caps, emergency stop and server-side stale-quote rejection is present. Development-only, not public-user hardened.
- Phase 3: The existing React `/paper-lab` screen uses a local Vite same-origin `/paper-api` proxy; its session token is held in memory, not persisted. Frontend order submission now requires a fresh non-sample quote, order confirmation, and an enabled paper account. Sample dashboard remains separate. Added `paperApi.test.ts` coverage for auth header and proxy failure responses.
- Phase 4: CI workflow includes Python and frontend validation (plus lint). Live deployment, multi-device end-to-end testing, fee/slippage modeling for paper execution, quote-source reliability monitoring, application abuse protection, credential recovery, audit integrity and independent security review are **not verified/unfinished**. Release is blocked.

### Local acceptance commands

```sh
python -m pip install -r paper_backend/requirements.txt
(cd paper_backend && python -m pytest -q)
npm install --no-audit --no-fund
npm test -- --run
npm run lint
npm run build
# shell A: (cd paper_backend && uvicorn sentinel.main:app --host 127.0.0.1 --port 8000)
# shell B: npm run dev
# Open http://localhost:8080/paper-lab ; use demo credentials only
```

### Safety smoke checks before any public deployment

1. Backend offline: paper account login/order submission must fail closed; never show a synthetic order as confirmed.
2. Sample or expired quote: UI rejects submission; backend independently rejects samples (except .test.sqlite3 fixtures) and quotes older than 120 seconds.
3. Paper account A cannot read user B orders or positions; missing/expired bearer token returns 401.
4. Confirmed paper order affects virtual funds only; no endpoint or adapter can place a live exchange order.
5. Active kill switch rejects new paper orders; it does NOT close virtual holdings. No automatic reset.
6. Credentials and tokens never enter logs, query strings, Vite variables, screenshots or repository commits.

**Release decision: BLOCKED pending passing CI, independent browser tests and security/operational controls.** This file records implementation, not an assertion that all four phases are production complete.
