# 09: Weapon Enhance binds to a chosen weapon; missing target, rebind or end

**What to build:** Applying Weapon Enhance +2, the review dialog asks which of the recipient's weapons it enhances. The
player picks sword A: only A gains +2 hit and damage; sword B on the same skill, and the skill itself, are unchanged.
Renaming, storing and readying A and reloading keep the binding and the deadline. If A is deleted (even if a sword named
A is imported), the effect shows a **missing target** and contributes nothing while its clock continues; the Effects
list offers an explicit rebind to another weapon of the same recipient, keeping the deadline, or end. If A disappears
while the dialog is open, the recipient goes back for review. Copying A to another actor doesn't carry the enhancement.
First slice of chunk **App6**; see [the spec](../spec.md), section "Recipient target binding (App6)", and user stories
55, 57–62.

A template change can carry a **binding requirement** ("the weapon chosen at application"), recorded in the snapshot.
The choice is stored on the applied effect as the weapon's identity within that recipient actor and feeds the
single-weapon contribution channel from the actor-effects track. No name matching, ever.

**Blocked by:** 03 (Application receipts, repeat clicks and the double-submit guard), [actor-effects 14 (Item-local
weapon hit modifier)](../../v09-actor-effects/issues/14-item-local-weapon-hit.md) (closes Itm1)

**Status:** ready-for-agent

- [ ] Template changes for weapon hit and damage can require a binding; the snapshot records it.
- [ ] The dialog lists the recipient's own weapons for each binding and keeps confirm disabled until each is chosen.
- [ ] Only the bound weapon's tests and damage gain the contribution.
- [ ] A missing bound weapon shows a missing-target state with no contribution; the clock continues.
- [ ] The Effects list offers rebind (same recipient's weapons) or end; rebinding never restarts the duration.
- [ ] Revalidation sends the recipient back for review when the chosen weapon disappeared.
- [ ] Whole-actor copies keep bindings when embedded ids are kept and otherwise show a missing target; copying the
      weapon alone doesn't copy the applied effect.
- [ ] The SRD Weapon Enhance spell ships with its template; the coverage inventory row is updated once it exists.
- [ ] Applied-effects module tests: weapon binding candidates and missing choices; revalidation when the bound weapon is
      deleted.
- [ ] The Magic documentation page explains bindings, missing targets and rebinding.
- [ ] Manual: the spec's App6 rows "Swords A and B on one skill", "A enhanced: rename, store, ready, reload" and "Delete
      A; import a sword named A" pass.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
