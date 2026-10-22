# Bound magic point stores and stored-spell casting for v0.9

Labels: wayfinder:grilling
Type: grilling
Parent: ../map.md

## Question

What is the smallest useful v0.9 scope for magic point stores and stored spells, and which item kinds need distinct
follow-up chunks?

Separate a store's capacity/balance/manual refill from selecting a payment source during casting. Decide a single-store
workflow, eligibility/access, failure costs, and behavior when the balance changes while a dialog is open. Is partial
payment from actor plus store needed, or does explicit single-source payment suffice?

Choose the first stored-spell kind and define whose skill, magnitude and MP are used. Charms, matrices, potions and
scrolls have different rules; do not silently promise all of them through one generic stored spell field. Decide whether
stored spells need copied data or references, what travels with the item, and how consumption/reuse is handled.

Deliver a scope table and separate manually testable increments. Existing casting and the planned card application
should be reused without automatically activating a stored spell when its item is equipped. Dependencies on effect
application belong to the later implementation sequence, not to making this scope decision.

## Comments

[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md) establishes ordinary plus
temporary personal MP, spent from temporary points first. Reuse that personal-payment behavior where personal MP is
the selected source; do not accidentally ignore the buffer. A separate item store is not the actor's temporary buffer.
Decide any cross-source fallback or transfer eligibility explicitly, including whether temporary personal points can
fund a store refill; no automatic splitting across all pools has been approved.
