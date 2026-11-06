# 07: Spells can be paid with temporary MP

**What to build:** A player can cast an MP spell they can afford only thanks to temporary MP. Affordability, the cast
dialog's maximum affordable magnitude, shift-click quick casting and the recheck after the dialog closes all use
available MP (ordinary plus temporary). Payment spends temporary MP first, oldest pool first, then ordinary MP.
Cancelling the dialog writes nothing, and the chat card reports MP spent exactly as today. Divine (no-MP) casting is
unchanged. Completes chunk **Res2**; see [the spec](../spec.md), section "Update routes" (spell payment row).

Spell casting calls the actor's read available MP and spend MP methods instead of reading or writing the stored MP
value directly.

**Blocked by:** 06 (MP spend and gain routes take temporary MP first)

**Status:** ready-for-agent

- [ ] A cast funded only by temporary MP is allowed.
- [ ] The maximum affordable magnitude and shift-click capping count temporary MP.
- [ ] Payment is FIFO across pools, then ordinary MP; underfunded-cast behavior is otherwise unchanged.
- [ ] A cancelled dialog leaves ordinary MP and every pool unchanged.
- [ ] MP changed while the dialog is open (ordinary or pools) is respected by the post-dialog recheck and payment.
- [ ] Spell-casting harness tests: the stub actor carries temporary MP pools and covers each case above.
- [ ] Manual: the spec's acceptance rows "Cast costing 5", "Cast costing 3" with MP 0/10 + A=3, and "Open cast dialog,
      cancel" pass, with a reload keeping the remaining pool and order.
- [ ] The Magic documentation page explains spell payment with temporary MP and gives a short pointer for manual Tap
      bookkeeping (edit the HTML source, regenerate the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
