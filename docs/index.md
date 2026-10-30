# Kabootar

A channel-agnostic escrow platform: a community and listing surface plus custodial USDT escrow with manual INR settlement, run by a single operator.

This site is the design specification, frozen at **v1**. It covers the architecture, domain model, deal protocol, adapters, custody, disputes, and operations — no implementation.

## Read in order

1. [Architecture](re/02-architecture.md) — modules, ports, events, broker topology
2. [Domain model](re/03-domain-model.md) — entities, invariants, PII policy
3. [Deal protocol](re/04-deal-protocol.md) — state machine and content contract
4. [Adapters](re/05-adapters.md) — channel port, capability flags, per-channel mapping
5. [Custody and payments](re/07-custody-and-payments.md) — keys, address pool, chains, INR

The full reading order and decision summary live in [docs/re/00-index.md](https://github.com/krazylearner/kabootar/blob/main/docs/re/00-index.md).

## Reference

- [Decision records](adr/0001-channel-agnostic-core-adapter-ports.md) — why each major trade-off was made
- [Glossary](glossary.md) — the vocabulary the spec uses, and the synonyms it avoids
- [JSON schemas](https://github.com/krazylearner/kabootar/tree/main/schemas) — machine-readable counterparts to the domain model

!!! warning "Known limitations"
    This design is custodial with a single hot-wallet key, a static deposit-address pool, open registration, per-channel identity, operator-final disputes, and no KYC or velocity monitoring. A server compromise or a malicious operator can move all user funds. Operating a custodial escrow service for third parties usually also requires licensing this design does not implement. See [Security and limitations](re/09-security-and-limitations.md).
