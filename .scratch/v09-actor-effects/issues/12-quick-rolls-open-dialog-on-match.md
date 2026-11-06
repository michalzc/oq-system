# 12: Quick rolls open the dialog when a choice matches

**What to build:** A player shift-clicks a skill, weapon, rolled ability or MP spell. If a conditional choice matches
the test, the normal dialog opens with that choice unchecked; otherwise the roll stays quick and the result card carries
the reminders (only Demoralise active: shift-clicking Close Combat rolls immediately and the card shows the Demoralise
reminder). Hotbar and macro rolls follow the same rule. Second and last slice of chunk **Fx6b**; see [the
spec](../spec.md), section "Test resolution" (quick rolls), and user stories 66–69.

Every skip-dialog entry point asks one pure predicate: does any conditional choice match this test?

**Blocked by:** 11 (Choices and reminders in casting and rolled-ability dialogs)

**Status:** ready-for-agent

- [ ] Sheet shift-click, macro and hotbar calls, and quick casting of MP spells all consult the same pure predicate.
- [ ] A matching conditional opens that path's normal dialog; no match keeps the roll quick.
- [ ] Quick result cards carry reminders (and the applied unconditional magic modifier, as normal cards do).
- [ ] Non-rolled Divine casting is unchanged.
- [ ] Roll test file: the predicate (matching conditional → dialog; unconditional-only or reminder-only → quick).
- [ ] The Rolls documentation page explains quick-roll behaviour.
- [ ] Manual: the spec's Fx6b rows (Hinder on Stealth; only Demoralise active; matching conditional on a casting skill
      via shift-click and macro) pass.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
