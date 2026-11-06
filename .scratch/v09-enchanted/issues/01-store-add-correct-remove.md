# 01: Magic point store on physical items: add, correct, remove

**What to build:** A Referee opens an enchanted ring (equipment), clicks **Add store** in a new "Magic point store"
section, and enters capacity 8, balance 5 and kind reusable. The sheet shows 5/8, reusable, not expended, and the
character's inventory shows the balance next to the ring. Typing balance 9, lowering capacity to 4 or typing −1 is
refused with an explanation, and the store stays 5/8. Removing the store asks for confirmation and says 5 points will be
discarded. Weapons and armour get the same section; spells, skills and special abilities don't. First slice of chunk
**Ench1**; see [the spec](../spec.md), sections "Data ownership", "Pure magic-store module (the main seam)" (Ledger,
corrections only) and "Ledger actions and UI", and user stories 1–9, 30, 33, 105–106, 109.

The store is an optional record in the item's system data (capacity, balance, kind, expended flag); absent means no
store, and there is at most one per item. This slice creates the new pure magic-store module (free of Foundry calls at
import time) with its first operation, correction validation: nonnegative whole numbers, balance no greater than
capacity, and a capacity reduction below the balance refused. The data model enforces integer and range constraints and
never clamps silently. Typed values are presented as corrections, not spending or refilling, and the Expended flag can be
corrected (cleared) here too. Absent data is inert, so no migration step is needed.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Equipment, weapon and armour sheets show a "Magic point store" section to users who can edit the item, with Add
      store (capacity, initial balance, kind). Other item types have no store.
- [ ] With a store, the section shows balance/capacity, single-use or reusable, and expended state, with correction
      fields labelled as corrections.
- [ ] Corrections refuse negative or fractional values, a balance above capacity and a capacity below the balance, each
      with an explanation and no change. Nothing is silently clamped.
- [ ] Remove store asks for confirmation stating the points discarded; cancelling keeps the store.
- [ ] The actor inventory shows each item's store balance; character and NPC sheets both.
- [ ] Capacity, balance, kind and expended state survive a reload unchanged; preparation never writes them.
- [ ] Dragging an item with a store to another actor copies it as saved; spending on one later doesn't affect the
      other (verify with a correction for now).
- [ ] Existing items in an upgraded world have no store; nothing is inferred from names, descriptions or traits.
- [ ] Magic-store module tests: valid corrections, each refused correction, capacity reduction below balance.
- [ ] New strings live under `OQ.*`; the parchment theme is kept.
- [ ] Manual: the spec's Ench1 row "Store 5/8: type balance 9; lower capacity to 4; type −1" passes, plus the "All" row
      "v0.8.2 world: upgrade".
- [ ] The Items documentation page explains magic point stores, corrections and removal (edit the HTML source,
      regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
