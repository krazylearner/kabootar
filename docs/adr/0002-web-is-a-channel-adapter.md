# Web is a channel adapter, not a mirror

**Status:** accepted

The website could have been a read-only mirror of Telegram deal rooms, but it is
instead a first-class adapter implementing the same `ChannelPort` with a `web_surface`
deal page and its own OIDC identity. A mirror would create two sources of truth and a
second-class experience; an adapter keeps one state machine and one set of rules.

**Consequences:** the web adapter must implement room semantics (create, invite, close)
and its own identity; there is no "sync from Telegram" path to maintain.
