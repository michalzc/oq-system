# 10: Cast a charm with the wielder's skill

**What to build:** A wielder with Personal Magic Casting 40 readies the amulet. Their Magic tab has a **Charms** group
listing Protection 3 (single-use) and Mobility (reusable) with Cast controls. They cast Protection at 2 and succeed: MP
−2 and the entry shows Expended, while Mobility, the store and the amulet's passives are unchanged. On a fresh copy a
failure pays 1 and a fumble pays 2, keeping the entry. A fixed entry casts at exactly its stored magnitude; knowing
Protection 5 doesn't raise the ceiling. A wielder without the casting skill sees why it's blocked. Second slice of chunk
**Ench4**; see [the spec](../spec.md), sections "Pure magic-store module" (Charm cast parameters) and "Charms (Ench4)"
(Listing, Casting), and user stories 82–94, 102–103.

Casting reuses the spell cast path with the entry as the spell data: the wielder's casting skill resolved from the
entry's skill reference against the wielder's skills, with that skill's modifiers and conditional choices (if
actor-effects 11 has landed), the magnitude range from the module (variable up to the stored magnitude, fixed exactly),
and the cast operation from ticket 04 paying personal MP. Expending a single-use entry on a success or critical is one
of the operation's steps, recording the operation id on the entry in the same update. Nothing is learned. Unpaid charm
casts and the pending-entry block come in ticket 11.

**Blocked by:** 09 (Charm entries: drop a Personal Magic spell onto an item), 04 (Unpaid casts instead of underfunded
casts)

**Status:** ready-for-agent

- [ ] The Magic tab's Charms group lists entries from the actor's items with item name, stored magnitude, kind and
      either Cast or the reason it's unavailable (not equipped, quantity, expended, missing skill).
- [ ] Casting uses the wielder's casting skill and its current modifiers, never the creator's; a missing skill blocks
      with an explanation.
- [ ] Variable entries offer magnitudes up to the stored magnitude; fixed entries use exactly the stored magnitude; the
      wielder's own learned version never changes the ceiling.
- [ ] Payment uses the cast operation and personal MP with today's outcome costs.
- [ ] A success or critical expends a single-use entry once, even below its stored magnitude; failure and fumble keep
      it; reusable entries stay available. Other entries, the store, passives and the item are untouched.
- [ ] Shift-click casts at the highest magnitude personal MP affords up to the stored magnitude.
- [ ] No learned spell is created; equipping casts nothing.
- [ ] Magic-store module tests: charm availability reasons; selectable magnitudes for variable and fixed entries.
- [ ] Spell-casting harness: charm cast uses the wielder's skill; variable below the ceiling, fixed exact; success
      expends a single-use entry once, failure and fumble keep it; a reusable entry stays; no learned spell is created.
- [ ] Manual: the spec's Ench4 rows "Amulet (readied) with single-use Protection 3 charm" (except Apply, ticket 12),
      "Same charm on a fresh copy", "Fixed charm magnitude 3", "Wielder knows Protection 5", "Charm given to another
      actor", "Wielder without Personal Magic Casting" and "Amulet with Protection and Mobility entries and a store"
      pass, with reloads.
- [ ] The Magic documentation page explains charm casting and success-only expenditure, marking it as the chosen
      reading of the rules (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
