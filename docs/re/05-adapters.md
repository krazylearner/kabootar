# 05 — Adapters

Telegram and Web ship first. Discord and Slack are specified here so the port is
honest, but are not built. **Web is a first-class adapter, not a mirror.**

## 1. The channel port

Every adapter implements `ChannelPort`. Methods are capability-gated; the core checks
flags before calling.

```text
ChannelPort
  identity.verify(account, challenge) -> VerificationResult
  message.send(room, content) -> MessageRef
  message.edit(room, ref, content)
  message.delete(room, ref)
  actions.send(room, content, actions[]) -> ActionRef        # buttons / menus
  room.create(spec) -> RoomRef
  room.invite(room, account) -> InviteRef
  room.add(room, account)
  room.remove(room, account)
  room.close(room)
  room.members(room) -> Account[]
  file.upload(room, blob) -> FileRef
  file.download(file_ref) -> Blob
  moderation.restrict(room, account, mode)
  webhook.parse(request) -> InboundEvent[]
```

### Capability flags

```json
{
  "buttons": true,
  "ephemeral": false,
  "threads": true,
  "native_rooms": true,
  "file_upload": true,
  "file_download": true,
  "member_list": true,
  "moderation": true,
  "inline_actions": true,
  "message_edit": true,
  "max_message_bytes": 4096
}
```

Core behavior when a capability is missing:

- no `buttons` → render numbered text commands; accept numeric replies.
- no `native_rooms` → use a web deal page for that adapter.
- no `threads` → one room per deal.
- no `message_edit` → post new messages instead of updating.
- no `file_upload` → accept evidence as links/hashes only.

## 2. Adapter lifecycle

Each adapter is a long-running worker:

1. Load config + secrets from `CONFIG`.
2. Subscribe to `deal.*`, `listing.*`, `dispute.*`, `reputation.*` queues.
3. Render outbound content with the adapter's view templates.
4. Accept inbound commands and translate them into core commands.
5. Report health (`/healthz`) and per-queue lag.

Adapters are horizontally safe: outbox events are keyed by room, and room actions are
idempotent on `(room_ref, event_id)`.

## 3. Identity

- One `account` per `(adapter, external_id)`.
- No cross-channel linking. A person on Telegram and on Web has two accounts.
- Reputation is per account (`completed_deals`, `volume_atomic`).
- Telegram identity = numeric user id. Web identity = OIDC `(iss, sub)`.
- Optional verification is adapter-specific: Telegram bot 2FA code (`set2fa`),
  Web OIDC email verification, Discord/Slack none.

## 4. Deal surface modes

Configured per adapter:

| Mode | Meaning |
|---|---|
| `native_room` | Deal runs in a channel-native room (TG group, Discord channel) |
| `web_surface` | Deal runs on a hosted web deal page |
| `notify_only` | Channel only receives notifications and links |

Default: Telegram `native_room`; Web `web_surface`.

## 5. Telegram adapter

- Bot with forum-aware group linking; the public community is a forum supergroup with
  topics (`Guidelines`, `General`, `OTC`).
- **Deal start**: `/escrow @counterparty` in the listings topic; a bare `/escrow` in
  private chat is rejected. All forms map to `deals.start`.
- **Room**: create a private group, invite both accounts, pin the deal card.
- **2FA (optional)**: `/start set2fa` and `/start howtocheck2fa` map to
  `identity.verify`; disabled unless `verification=required`.
- **Actions**: inline keyboards for *Confirm*, *Cancel*, *I Have Paid*, *Release
  Payment*, *Dispute*.
- **Content limits**: 4,096 bytes; split long summaries.
- **Anti-impersonation**: never DM first; the deal card names the operator handle with
  a rotating four-digit suffix.
- **Inbound**: updates via webhook (preferred) or long polling.

## 6. Web adapter

- **Auth**: configurable OIDC (issuer, client id/secret, scopes); no password login.
- **Surface**: full escrow UI — dashboard, deal page, listing board, INR proof upload,
  dispute thread; plus the operator console (`08-operator-and-wizard.md`).
- **Real-time**: server-sent events for deal state; no polling requirement.
- **Deal page**: shows the frozen summary, deposit address, confirmations, countdown,
  action buttons, evidence upload, dispute status.
- **Public pages**: listing board and a read-only deal status page keyed by a random
  public id (no PII).
- **Room**: the web deal page *is* the native room (`room.create` returns a page ref).

## 7. Discord adapter (spec only)

- Slash command `/escrow target:@user` in the listings channel.
- Native room = private channel or thread; membership via role/permission overwrite.
- Actions = message components; evidence = attachments.
- Identity = Discord user id; no OAuth linking.

## 8. Slack adapter (spec only)

- Slash command `/escrow @user`; native room = private channel.
- Actions = Block Kit buttons; evidence = file uploads.
- Identity = Slack user id; no OAuth linking.

## 9. Capability matrix

| Capability | Telegram | Web | Discord | Slack |
|---|---|---|---|---|
| buttons | ✅ | ✅ | ✅ | ✅ |
| native_rooms | ✅ | ❌ | ✅ | ✅ |
| threads | ✅ | ✅ | ✅ | ✅ |
| file_upload | ✅ | ✅ | ✅ | ✅ |
| member_list | ✅ | ✅ | ✅ | ✅ |
| moderation | ✅ | ❌ | ✅ | ✅ |
| message_edit | ✅ | ✅ | ✅ | ✅ |
| ephemeral | ❌ | ✅ | ✅ | ✅ |

## 10. Per-adapter config (schema: `schemas/adapter-config.schema.json`)

```json
{
  "adapter": "telegram",
  "enabled": true,
  "surface": "native_room",
  "verification": "optional",
  "community": { "chat_id": "-100...", "listings_topic": 458 },
  "capabilities": { "buttons": true, "threads": true, "file_upload": true },
  "limits": { "max_open_deals_per_account": 3 }
}
```
