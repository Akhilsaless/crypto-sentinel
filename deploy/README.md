# CoinDCX / Binance market scanner deployment

**Status: deployment files only until a host is provisioned and runtime verified.**
This worker uses public spot candles without authenticated account keys and cannot buy/sell.
It scans BTC/ETH/SOL at 1h and 4h timeframes every 15 minutes; signals remain experimental.

## Existing GitHub Actions option

The separate `CoinDCX Binance Read-Only Market Check` workflow is scheduled every
hour on the default branch and can be launched manually. Its execution is
best-effort (scheduled runs can be delayed/omitted) and **does not** constitute
an always-on 24/7 service. No exchange account or order execution is attached.
Its transient runner state is not a durable alert store.

## Persistent 24/7 deployment on an owned Linux host

A server with Docker + Compose, outbound HTTPS to exchange public-data endpoints,
and permissions to pull this repository is required. Confirm hosting charges
before provisioning. From the repository root:

```bash
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs --tail=100 crypto-sentinel-scanner
```

Expected: container healthy, state volume persists `heartbeat.json`,
`live_execution_enabled=false`, `available_scans=12`. A provider may be
unavailable or block the server's region; then status is degraded and no signal
is generated for that market. Never quietly substitute another exchange.

For optional Telegram research alerts, inject `SENTINEL_TELEGRAM_BOT_TOKEN`
and `SENTINEL_TELEGRAM_CHAT_ID` via the host's secret manager. Without them,
the worker still scans and writes heartbeat; it does not send alerts.
Keep the token off GitHub, browser bundles, command history, logs, and screenshots.
Single replica only: local state file is not safe for distributed workers.

## Release evidence required

- Validate Docker build, host status, provider availability, and uptime from outside.
- Verify alert delivery, duplicate prevention and recovery after restarts.
- Secure the host, audit retention, backup/restore, monitoring and paging.
- Test prolonged network failures and provider API schema changes.
- Do not expose the existing development FastAPI service publicly.
- Do not set `LIVE_TRADING_ENABLED`; the worker rejects that flag.
- No live exchange keys are accepted; no real-money trade route exists.

CoinDCX documentation currently says API keys do not have read-only
permissions, so never request or store CoinDCX private keys in this worker.
Binance public feed is `https://data-api.binance.vision/api/v3/klines`.
The spot quotes are in USDT, not guaranteed USD-equivalent.
