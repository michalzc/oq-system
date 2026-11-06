# 07: Cast from a store through the cast dialog

**What to build:** A character with MP 2 and a readied ring holding 8 opens the cast dialog for a magnitude-5 Personal
Magic spell. A **Payment source** selector lists personal MP (default) and the ring with its balance; choosing the ring
raises the selectable magnitude to 5. On a success the ring goes to 3 and MP stays 2, and the card says the ring paid.
Sorcery magnitude 15 can be cast from a 12-point store even with MP maximum 8. Shift-click with MP 1 refuses and
suggests opening the dialog to choose a store; the store isn't touched. First slice of chunk **Ench3**; see [the
spec](../spec.md), sections "Pure magic-store module" (Payment sources) and "Store payment in the cast dialog (Ench3)",
and user stories 57–64, 68–75.

The magic-store module gains payment sources: personal plus every accessible store on the caster's own items (equipped,
not expended, quantity one), each with its funds and whether it covers the full nominal cost of the lowest selectable
magnitude, and the highest affordable magnitude per source, reusing the existing magnitude and cost calculations. Store
funds are never capped by the actor's POW or personal MP maximum. The operation records the store's identity; payment
debits that store only, with the operation marker and the per-source serialization, and a single-use store paid to
zero expends. Outcome and Sorcery costs are unchanged; no new Sorcery manipulation controls.

**Blocked by:** 02 (Spend from a store; single-use expiry, quantity and access rules), 04 (Unpaid casts instead of
underfunded casts)

**Status:** ready-for-agent

- [ ] The cast dialog for MP-costing spells lists personal MP first, then accessible stores with balances; stores that
      can't cover the lowest selectable magnitude are disabled with their balance. Exactly one source is selected, and
      personal is always the default, including on the next cast.
- [ ] Changing the source updates the highest selectable magnitude; the pre-roll check uses the selected source.
- [ ] A store-paid cast charges the outcome cost to the store only; personal and temporary MP are untouched. A
      single-use store paid to zero becomes expended.
- [ ] The card names the paying source by item name.
- [ ] Quick casting stays personal-only; when personal MP can't pay, the warning suggests the cast dialog. A matching
      conditional choice still opens the dialog first (if actor-effects 12 has landed).
- [ ] Divine no-MP casting shows no selector.
- [ ] Magic-store module tests: candidate sources by access state, disabled stores, per-source maximum magnitude
      including a store above the personal maximum and Sorcery magnitude 15.
- [ ] Spell-casting harness: store selection pays the store only; outcome costs per result for Personal Magic and
      Sorcery; quick cast never touches a store.
- [ ] Manual: the spec's Ench3 rows "Personal MP 8 + temporary 4, store 6", "Personal MP 2, store 8", "Personal MP 2,
      store 2", "Store 5, Personal Magic cost 4", "Store 12, MP max 8, Sorcery magnitude 15", "Single-use store 4/8",
      "MP 1, store 8" and "Two stores" pass, with reloads.
- [ ] The Magic documentation page explains the payment source and the manual split-payment recipe, marking
      single-source payment, the personal default and personal-only quick casting as v0.9 interface choices (edit the
      HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
