# Single hot-wallet custody

**Status:** accepted

All escrowed USDT and all pool addresses are controlled by one hot key per chain, with
automatic release and refund. This matches the source bot's operating model and keeps
operations simple; multisig, HSM, cold reserve, and timelocks were considered and
rejected.

**Consequences:** a key compromise or a malicious operator can move all user funds, and
there is no cold-storage fallback. Signer caps, idempotency, and an audit log reduce
accidental loss but not theft. This is the primary documented risk of the system.
