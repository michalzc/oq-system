# 11: Unpaid charm casts and the pending-entry block

**What to build:** A wielder casts the single-use Protection charm and succeeds, but their MP drops during dice
resolution, so the card is unpaid and the entry is **not** yet expended. The Charms group shows the entry blocked with
"pending cast", and casting it again is refused. After Pay now, the entry is expended exactly once, even if Pay now or
Finish is repeated or the world reloads. Voiding the cast leaves the entry available again. Third slice of chunk
**Ench4**; see [the spec](../spec.md), sections "Cast operation (Ench2)" (Idempotent steps, Serialization) and "Charms
(Ench4)" (Casting), and user stories 95–96.

Expending the entry follows the success-only rule as a remaining step after payment or adjudicated payment. The entry's
recorded expending operation id is the marker a retry consults, so settlement and expenditure happen together and never
twice. A single-use entry with an incomplete (pending or unpaid) operation on its owning actor can't be cast again.
Operation records copied from another actor are inert and don't block the copy's entries.

**Blocked by:** 10 (Cast a charm with the wielder's skill), 06 (Write failures, idempotent Finish and the Unresolved
casts list)

**Status:** ready-for-agent

- [ ] An unpaid successful charm cast doesn't expend its entry; Pay now or adjudicated payment expends it once; void
      leaves it unexpended.
- [ ] Finish after a failed entry write expends it without paying again; a retry never expends twice.
- [ ] A single-use entry with a pending or unpaid operation shows "pending cast" and can't be cast again.
- [ ] Inert operation records copied with an actor don't block that actor's entries.
- [ ] Magic-store module tests: remaining steps for charm operations (paid but not expended, expended but card
      missing); pending-entry blocking; inert copies don't block.
- [ ] Spell-casting harness: unpaid success leaves the entry; Pay now expends once; pending entry blocks a second cast.
- [ ] Manual: the spec's Ench4 row "Single-use entry, unpaid success" passes with a personal second attempt (the store
      variant is ticket 13), with reloads.
- [ ] The Magic documentation page covers unpaid charm casts (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
