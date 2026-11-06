# 03: Refill a reusable store from ordinary MP

**What to build:** A character with MP 5/10 plus 4 temporary MP readies a reusable 0/8 ring and clicks **Refill**. A
small dialog shows ordinary MP 5, free capacity 8 and maximum transferable 5. They refill 3: the ring shows 3/8, MP
2/10, and the temporary 4 is untouched. With the ring only carried, Refill is unavailable (not equipped) while Spend
still works. Single-use and expended stores never offer Refill. Completes chunk **Ench1**; see [the spec](../spec.md),
sections "Pure magic-store module" (refill plan) and "Ledger actions and UI" (Refill), and user stories 17–26, 28.

The magic-store module gains a refill plan from ordinary MP and free capacity; temporary pools are not an input. It
refuses an expended or single-use store, overdraw and overfill. The dialog is an ApplicationV2 dialog in the parchment
theme. On confirm it rechecks both sides and transfers once, ordinary MP down and balance up by the same amount, with
the per-source serialization from 02. Each side records the refill's id as a debit/credit marker in the same update, so
a retry after a partial failure finishes without repeating the transfer. Before writing code, check in the v14 sources
whether an actor update can carry embedded item changes in the same database operation (read the v14 notes doc first);
if it can, the transfer is one write. Whether the refiller is the item's original caster is left to the Referee; a
refill from someone else is recorded as a correction.

**Blocked by:** 02 (Spend from a store; single-use expiry, quantity and access rules), [resources 05 (Temporary MP
pools)](../../v09-resources/issues/05-temporary-mp-pools.md), so refill is built and verified next to temporary MP

**Status:** ready-for-agent

- [ ] Refill is offered only for a reusable, not expended store on an owned, accessible item (equipped, quantity one).
- [ ] The dialog shows ordinary MP, free capacity and the maximum transferable amount; amounts above it are refused.
- [ ] Confirming rechecks current ordinary MP and balance; a refill no longer possible is refused and neither side
      changes. Cancelling changes nothing.
- [ ] A refill moves exactly the chosen amount once; temporary MP pools never change.
- [ ] A retry after only one side was written completes the missing side without repeating the transfer.
- [ ] Refills on an unlinked token's item change only that token's actor.
- [ ] Magic-store module tests: refill plan bounded by ordinary MP and free capacity, ignoring temporary pools; refusal
      for single-use, expended, overdraw and overfill; retry planning from markers.
- [ ] Manual: the spec's Ench1 rows "Reusable store 0/8, MP 5/10 + temporary 4", "Reusable store 6/8, MP 1/10",
      "Refill dialog open for 3" and "Ring 4/8 carried" pass, with reloads.
- [ ] The Items documentation page covers refill, the equipped requirement and recording other transfers as corrections,
      marking these as v0.9 interface choices rather than SRD rules (edit the HTML source, regenerate the journal
      sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
