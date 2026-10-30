# Channel-agnostic core with adapter ports

**Status:** accepted

The escrow domain must run on Telegram now and on Web, Discord, and Slack later, so the
core is a modular monolith that depends only on a `ChannelPort`; adapters translate
commands and render content but never own state. This keeps one deal state machine and
lets a new channel ship as a new adapter, at the cost of a strict rule: the domain must
never import a channel SDK.

**Consequences:** capability flags and graceful degradation are required; every adapter
needs contract tests; splitting adapters into services later is possible without moving
domain logic.
