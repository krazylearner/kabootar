# 09 — Security and Limitations

## 1. Known limitations (normative)

> This design is custodial with a single hot-wallet key, a static deposit-address pool,
> open registration, per-channel identity with no cross-channel deals, operator-final
> disputes, and no KYC, sanctions, or velocity monitoring. A server compromise or a
> malicious operator can move all user funds, and users have no appeal or identity
> recourse. Operating a custodial escrow service for third parties in most jurisdictions
> also requires licensing and AML/KYC obligations this design does not implement. Deploy
> only with legal advice and at your own risk.

## 2. Threat model

Actors: external attacker, malicious user, colluding pair, compromised server,
malicious operator, chain reorg, insider with deploy access.

| Threat | Vector | Mitigation in this design | Residual |
|---|---|---|---|
| Hot-key theft | server compromise, leaked env | secret store, signer caps, idempotency, audit | **High** — key can be drained |
| Operator rug-pull | operator releases to self | transfer must target deal address; audit | **High** — operator controls verdicts |
| OTP/2FA theft | phishing "send the code" | bot never asks for codes; verification is bot-issued | Medium |
| Impersonation | fake admins/rooms | handle + rotating 4-digit suffix; never DM first; verify room | Medium |
| Fake INR proof | edited screenshots | operator review; video/paper protocol recommended | Medium |
| Address poisoning | lookalike addresses | addresses shown in full, checksummed; per-deal address | Low–Medium |
| Wrong-network deposit | user error | chain-specific pool, warnings, no auto-credit | Medium |
| Deposit misattribution | shared address | one address per deal, cooldown | Low |
| Reorg | chain instability | 15/20 confirmations | Low |
| Collusion | buyer+seller fake dispute | operator judgement only | Medium |
| Money laundering | no KYC | none | **High** |
| Chargeback | fiat leg | crypto irreversible; no bank recourse | N/A |
| Webhook spoofing | forged inbound | shared-secret/HMAC, source IP allowlist | Low |
| Replay | duplicate events | idempotency keys, dedupe | Low |
| DB exfiltration | SQLi/backup leak | parameterized queries, encryption at rest | Medium |

### 2.1 Monitoring vs fraud controls

"No monitoring" in this spec means **no surveillance of users or their money** — no KYC,
sanctions/PEP screening, velocity limits, or AML transaction monitoring. It does **not**
mean the deal flow is unprotected. These in-flow controls remain mandatory:

- The bot never asks for OTP, 2FA, or wallet seed/secret.
- One pool address per deal; one deal per address.
- Confirmation thresholds before crediting.
- Immutable evidence and append-only audit.
- Operator review of INR proof before release.
- Signed/hashed webhooks and idempotent event handling.

These reduce ordinary fraud. They do not reduce the custody, KYC, or operator-risk
exposure described above.

## 3. Implemented controls

- TLS everywhere; HSTS; strict CSP on the web adapter.
- Argon2id for the operator password; TOTP; recovery codes.
- Secrets in an external store; signer caps and idempotency.
- Input validation on every inbound event; address format checks per chain.
- Append-only evidence and audit tables.
- Encrypted evidence storage; signed URLs with short TTL.
- Rate limits on login, listing creation, and deal creation.
- Idempotent chain watcher and transfer signer.
- Daily balance-vs-liability reconciliation.

## 4. Deliberately declined controls

These are **not** implemented, by decision:

| Control | Consequence |
|---|---|
| KYC / AML | anonymous custodial service; regulatory and abuse exposure |
| Sanctions / PEP screening | no screening of users or addresses |
| Transaction monitoring / velocity | no automated abuse detection |
| Multisig / cold storage | single key compromise is total loss |
| Dispute appeals | operator verdict is final |
| Cross-channel identity | sybil and reputation fragmentation per channel |
| Automated INR verification | relies on operator review of proofs |
| Insurance / reserve fund | no reimbursement after loss |

## 5. Legal and regulatory note

Custodial escrow, money transmission, and crypto-fiat settlement are regulated in most
jurisdictions. Operating "offshore with no KYC" does not remove obligations where users
or payment rails are located, and may trigger licensing, AML, sanctions, tax, and
consumer-protection rules. This document is an engineering design, not legal advice.

One deliberate divergence from the source: the source may demand KYC during a dispute;
this design never does. That removal increases, not decreases, the legal exposure.

## 6. Security requirements (checklist)

- [ ] Reverse proxy terminates TLS; app not exposed directly.
- [ ] Operator 2FA enforced; recovery codes stored offline.
- [ ] Signer and DB credentials separated; least privilege.
- [ ] Address pool imported from a verified source; checksums validated.
- [ ] Evidence bucket private; encryption at rest; access logged.
- [ ] Backups encrypted and restore-tested.
- [ ] Kill switch tested: pause releases and new deals.
- [ ] Incident runbook rehearsed (see `10-deployment-and-ops.md`).

## 7. Incident response

1. **Pause** — flip `settings.paused = true`; releases and new deals stop.
2. **Contain** — rotate bot token, OIDC secret, DB credentials, signer key.
3. **Assess** — reconcile on-chain balances vs liabilities; list affected deals.
4. **Notify** — affected users, in the channel and by support handle.
5. **Recover** — restore from backup if data loss; resume state machine.
6. **Review** — post-mortem; update this document.
