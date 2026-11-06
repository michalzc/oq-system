# 13: Pay a charm from a store

**What to build:** A wielder with MP 1 casts the Mobility charm from the amulet's own 6-point store: the charm cast
dialog shows the payment source selector, the store pays, and personal MP stays 1. With a single-use Protection entry
that has an unpaid success, trying to cast it again from the store is refused as "pending cast"; after Pay now, the
entry is expended once. Belongs to whichever of chunks **Ench3** and **Ench4** lands second; see [the
spec](../spec.md), section "Delivery and dependencies", and user story 90.

Charm casting gains the same payment-source selector, per-source magnitude range, confirmation recheck and store
payment as spells, including a store on the charm's own item. The stored magnitude stays the ceiling regardless of the
store's funds.

**Blocked by:** 08 (Store payment: stale choices, unpaid stores and recovery), 11 (Unpaid charm casts and the
pending-entry block)

**Status:** ready-for-agent

- [ ] The charm cast dialog offers personal MP (default) and accessible stores, including one on the charm's own item.
- [ ] The selectable magnitude is limited by both the stored magnitude and the selected source's funds.
- [ ] A store-paid charm cast charges the store only; a success expends a single-use entry once.
- [ ] A pending single-use entry is blocked whichever source the second cast would use.
- [ ] Quick casting a charm stays personal-only.
- [ ] Spell-casting harness: charm paid from a store; pending entry blocks a second cast from another source.
- [ ] Manual: the spec's Ench4 row "Single-use entry, unpaid success: try to cast it again from a store" passes, plus a
      store-paid Mobility cast, with reloads.
- [ ] The Magic documentation page covers paying charms from a store (edit the HTML source, regenerate the journal
      sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
