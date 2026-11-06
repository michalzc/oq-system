# 02: Spend from a store; single-use expiry, quantity and access rules

**What to build:** A player with a 5/8 ring clicks **Spend**, enters 2, and the ring shows 3/8 after a reload; their
own MP and temporary MP are untouched. Spending 4 more is refused. A single-use 2/8 store spent by 2 becomes 0/8
Expended, while the item, its quantity, charms and passives stay; correcting a single-use store's balance to 0 does not
expend it. A stack of three rings with a store says "split the stack" and offers no spend. The Magic tab lists the
character's accessible stores. Second slice of chunk **Ench1**; see [the spec](../spec.md), sections "Pure magic-store
module" (Ledger, Access) and "Ledger actions and UI", and user stories 10–16, 27, 29, 31–32, 34.

The magic-store module gains spend (refused above the balance; a single-use store reaching zero by spending becomes
expended, unlike a correction) and access: whether an item's store is usable by its owning actor (readied for weapons
and equipment, worn for armour, natural where the type already has it), quantity one for equipment, not expended, with
an explanation when not. Spend is bookkeeping, so it works on any owned item regardless of equipped state, but it still
needs quantity one. Spend needs the same permission as editing the item.

This slice introduces **per-source serialization**: debits from one source (here, one store) run one at a time in a
client, each rechecking the current balance just before its write. Refill (03), cast payment (04) and store payment
(07) reuse it.

**Blocked by:** 01 (Magic point store on physical items: add, correct, remove)

**Status:** ready-for-agent

- [ ] Spend takes the chosen amount from the selected store only; personal and temporary MP never change.
- [ ] Spending more than the balance is refused with an explanation; the store never goes negative.
- [ ] A single-use store spent to zero becomes expended and stays shown as expended; a correction to zero does not
      expend it. Expiry leaves the item, its quantity, charms and passives in place.
- [ ] Equipment with quantity above one shows "split the stack"; spend is unavailable until quantity is one, while
      configuration stays possible.
- [ ] The Magic tab shows a compact list of the actor's accessible stores with their balances.
- [ ] Two quick spends on the same store from one client apply in turn against the current balance (no overspend).
- [ ] Spending on an unlinked token's item changes only that token's actor.
- [ ] Stores never change on reload, rest or over time.
- [ ] Magic-store module tests: spend within and above the balance, single-use expiry by spending but not by
      correction, reusable store at zero, access by item type and state, quantity and expended, with explanations.
- [ ] Manual: the spec's Ench1 rows "Store 5/8: spend 2, reload", "Single-use store 2/8: spend 2", "Single-use store
      2/8: correct balance to 0", "Equipment with store, quantity 3" and "Two unlinked tokens of one base actor" pass.
- [ ] The Items documentation page covers spending, single-use expiry, quantity and access (edit the HTML source,
      regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
