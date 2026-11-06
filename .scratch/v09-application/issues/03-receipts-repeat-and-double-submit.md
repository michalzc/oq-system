# 03: Application receipts, repeat clicks and the double-submit guard

**What to build:** The ally's owner applies Protection 3 and then clicks Apply effect on the same card again. The dialog
shows the earlier application from this card and the current state of its effect (active, disabled, ended). Confirming
without ticking **new application** keeps the existing one: AP stays 5, no second effect, no duration refresh. A
double-click on confirm, or two simultaneous submissions, creates one effect and one receipt. Deleting the applied
effect and reopening the card, as the ally's owner without rights to edit the caster's message, shows that the
application ended; applying again needs the explicit tick. Third and last slice of chunk **App1**; see [the
spec](../spec.md), section "Application workflow" (Repeat, Write, Application receipt), and user stories 19–22, 84.

Each confirmation has an application id. The applied effect's id is derived deterministically from the application id
and the recipient, so a resubmission or retry of an already-written recipient can't create a second effect and reports
the existing one as applied. The confirm control is disabled while writing. The recipient actor's system data gains
**application receipts**: application id, card message id, template key, source name, applied effect id, confirmed time
and, once ended, the end time. Deleting the applied effect marks its receipt ended. Receipts never recreate effects.
Before writing code, confirm in the v14 sources that an embedded effect can be created with a caller-supplied id on
world actors and on unlinked token actors.

**Blocked by:** 02 (Apply effect from a successful spell card)

**Status:** ready-for-agent

- [ ] A confirmed application writes the applied effect, then the receipt, on the recipient (world actor or unlinked
      token actor); nothing is written to the caster's message.
- [ ] The dialog shows earlier receipts for this card with the current state of their effect; applying again needs a
      per-recipient "new application" tick, and unticked the recipient is kept as is.
- [ ] Applied effect ids derive from application id and recipient; double submission yields one effect and one receipt.
- [ ] Deleting an applied effect marks its receipt ended with the end time.
- [ ] Duplicating, exporting and importing an actor keeps its receipts, which refer only to the copy's own effects.
- [ ] Applied-effects module tests: repeat detection from receipts, the new-application requirement, deterministic
      effect ids and outcomes for an already-written recipient.
- [ ] The Magic documentation page explains receipts and repeat applications.
- [ ] Manual: the spec's App1 rows "Click again; keep", "Double-click confirm on a new application" and "Delete the
      applied effect; reopen the card as ally owner" pass, with reloads, on linked and unlinked tokens.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
