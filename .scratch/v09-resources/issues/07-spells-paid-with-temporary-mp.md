# 07: Spells can be paid with temporary MP

**What to build:** A player can cast an MP spell they can afford only thanks to temporary MP. Affordability, the cast
dialog's maximum affordable magnitude, shift-click quick casting and the recheck after the dialog closes all use
available MP (ordinary plus temporary). Payment spends temporary MP first, oldest pool first, then ordinary MP.
Cancelling the dialog writes nothing, and the chat card reports MP spent exactly as today. Divine (no-MP) casting is
unchanged. Completes chunk **Res2**; see [the spec](../spec.md), section "Update routes" (spell payment row).

Spell casting calls the actor's read available MP and spend MP methods instead of reading or writing the stored MP
value directly.

**Blocked by:** 06 (MP spend and gain routes take temporary MP first)

**Status:** resolved

- [x] A cast funded only by temporary MP is allowed.
- [x] The maximum affordable magnitude and shift-click capping count temporary MP.
- [x] Payment is FIFO across pools, then ordinary MP; underfunded-cast behavior is otherwise unchanged.
- [x] A cancelled dialog leaves ordinary MP and every pool unchanged.
- [x] MP changed while the dialog is open (ordinary or pools) is respected by the post-dialog recheck and payment.
- [x] Spell-casting harness tests: the stub actor carries temporary MP pools and covers each case above.
- [x] Manual: the spec's acceptance rows "Cast costing 5", "Cast costing 3" with MP 0/10 + A=3, and "Open cast dialog,
      cancel" pass, with a reload keeping the remaining pool and order.
- [x] The Magic documentation page explains spell payment with temporary MP and gives a short pointer for manual Tap
      bookkeeping (edit the HTML source, regenerate the journal sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-26 implementation notes

- `OQSpell#castMagicPointsSpell` reads `actor.availableMp()` (ordinary plus temporary) for the affordability check,
  the maximum affordable magnitude (dialog and shift-click) and the post-dialog recheck, and pays with
  `actor.spendMp(mpSpent)`: pools first, oldest first, then ordinary MP, floored at zero. Nothing else changed: the
  card reports `mpSpent` as before, a cancelled dialog returns before any write, Divine casting is untouched.
- Spell-casting harness: the stub caster is now an `OQBaseActor` instance (a stub `Actor` global) with MP pools, so
  the tests run the real `availableMp`/`spendMp`. New cases: a cast funded only by a pool, FIFO across two pools then
  ordinary MP, temporary MP in the dialog's maximum and shift-click, cancel writing nothing, pools lowered (refused,
  no roll) or replaced (paid from the current pools) while the dialog is open, and pools shrinking during dice
  fulfillment (floored, card still reports the cost). The existing ordinary-MP cases pass unchanged.
- The dialog rejects a magnitude above the maximum it offered when it opened (existing behaviour), so MP granted while
  it is open is used for payment but does not raise the offered maximum.
- Docs: Magic page explains temporary MP in casting and gives the manual Tap bookkeeping (excess as a "Tap" pool,
  lowered one point per minute once the spell finishes, per the SRD); the Actors page sentence that casting spent
  ordinary MP only now points to the Magic page.

### 2026-11-26 manual QA

Foundry 14.370, `oq-dev`, GM client (Chromium via DevTools MCP). New fixtures `QA cast PC` (character) and
`QA cast NPC`, each with Personal Magic Casting and a variable Personal spell `QA Bolt` (magnitude 5). Casts went
through `rollItemTest` (the sheet's call) and the cast dialog's own buttons; d100 forced to 5 (success).

| Row | Observed |
| --- | --- |
| MP 8/10, A=2 then B=4, cast costing 5 (character, dialog) | Stored 8/10, A=0, B=1; card "MP Spent 5". After a reload the same values and order. |
| MP 0/10 + A=3, cast costing 3 (NPC) | Dialog offered magnitude 3; shift-click cast magnitude 3 → 0/10, A=0; card "MP Spent 3". |
| MP 8/10 + A=4, open cast dialog, cancel (character; also the NPC at 0 + A=3) | No actor update, no chat message, stored MP identical. |

Console: no errors or warnings. Not checked: a player client.

### 2026-11-26 review

This fork could not start review sub-agents, so the two axes were checked directly against `CODING_STANDARDS.md` and
the spec: casting now goes through the MP resource methods (one route per resource change), `spendMp` writes only
what changed, and every new documentation sentence holds for variable, non-variable and sorcery spells. No findings.
A fresh two-axis review of the whole Res2 branch is still advisable before its PR.
