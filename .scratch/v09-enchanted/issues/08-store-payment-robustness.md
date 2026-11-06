# 08: Store payment: stale choices, unpaid stores and recovery

**What to build:** A player selects the ring in the cast dialog, unreadies it in another window, then confirms: the
cast is refused before rolling with "store not equipped", and nothing changes. With a 4-point store and a cost-4 cast,
spending 2 from the store while the dice are resolved makes the card unpaid from that store; personal MP is not touched.
After refilling the store, Pay now pays from the ring once. Two casts from one ring confirmed in turn are paid one after
the other. Completes chunk **Ench3**; see [the spec](../spec.md), sections "Store payment in the cast dialog (Ench3)",
"Cast operation (Ench2)" (Unpaid, Idempotent steps, Serialization), and user stories 65–67.

On confirmation the casting code rechecks the actor, the store item's identity, its accessibility and affordability at
the chosen magnitude, and refuses a stale choice with what changed. It never lowers the magnitude or switches source.
At payment time a store that is gone, inaccessible or short makes the operation unpaid; there is no fallback to
personal MP. The store item records the operation ids it has been debited for in the same update as the debit, so Pay
now and Finish from a store are idempotent like personal payment.

**Blocked by:** 07 (Cast from a store through the cast dialog), 06 (Write failures, idempotent Finish and the Unresolved
casts list)

**Status:** ready-for-agent

- [ ] A stale store choice at confirmation (removed, given away, unequipped, expended, stack above one, unaffordable) is
      refused before rolling with what changed; nothing is written.
- [ ] A store emptied, removed or made inaccessible during dice resolution makes the cast unpaid from that store;
      personal MP is never used instead.
- [ ] Pay now and Finish retry the recorded store only; a retry after the store was debited doesn't debit again.
- [ ] Two casts from one store in one client are paid in turn against the current balance.
- [ ] Magic-store module tests: payment possible or not for a store source in each access state; remaining steps with
      a store debit marker.
- [ ] Spell-casting harness: stale store refused without rolling; store emptied during dice → unpaid, no personal
      fallback; two casts from one store serialize; retry after store debit doesn't debit twice.
- [ ] Manual: the spec's Ench3 rows "Store selected in dialog: unready the item, then confirm" and "Store 4, cost 4:
      spend 2 from store during dice resolution" pass, plus Pay now from the store after a refill, with reloads.
- [ ] The Magic documentation page covers unpaid store casts (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
