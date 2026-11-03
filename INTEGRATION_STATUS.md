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
