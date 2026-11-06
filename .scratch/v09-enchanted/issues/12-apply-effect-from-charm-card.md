# 12: Apply effect from a charm card

**What to build:** The wielder's successful Protection charm cast at magnitude 2 posts a card offering **Apply effect**.
The ally's owner applies it and the ally gains Protection with magnitude 2. Applying never pays MP or expends another
entry. Later the amulet is expended, unequipped and deleted: the applied effect stays, and the card still applies from
its snapshot. An ally who already has Protection from a learned spell sees the review offer keep or replace, because
both share the same template key. Completes chunk **Ench4**; see [the spec](../spec.md), sections "Charms (Ench4)" (Card
and snapshot, No automatic behavior), and user stories 97–101.

The success card carries App1's cast snapshot built from the entry: entry and item names and identities, cast
magnitude, and the entry's templates with their origin template key. Apply effect is enabled once the operation is
settled, using the same gate as spell cards. The snapshot is independent of later entry or item changes.

**Blocked by:** 10 (Cast a charm with the wielder's skill), [application 02 (Apply effect from a successful spell
card)](../../v09-application/issues/02-apply-effect-single-recipient.md), [application 04 (Conflict
review)](../../v09-application/issues/04-conflict-review.md), so the duplicate row can be verified

**Status:** ready-for-agent

- [ ] Successful and critical charm cards with templates store a cast snapshot and offer Apply effect once settled;
      failed and fumbled charm cards don't.
- [ ] Applying uses the snapshot's magnitude and templates, never pays, casts or expends anything.
- [ ] The card keeps applying after the entry or item is edited, expended or deleted.
- [ ] Effects already applied from a charm stay when the charm is expended, unequipped or given away.
- [ ] Charm templates carry the source spell's template key, so application review treats them as duplicates of the
      learned spell's effects.
- [ ] Applied-effects or magic-store module tests: snapshot built from an entry, with the origin template key.
- [ ] Manual: the spec's Ench4 rows "Amulet (readied) with single-use Protection 3 charm" (Apply with magnitude 2),
      "Protection applied from a charm card" and "Ally has learned-Protection effect" pass, with reloads.
- [ ] The Magic documentation page covers applying charm effects (edit the HTML source, regenerate the journal
      sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
