# 01 — Source Analysis

Reverse-engineering of the live community at `https://web.telegram.org/k/#-1238995316`
and of the saved Telegram Web exports in `New folder/`.

## 1. Evidence base

| Source | Contents | Notes |
|---|---|---|
| Live capture, 2026-10-30 | Group metadata, forum topics, Guidelines, recent OTC messages | Read-only via Chrome MCP |
| `Telegram_Web_…07-11-20-956Z.txt` | 1,107 messages | One escrow room transcript |
| `…07-03-48-003Z.txt` | 51 KB | Same room, partial |
| `…06-52-30-144Z.txt` | 35 messages | Early deal sample |
| `…06-59-21-188Z.html` | 2.1 MB | Rendered room export |

The `.txt`/`.html` exports are Windows-1252-mangled (`�?"`, `dY"1`); decode as UTF-8
with replacement before parsing. Emoji are lost in `.txt`, recoverable from `.html`.

## 2. Who and where

- **Group**: `Crypto India (Admins Never DM First)`
- **ID**: `-1238995316`; public handle `@CryptoIndiaUnited`
- **Size**: 2,817 members / 179 online at capture (2,815 / 81 earlier same day)
- **Type**: forum supergroup with topics **Guidelines**, **General**, **OTC**
- **Admins**: two operator handles (redacted) — users are told to save the handles
  with a random four-digit suffix to detect impersonators
- **Bots observed** (names kept, ids redacted):
  - Escrow bot — writes escrow-room deal state
  - Support bot — posts safety tips into General
  - Name-history bot — public name/username history, used as trust theatre

## 3. Community surface

- **General** — announcements, support, gripes. Includes "I got scammed" safety posts
  and suspension notices (e.g. "withdrawals suspended, resume within 48hrs").
- **OTC** — free-form listings and calls:

  ```
  #selling
  Chain : BEP20
  Amount [USDT] :
  Amount [INR]: 80000
  Rate[INR/USDT]: 102.6
  Payment Method: cdm
  ```

  Common methods: **CDM**, **CCW**, **UPI**, **IMPS**, **QR cash**. Rates cluster around
  100–105 INR/USDT. `Escrow urs` / `Escrow mine` states who pays the fee.
- **Guidelines** — the pinned operating manual (quoted below).

## 4. Escrow protocol (as documented live)

Source: pinned *Automated Escrow Process* and *Terms of Using Escrow*.

1. Buyer or seller sets a bot 2FA code (`?start=set2fa`).
2. Parties meet in **OTC**, negotiate amount, rate, payment method.
3. One party runs `/escrow @counterparty` **in OTC**.
4. The bot creates a **dedicated private escrow group** and posts an invite link in OTC.
5. Both join; each verifies their **2FA code** (`?start=howtocheck2fa`).
6. One party fills the bot form; the bot collects chain, **release address**,
   **refund address**, and **payment details**.
7. Bot posts a full summary; both must confirm; **details are frozen** afterwards.
8. Bot assigns a **deposit address** for the token.
9. Seller deposits the agreed USDT/USDC; bot waits for blockchain confirmations.
10. On confirmation, buyer sends INR to the seller's payment details.
11. Seller taps **Release Payment**; the bot sends USDT to the buyer's release address.
12. Either party may press **Dispute**; the admin reviews evidence and rules.
13. Parties may leave a vouch by quoting the escrow call in OTC.

Observed deal sample (exports):

```
Deal #D51700
Seller <seller> · Buyer <buyer>
Token USDT · Chain BEP20 · Amount 198 USDT / 20,000 INR
Fee 0.5 USDT · Released 197.5 USDT
Deposit <deposit-address> · Release <release-address> · Refund <refund-address>
Payment: <bank> <method> · Time limit 30 min · Confirmations 75/30
```

## 5. Stated terms

1. Users are solely responsible for tax and legal compliance.
2. After release, administration has no responsibility, including bank freeze or lien.
3. For disputes, administration may demand **KYC, bank statement, image/video proof**;
   refusal may decide the verdict against the user.
4. If INR cannot be verified, both users undergo **full KYC**; the seller's crypto is
   refunded minus the fee; the parties settle outside, in court.
5. **The administration's decision is final.**

## 6. Trust and safety mechanisms

- "Admins never DM first"; handle-plus-4-digit-suffix verification.
- Invite privacy set to *Nobody*; 2FA password recommended.
- Verify you are in the bot-created room, with real admins present.
- Never join an escrow room from a DM link; never accept a direct deal to save fees;
  never use another escrow group.
- Never send to an address off the published **List of Escrow Addresses**
  (three pages: `…/457/509`, `…/572`, `…/578`); the list is periodically **updated**.
- Never send INR before the bot confirms the crypto deposit.
- Never connect a wallet or scan a QR for "AML/Flash USDT/gas" — drainer pattern.
- **CDM safety**: deposit with a seller-supplied mobile number, record the full
  deposit on video, write deal/room/usernames/amounts/address on paper and show it,
  then tear the CDM slip on video.

## 7. Risk signals observed

These are recorded because the target design diverges from them, not as accusations:

- A claimed ₹37,000+ Amazon Pay loss and a dispute about taking **OTP codes**.
- Users asking "how to check 2FA code without joining the escrow group".
- Warnings about impersonator groups and account takeover.
- "Withdrawals suspended due to hack" notice in General.
- The source **does** require KYC during disputes; the target design does not.
- Rate/fee pressure and "direct deal" lures are endemic; the fee is the only incentive
  to use the bot.

## 8. Divergences: source → target

| Area | Source | Target spec |
|---|---|---|
| Channels | Telegram only | Telegram + Web adapters; Discord/Slack specified |
| Rooms | Dedicated private Telegram group | Native room per adapter; web deal page |
| Identity | Telegram account + bot 2FA code | Per-channel account; optional adapter verification |
| Deposit address | Published static list, shared | Static pool, one address per deal |
| Dispute | Admin may demand KYC; admin final | Operator final; no KYC |
| Monitoring | None stated | None |
| Confirmations | 30 (sample) | 15 BSC / 20 TRON, configurable |
| Fee | ~0.5 USDT in sample | Configurable, default 0.5% / min 0.5 USDT |
| Branding | "Crypto India" | Clean re-brand |

## 9. What must be reproduced

Core mechanics, not the brand: listing intake → escrow command → room → form →
frozen summary → address assignment → chain confirmation → INR settlement → release →
dispute → reputation. Everything adapter-specific is isolated behind the port in
`05-adapters.md`.
