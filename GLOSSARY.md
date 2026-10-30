# Kabootar

A channel-agnostic escrow platform: a community and listing surface plus custodial USDT escrow with manual INR settlement, run by a single operator. Each messaging surface is a channel with its own adapter; the escrow core is shared.

## Language

### Channels

**Channel**:
A messaging surface a deal can run on — Telegram, web, Discord, or Slack.
_Avoid_: platform, network, medium

**Adapter**:
The module that connects one channel to the core, implementing `ChannelPort` and rendering core content in that channel's own format.
_Avoid_: bot, integration, connector, plugin

**Native community**:
The chat surface an adapter owns for its channel — a Telegram forum, a web listing board, a Discord server — where listings are posted and deals originate.
_Avoid_: group, server, workspace

**Capability**:
A channel feature an adapter declares it supports (buttons, threads, native rooms, file upload); the core degrades behavior when one is absent.
_Avoid_: feature flag, permission

**Surface mode**:
How a deal is experienced on a channel: `native_room`, `web_surface`, or `notify_only`.
_Avoid_: deal mode, room type

### Identity

**Account**:
One identity on one channel, keyed by `(adapter, external_id)`; accounts never link across channels.
_Avoid_: user, profile, member, customer

**Verification**:
Optional per-channel proof that an account controls its identity (Telegram bot code, OIDC email). Not KYC.
_Avoid_: KYC, authentication, login

**Operator**:
The single system principal created by the wizard, authenticated with TOTP, and the final authority on disputes.
_Avoid_: admin, moderator, owner, staff

### Community and listings

**Listing**:
A published offer to buy or sell USDT for INR, belonging to one account on one channel.
_Avoid_: ad, order, post, offer

**Vouch**:
A community quote of a completed deal that raises the quoted accounts' reputation once.
_Avoid_: review, feedback, testimonial

**Reputation**:
An account's completed-deal count and settled volume, derived from events.
_Avoid_: rating, score, trust level, stars

### Deals

**Deal**:
A single escrowed exchange of USDT for INR between a buyer and a seller on one channel.
_Avoid_: order, trade, transaction, escrow

**Buyer**:
The party who receives USDT from escrow and pays INR.
_Avoid_: taker, receiver, payer

**Seller**:
The party who deposits USDT into escrow and receives INR.
_Avoid_: maker, sender, payee

**Deal state**:
One value from the channel-agnostic deal state machine; the only sanctioned way to say where a deal is.
_Avoid_: status, stage, phase

**Frozen terms**:
The immutable summary — amounts, rate, fee, addresses, payment details — fixed at confirmation and identified by `frozen_terms_hash`; changing them means a new deal.
_Avoid_: contract, agreement, snapshot

**Terminal**:
A deal state with no further transitions: `COMPLETED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
_Avoid_: closed, finished, done

**Public ID**:
The non-sequential display identifier of a deal (e.g. `D51700`), safe to show publicly.
_Avoid_: deal number, reference

**Deal timer**:
The per-state deadline after which a deal is cancelled, expired, or moved to dispute.
_Avoid_: timeout

### Money and custody

**Deposit**:
An on-chain USDT transfer observed to a deal's assigned address, recorded per `(chain, tx_hash, log_index)`.
_Avoid_: payment, transfer, top-up

**Deposit address**:
A pre-generated static address assigned to exactly one live deal; it is that deal's correlation key.
_Avoid_: wallet address, payment address, receive address

**Address pool**:
The pre-generated set of deposit addresses per chain, cycling free → assigned → cooldown → free, or retired.
_Avoid_: wallet pool, address book

**Cooldown**:
The window after a deal ends during which its address still attributes late deposits before returning to the pool.
_Avoid_: grace period, hold

**Hot wallet**:
The single key per chain that holds escrowed funds and signs every release and refund.
_Avoid_: treasury, main wallet, operator wallet

**Sweep**:
Moving funds from a pool address to the hot wallet on a schedule or before a release.
_Avoid_: consolidation, transfer-out

**Credit**:
To accept a deposit as funding a deal, requiring the assigned address, at least the deal amount, and enough confirmations.
_Avoid_: confirm, accept, settle

**Confirmation**:
One block on top of a deposit transaction; a deal needs 15 on BSC or 20 on TRON unless configured otherwise.
_Avoid_: block, approval

**Release**:
Paying the buyer the deal amount minus the platform fee.
_Avoid_: payout, disburse, settle

**Refund**:
Returning the deposited USDT to the seller.
_Avoid_: reversal, chargeback

**Fee**:
The platform charge on a completed deal, `max(fee_pct × amount, fee_min)`; one payer — buyer, seller, or split — bears it per listing.
_Avoid_: commission, cut, charge

**INR payment**:
The manual fiat leg: the buyer sends INR to the seller's payment details and marks the deal paid with proof.
_Avoid_: settlement, payment gateway

**Proof**:
The image, video, or PDF a buyer uploads as evidence of an INR payment; encrypted and visible only to the operator.
_Avoid_: receipt, screenshot

**Overpayment**:
A deposit larger than the deal amount: credited, with the excess returned out-of-band by the operator.
_Avoid_: excess

**Underpayment**:
A deposit smaller than the deal amount: recorded, the deal stays unfunded, and the operator is notified.
_Avoid_: shortfall

### Disputes

**Dispute**:
A conflict a party opens over a funded deal; it freezes release and is resolved only by the operator.
_Avoid_: claim, case, ticket, complaint

**Evidence**:
Append-only material attached to a dispute: file, text, tx hash, or quoted message.
_Avoid_: proof (reserved for INR payment proof), attachment

**Verdict**:
The operator's final decision on a dispute: `release`, `refund`, or `split`.
_Avoid_: ruling, resolution, decision

**Split**:
A verdict that pays seller and buyer a percentage each, executed as two transfers.
_Avoid_: partial refund, settlement

### Operations

**Wizard**:
The resumable first-run setup at `/setup` that produces branding, operator credentials, and channel, chain, fee, and limit config.
_Avoid_: installer, setup script, onboarding

**Operator console**:
The authenticated web surface at `/operator` where the operator inspects deals, rules on disputes, and manages the address pool.
_Avoid_: admin panel, dashboard, back office
