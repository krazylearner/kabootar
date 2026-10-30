# 10 — Deployment and Operations

## 1. Compose topology

```mermaid
flowchart LR
  C[Client] --> P[Caddy / reverse proxy]
  P --> A[app: web + adapters]
  A --> PG[(PostgreSQL)]
  A --> MQ[(RabbitMQ)]
  W[worker: chain watcher + outbox relay] --> PG
  W --> MQ
  W --> RPC[(BSC / TRON RPC)]
  A --> RPC
```

| Service | Role | Notes |
|---|---|---|
| `proxy` | TLS, routing | Caddy with automatic certs |
| `app` | HTTP (web + operator) and adapter workers | one process, modular monolith |
| `worker` | outbox relay, chain watcher, timers | can scale independently |
| `postgres` | primary datastore | volume `pgdata` |
| `rabbitmq` | event bus | volume `mqdata`, management plugin optional |

Evidence files use a volume or an S3-compatible bucket; if a bucket, set
`EVIDENCE_BACKEND=s3`.

## 2. Environment

| Variable | Required | Example |
|---|---|---|
| `DATABASE_URL` | yes | `postgres://app:***@postgres:5432/kabootar` |
| `RABBITMQ_URL` | yes | `amqp://app:***@rabbitmq:5672/` |
| `PUBLIC_BASE_URL` | yes | `https://escrow.example` |
| `SECRET_KEY` | yes | 32+ random bytes |
| `OPERATOR_TOTP_SECRET` | set by wizard | — |
| `BSC_RPC_URL` | yes | `https://bsc-dataseed…` |
| `TRON_RPC_URL` | yes | `https://api.trongrid.io` |
| `USDT_BSC` | yes | contract address |
| `USDT_TRON` | yes | contract address |
| `SIGNER_BACKEND` | yes | `kms` / `env` |
| `SIGNER_KEY_REF` | yes | KMS key id |
| `TELEGRAM_BOT_TOKEN` | if TG | — |
| `OIDC_ISSUER` | if web | — |
| `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` | if web | — |
| `EVIDENCE_BACKEND` | no | `volume` / `s3` |

Secrets are injected at runtime; never baked into images.

## 3. First boot

1. `docker compose up -d postgres rabbitmq`.
2. `docker compose run --rm app migrate`.
3. `docker compose up -d app worker proxy`.
4. Open `/setup`; complete the wizard; it runs connectivity checks and a dry run.
5. Import the deposit-address pool.
6. Go live; verify `/healthz` and a synthetic listing.

## 4. Health and observability

- `/healthz` — process alive.
- `/readyz` — DB, broker, RPC, signer reachable.
- Metrics (Prometheus): deals by state, deposit latency, confirmation lag, outbox lag,
  queue depth, pool free/assigned, hot-wallet balance, signer cap usage.
- Logs: structured JSON; correlation id on every event; **never** log addresses,
  proofs, or key material.
- Alerts: pool exhausted, reconciliation mismatch, signer cap hit, queue lag > 5 min,
  RPC height stalled, dispute older than SLA.

This is **system** monitoring only. No user-behavior or transaction monitoring is
implemented.

## 5. Backups

- PostgreSQL: nightly base backup + WAL archiving; restore test monthly.
- RabbitMQ: definitions export; queues are transient, outbox is in Postgres.
- Evidence: bucket versioning or volume snapshot.
- Secrets: backed up per provider policy; never in the DB backup.

## 6. Scaling

- `app` and `worker` are stateless; scale horizontally behind the proxy.
- The chain watcher holds a lease (`settings.watcher_lease`) so only one instance polls
  a given chain at a time.
- RabbitMQ consumers scale with queue depth; events are keyed by room for ordering.
- PostgreSQL is the first bottleneck; add read replicas for reporting only.

## 7. Runbook

### Pause everything
```bash
# set settings.paused = true via operator console or SQL
UPDATE settings SET value='true' WHERE key='paused';
```

### Rotate the Telegram token
1. Revoke in BotFather, issue a new token.
2. Update the secret, restart `app`.
3. Verify `getMe` and a synthetic update.

### Rotate the signer key
1. Move balances to the new wallet (manual, out of band).
2. Import new pool addresses.
3. Retire old addresses after cooldown.
4. Update `SIGNER_KEY_REF`; restart `worker`.

### Add pool addresses
1. Generate offline with the custody key.
2. Validate checksums and chain.
3. Import via operator console; publish the updated list.

### Recover a lost operator
1. Use recovery codes at `/operator/recover`.
2. If lost, restore the operator row from backup and re-enroll TOTP.

## 8. SLOs (suggested)

| Metric | Target |
|---|---|
| Web availability | 99.5% monthly |
| Deposit detection | < 30 s from inclusion |
| Release broadcast | < 60 s after seller action |
| Dispute first response | < 24 h |
| Restore drill | < 2 h RTO |

## 9. Upgrade procedure

1. Back up DB.
2. Drain workers (`settings.draining = true`).
3. Apply migrations (forward-only).
4. Deploy new images; run smoke checks.
5. Re-enable workers; verify outbox drains.

## 10. What this deployment does not give you

High availability of the **key**, insurance, regulatory cover, or recovery from a
malicious operator. See `09-security-and-limitations.md`.
