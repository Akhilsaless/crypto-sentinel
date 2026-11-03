# Crypto Sentinel — Verified engineering handoff
Updated: 2026-11-03

## Goal
Consolidate five trading prototype concepts into Crypto Sentinel, without further Lovable AI credits. Provide safely bounded paper trading and research, with no real-money execution.

## Verified result
- Lovable Crypto Sentinel Phase 1 React source imported to `main`. Original Lovable project unchanged and unpublished.
- The four concept-source Lovable projects were not modified.
- React app includes Signals, Alerts, Journal, Chart Review, Learning, mobile navigation, existing sample trading pages, plus `/paper-lab`.
- Python FastAPI backend at `paper_backend/` includes Argon2 password hashing, hashed bearer sessions, virtual ledgers, paper order idempotency, account isolation, risk tightening, daily realized-loss cap, read-only price provider, paper kill switch, audit records and an educational SMA backtest.
- `/paper-lab` uses relative `/paper-api` requests to the local backend. Development Vite proxy targets `http://127.0.0.1:8000`. No browser-persisted bearer token.
- GitHub Actions validation: frontend test + lint + build, backend test. See Actions for latest results.
- No live order endpoint; no exchange credentials or trading integrations. No additional Lovable credits used.

## Run both locally
Terminal 1:
```
cd paper_backend
python -m venv .venv
# activate .venv
pip install -r requirements.txt
uvicorn sentinel.main:app --host 127.0.0.1 --port 8000
```
Terminal 2, repository root:
```
npm install --no-audit --no-fund
npm run dev
```
Open `http://localhost:8080/paper-lab`. Real market-price requests use public CoinGecko and require a working network connection; if unavailable, orders must fail closed. Tests inject fake data only into an explicitly test-named database. Do not make the backend publicly reachable.

## Four phase acceptance
1. **UI consolidation:** source merged into GitHub. Automated tests and build pass; full real-browser and accessibility review outstanding.
2. **Backend/integration:** local paper API and browser route exist. No verified deployed API, HTTPS, full operational security, or real-provider end-to-end test.
3. **Paper trading/backtest:** server-side virtual orders, limits and historical strategy test implemented. Needs fees/slippage in interactive paper fills, market-data reliability testing, and more realistic simulation.
4. **Production validation:** CI checks are functioning, but this is **NOT production-ready**. Threat modeling, rate limiting, operational monitoring, backup/restore, independent security review, end-to-end browser tests, network/provider tests, robust multi-user infrastructure, and relevant compliance review remain.

## Important constraints
- GitHub repository was detected as **PUBLIC**. Do not commit credentials, wallets, exchange keys, sensitive personal data, or database files. Set repository to private through GitHub settings if desired.
- The imported `package-lock.json` is out of sync with `package.json`. CI presently runs `npm install` rather than `npm ci`; regenerate and commit a consistent lockfile before a reproducible production pipeline.
- The UI's legacy Dashboard and Exchanges pages still use sample data. Only `/paper-lab` can connect to the paper-only development API.
- Server kill switch blocks new virtual orders but does **not** liquidate existing virtual positions. No self-service reset.
- Never present simulation scores or profits as real trading performance.

## Current decision
Continue via GitHub at zero Lovable AI credits; do not deploy publicly or enable real-money trading. Next required milestone is a secure, independently tested staging deployment and complete provider/browser/operational QA.
