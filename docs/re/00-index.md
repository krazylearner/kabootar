# Kabootar Escrow Platform — Design Specification

Status: frozen v1 (2026-10-30) · Audience: developers, operators, investors, OSS community
Scope: **specification only** — no implementation
License: Apache-2.0 (see `../../LICENSE`)

## Purpose

`kabootar` is a channel-agnostic escrow platform. Telegram is the first channel, the
web app is a first-class channel, and Discord/Slack are specified but not built. The
platform pairs a community/listing surface with a custodial USDT escrow engine, an
INR manual-settlement flow, and a single-operator console.

This repo contains the reverse-engineering of a live Telegram escrow community
(`@CryptoIndiaUnited`, group `-1238995316`) and the target design derived from it.

## Reading order

| # | Document | What it answers |
|---|---|---|
| 00 | `00-index.md` | Scope, decisions, how to read this |
| 01 | `01-source-analysis.md` | What the source group is and how it works |
| 02 | `02-architecture.md` | Modules, ports, events, broker topology |
| 03 | `03-domain-model.md` | Entities, relationships, invariants |
| 04 | `04-deal-protocol.md` | Deal state machine and message contract |
| 05 | `05-adapters.md` | Channel port, capability flags, per-channel mapping |
| 06 | `06-community-and-listings.md` | Native communities + core listings |
| 07 | `07-custody-and-payments.md` | Keys, address pool, chains, INR |
| 08 | `08-operator-and-wizard.md` | Operator console + first-run wizard |
| 09 | `09-security-and-limitations.md` | Threat model, declined controls, known limitations |
| 10 | `10-deployment-and-ops.md` | Docker Compose topology, runbook |

Schemas live in `../../schemas/`.

## Decision summary

| Axis | Decision |
|---|---|
| Core | Channel-agnostic escrow + listings; modular monolith with adapter ports |
| Adapters | Telegram + Web first; Discord/Slack spec-only; web is a first-class adapter |
| Community | Adapter-native; core listings are posted into each native community |
| Identity | Per-channel accounts; web via configurable OIDC; no cross-channel linking |
| Deals | Single-channel only; native entry per adapter → one core command |
| Reputation | Completed-deal count + volume |
| Roles | No user roles; one system operator principal + TOTP 2FA |
| Messaging | RabbitMQ domain events via transactional outbox |
| Database | PostgreSQL |
| Custody | Single hot key; static deposit-address pool per chain, one address per deal |
| Chain watch | RPC polling; 15 BSC / 20 TRON confirmations |
| Rails | USDT BSC + TRC20; manual INR with proof upload |
| Disputes | Operator-final; evidence stored in core |
| Eligibility | Open to anyone |
| Monitoring | None (no KYC, sanctions, or velocity checks) |
| Branding | Clean re-brand — do not reuse the source group's name or copy |
| Fee | Wizard-configured; default 0.5% with 0.5 USDT minimum |
| Deployment | Docker Compose: app + RabbitMQ + PostgreSQL |

## Non-goals

- No implementation, migrations, or runnable code in this repository.
- No Discord or Slack adapter beyond the contract in `05-adapters.md`.
- No cross-channel identity or cross-channel deals.
- No KYC, sanctions screening, account/transaction surveillance, or appeal process.

## Consistency notes

Three decisions are easy to misread; they mean the following:

1. **"No roles" means no user-facing role system.** There is still exactly one system
   operator principal, created by the wizard, with TOTP 2FA. It is a principal, not a
   role hierarchy.
2. **"No KYC" also applies to disputes.** The source group may demand KYC during a
   dispute; this design does not. The operator decides on in-room evidence only.
3. **"No monitoring" means no account/transaction surveillance** — no KYC, sanctions,
   velocity, or AML monitoring. In-flow fraud controls remain mandatory: never ask for
   OTP/2FA codes, per-deal address assignment, confirmation thresholds, immutable
   evidence, and operator review of INR proof.

## Decision records

Architecture decisions are recorded in `../adr/`:

- `0001` channel-agnostic core with adapter ports
- `0002` web is a channel adapter, not a mirror
- `0003` per-channel identity
- `0004` single hot-wallet custody
- `0005` static deposit-address pool
- `0006` no KYC, open registration
- `0007` operator-final disputes
- `0008` RabbitMQ with a transactional outbox

## Known limitations

This design is custodial with a single hot-wallet key, a static deposit-address pool,
open registration, per-channel identity with no cross-channel deals, operator-final
disputes, and no KYC, sanctions, or velocity monitoring. A server compromise or a
malicious operator can move all user funds, and users have no appeal or identity
recourse. Operating a custodial escrow service for third parties in most jurisdictions
also requires licensing and AML/KYC obligations this design does not implement. Deploy
only with legal advice and at your own risk.

See `09-security-and-limitations.md` for the full statement and threat model.
