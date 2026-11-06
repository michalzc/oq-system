# 04: Unpaid casts instead of underfunded casts

**What to build:** A character with MP 10 shift-click casts a magnitude-3 Personal Magic spell. While the dice are
being resolved, their MP drops to 2. The card shows the success with cost 3 and an **unpaid** banner, MP stays 2, and
Apply effect (if present) is unavailable with the reason shown. Today the cast completes and the deduction is clamped to
zero. A cast that can be paid behaves as before, with its card marked settled. First slice of chunk **Ench2**; see [the
spec](../spec.md), section "Cast operation (Ench2)" (Record, Flow, Unpaid, First write failure, Card rendering), and
user stories 35–36, 38–40, 52–56.

Every MP-costing cast becomes one **cast operation**. Prefactor first: pull the steps after the dice are resolved out of
the spell's casting code into a step runner, so the cast path reads "compute cost, record, pay, post card, settle". The
operation record lives in the caster actor's system data (operation id, caster identity including the token for
synthetic actors, spell identity and name, payment source "personal", magnitude, outcome and roll total, actual cost,
completed steps, card message id, status, settlement). For personal payment the record and the debit are one actor
update through the Res2 spend-MP method, extended to accept the operation id; nothing writes MP fields directly. A cast
that completes in one go may drop its record; an unpaid cast keeps it. The card carries the operation id and status in
its flags.

The magic-store module gains the cast-operation core: for a record and the source's current state, whether payment can
be made now, the remaining steps, and whether Apply effect is allowed (settled, success or critical). If App1 has
landed, Apply effect is gated here; otherwise App1 adds the gate (see the spec's "Delivery and dependencies").

**Blocked by:** [resources 07 (Spells can be paid with temporary MP)](../../v09-resources/issues/07-spells-paid-with-temporary-mp.md)

**Status:** ready-for-agent

- [ ] After the dice, a cost the caster can't pay debits nothing (no partial debit, no zero clamp), keeps the outcome,
      and posts the card with an unpaid banner. Failed and fumbled casts that can't be paid are unpaid too.
- [ ] Payable casts debit once, temporary MP first (oldest pool first), then ordinary MP; outcome costs follow today's
      rules (success and fumble full, failure and critical one MP, Sorcery as today).
- [ ] The card shows the payment source (personal) and status; settled cards look like today's plus that line.
- [ ] Apply effect is unavailable on unpaid success cards with the reason shown (when App1 is present).
- [ ] Shift-click quick casting uses the same operation.
- [ ] The pre-roll affordability check, the recheck after the dialog and "cancel writes nothing" are unchanged.
- [ ] If the first write (record plus debit) is rejected, nothing is charged or recorded, no card is posted and the cast
      is reported as not recorded.
- [ ] Non-rolled Divine casting gains no operation; cards without an operation id keep their existing behavior.
- [ ] Magic-store module tests: payment possible or not, remaining steps for a fresh operation, Apply gating by status
      and outcome.
- [ ] Spell-casting harness: the "MP changed during dice fulfillment" cases now end unpaid with MP unchanged and an
      unpaid card (the existing zero-clamp tests are deliberately changed; call this out in the PR description); quick
      casts follow the same rules; a rejected first write posts nothing and charges nothing.
- [ ] Manual: the spec's Ench2 row "MP 10, magnitude-3 Personal Magic spell, quick cast" passes on a character and an
      NPC, with a reload.
- [ ] The Magic documentation page explains unpaid casts (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
