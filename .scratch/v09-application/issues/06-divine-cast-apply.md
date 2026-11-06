# 06: Non-rolled Divine casts offer Apply effect; Shield template

**What to build:** A priest with Shield 2 Divine (remaining magnitude 2) casts it. The magnitude dialog and the
remaining-magnitude cost work as today, and the card now offers **Apply effect**. Applying Shield to self charges
nothing further: remaining magnitude is 0, once. Divine spells without templates keep their plain card. First slice of
chunk **App4** (it has fewer blockers than ticket 07 and can land first); see [the spec](../spec.md), sections "Use
ability and non-rolled casts (App4)" and "Representative content", and user stories 46, 47.

The non-rolled Divine cast writes the same cast snapshot as a rolled success, with its chosen magnitude, so Apply effect
and the review dialog work unchanged.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard)

**Status:** ready-for-agent

- [ ] Non-rolled Divine casting keeps its confirmation, magnitude dialog and remaining-magnitude cost and writes a cast
      snapshot when the spell has templates.
- [ ] The Divine card shows Apply effect under the same visibility and permission rules as rolled spell cards.
- [ ] Divine spells without templates post today's card.
- [ ] The SRD Shield spell ships with its template in the pack source; the coverage inventory row is updated once the
      inventory exists.
- [ ] Spell-casting or applied-effects tests: a Divine snapshot records the chosen magnitude and resolves Shield's
      values.
- [ ] The Magic documentation page explains Divine application.
- [ ] Manual: the spec's App4 row "Shield 2 Divine, remaining 2; cast, Apply to self" passes, with reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
