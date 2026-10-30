# Per-channel identity, no cross-channel linking

**Status:** accepted

An account is scoped to one adapter — `(adapter, external_id)` — with no linking
between Telegram, web, Discord, or Slack identities. Linking would require a
cross-channel auth and recovery model and would make reputation ambiguous; per-channel
identity is simpler and matches how each community already works.

**Consequences:** a person using two channels has two accounts and two reputations; deals
are single-channel; sybil resistance is limited to per-channel effort.
