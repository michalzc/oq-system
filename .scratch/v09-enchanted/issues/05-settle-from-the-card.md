# 05: Settle unpaid casts from the card: Pay now, adjudicated payment, Void

**What to build:** On the unpaid magnitude-3 card from ticket 04, the player regains MP to 5 and clicks **Pay now**: MP
goes to 2, the card shows "settled, paid from personal" and Apply effect becomes available; a reload doesn't pay again.
On another unpaid card the GM clicks **Record adjudicated payment**: no MP changes and the card shows "settled,
adjudicated by GM". On a third, **Void** changes nothing, and the card stays readable with Apply effect permanently
unavailable. A player who owns the caster can settle a card the GM authored. Second slice of chunk **Ench2**; see [the
spec](../spec.md), section "Cast operation (Ench2)" (Settlement actions, Card rendering), and user stories 42–48, 51.

The magic-store module gains the pay, adjudicate and void transitions. Pay now rechecks the recorded source and refuses
with an explanation if it still can't pay; it never switches source or changes the magnitude. Settlement writes go to
the operation record on the caster actor, which the caster's owner can always write. When the record is reachable, the
card renders its live status from it, so settlement by someone who can't edit the message still shows; otherwise it
shows the status saved at posting. Before writing code, check in the v14 sources how a chat card can re-render from
actor data when the viewer can't update the message (read the v14 notes doc first).

**Blocked by:** 04 (Unpaid casts instead of underfunded casts)

**Status:** ready-for-agent

- [ ] Unpaid cards show Pay now, Record adjudicated payment and Void to the caster actor's owner and to GMs only;
      authoring the card is not required.
- [ ] Pay now debits once from the recorded source through the per-source serialization, or refuses with an
      explanation when still insufficient; it never underpays.
- [ ] Record adjudicated payment marks payment done without a debit and records the user.
- [ ] Void marks the operation voided, changes no resource, and keeps the card readable with Apply permanently
      unavailable.
- [ ] Settled cards show how they were settled; Apply effect becomes available on settled success and critical cards.
- [ ] The card shows live status from the record for every viewer, including those who can't edit the message.
- [ ] Magic-store module tests: pay (sufficient, insufficient), adjudicate, void, and Apply gating after each.
- [ ] Spell-casting harness: Pay now after regaining MP pays once; void changes nothing.
- [ ] Manual: the spec's Ench2 rows "That unpaid card: regain MP to 5, Pay now", "Unpaid card: GM records adjudicated
      payment", "Unpaid card: Void" and "Player owns caster, GM authored the card" pass, with reloads.
- [ ] The Magic documentation page explains settlement (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
