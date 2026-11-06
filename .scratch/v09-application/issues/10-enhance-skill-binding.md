# 10: Enhance Skill binds to a chosen skill

**What to build:** Applying Enhance Skill +20, the dialog asks which of the recipient's skills it enhances. Bound to
Stealth, rolling Stealth adds 20 and rolling Perception adds nothing. The binding survives renames and reload; a deleted
skill shows a missing target with an explicit rebind or end, exactly like weapon bindings. Second and last slice of
chunk **App6**; see [the spec](../spec.md), section "Recipient target binding (App6)", and user stories 56, 57, 59, 60,
62.

Skill bindings feed the actor-effects named-skill selector by skill identity within the recipient. Hinder uses the same
binding when its template ships (content track).

**Blocked by:** 09 (Weapon Enhance binds to a chosen weapon), [actor-effects 06 (Named-skill test modifiers and the
strongest magic modifier)](../../v09-actor-effects/issues/06-named-skill-test-modifiers.md)

**Status:** ready-for-agent

- [ ] Template skill-test changes can require a skill binding; the dialog lists the recipient's own skills.
- [ ] The chosen skill feeds the named-skill selector by identity; other skills are unaffected.
- [ ] Missing skill, rebind and end behave as for weapons; revalidation catches a skill deleted while the dialog is
      open.
- [ ] The SRD Enhance Skill spell ships with its template; the coverage inventory row is updated once it exists.
- [ ] Applied-effects module tests: skill binding candidates, missing choices and revalidation.
- [ ] The Magic documentation page covers skill bindings.
- [ ] Manual: the spec's App6 row "Enhance Skill +20 bound to Stealth" passes, plus deleting Stealth and rebinding.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
