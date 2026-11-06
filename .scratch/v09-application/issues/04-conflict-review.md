# 04: Conflict review: duplicates, replace and end-marks

**What to build:** An ally with Protection 2 active and 2 AP armour receives Protection 3 from another caster's card.
The dialog lists the ally's existing applied effects with their rules text and highlights Protection 2 as a possible
duplicate (same template key or same name). The user must choose keep existing, replace or apply alongside; confirm
stays disabled until they do. Replace ends Protection 2 and applies Protection 3 in one confirmation (AP 5, never 7);
keep changes nothing (AP 4, duration untouched). Applying Demoralise, the user can mark Fanaticism to end as part of the
application. If another user changes the ally while the dialog is open, the ally goes back for review and nothing is
written for it. This is chunk **App2**; see [the spec](../spec.md), sections "Pure applied-effects module" (planning,
revalidation) and "Application workflow", and user stories 26–33.

Planning reports possible duplicates and the other existing applied effects. Revalidation compares the confirmed plan
with a fresh plan just before writing and reports "needs review" when permission, the duplicate set, the effects marked
to end, or the receipt state changed. Ending uses the same delete path as the Effects list. There is no stacking or
cancellation engine: the dialog only presents effects and rules for a human decision.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard)

**Status:** ready-for-agent

- [ ] Each recipient row lists its existing applied effects with rules text; same template key or same name is
      highlighted as a possible duplicate, whichever card it came from.
- [ ] Each duplicate needs an explicit keep, replace or alongside choice with no default; confirm is disabled until the
      plan is complete.
- [ ] Other existing effects can be marked to end; marked and replaced effects are ended before the new effect is
      created, and their receipts are marked ended.
- [ ] Revalidation before writing sends the recipient back for review when the duplicate set, the marked effects,
      permission or receipts changed; nothing is written for it.
- [ ] Applied-effects module tests: duplicate detection by template key and by name; plan completeness until each
      duplicate is decided; revalidation cases (new conflicting effect, marked effect already gone, permission lost,
      receipt appeared).
- [ ] The Magic documentation page explains the conflict review.
- [ ] Manual: every App2 row of the spec's acceptance table passes (replace, keep, Fanaticism/Demoralise end-mark,
      concurrent application by another user).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
