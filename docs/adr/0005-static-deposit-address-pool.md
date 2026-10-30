# Static deposit-address pool

**Status:** accepted

Deposits go to a pre-generated pool of static addresses per chain; each deal is assigned
one free address and the address returns to the pool after a cooldown. The source
publishes a static address list, and a pool preserves that while removing the "which
deal does this transfer belong to?" ambiguity that a single shared address creates — no
HD derivation or memo tagging is needed.

**Consequences:** the pool must be sized, monitored, and replenished; addresses are reused
after cooldown, so late deposits need operator handling; the published address list must
be generated from the same pool.
