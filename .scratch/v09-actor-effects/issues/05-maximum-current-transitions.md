# 05: HP/MP maximum effects move current points

**What to build:** A Referee adds a +4 HP maximum effect to a creature at HP 6/10 and it becomes 10/14; removing the
effect returns it to 6/10. Negative maximum effects lower current points the same way, floored at zero, with no hidden
debt. Disabling, re-enabling and editing an effect move current points only by the resulting change. Reloading never
repeats an adjustment. Temporary pools are never touched. Direct MP-maximum effects move current MP; POW effects leave
MP alone. This is chunk **Fx4**; see [the spec](../spec.md), section "Maximum/current transitions (Fx4)", and user
stories 32–42.

The resource-points module from the resources track gains an "adjust for maximum change" operation: ordinary current
becomes `clamp(current + delta, 0, new maximum)` and the pools are unchanged. It is reached through the Res actor-level
interface. The client that creates, edits, enables, disables or deletes an actor effect compares each resource's
effective normal maximum before and after the event. When it changed, that client makes one follow-up actor update.
Preparation, reload, re-render and other clients never adjust. Item-driven transitions are ticket 17.

**Blocked by:** 04 (Characteristic changes), [resources 07 (Spells can be paid with temporary
MP)](../../v09-resources/issues/07-spells-paid-with-temporary-mp.md) (closes Res2, and Res1 with it)

**Status:** ready-for-agent

- [ ] The editor offers HP normal maximum and MP normal maximum targets (signed add).
- [ ] HP maximum adds its direct contributions to the CON/SIZ formula (existing round-up kept); MP maximum adds its
      direct contributions to unmodified POW.
- [ ] Actor-effect create, change edit, enable, disable and delete trigger at most one transition per resource, using
      the actual change in effective normal maximum (a CON change that moves the maximum by 2 moves current by 2).
- [ ] Two changes leaving the effective maximum unchanged move no points. Native modifier, characteristic and
      advancement edits keep today's behaviour (no transition).
- [ ] Resource-points module tests: every Fx4 transition example as state-in/state-out, zero floors, both directions,
      pools untouched.
- [ ] The Actors documentation page explains how maximum effects move current points; the Fx3 interim note is removed.
- [ ] Manual: every Fx4 row of the spec's acceptance table passes (6/10 + temp 4 with +4 and removal; −4; −8; 2/14
      under +4; Enhance CON +4; disable/enable/reload/edit to +6; attributes-dialog HP modifier edit), on a character
      and an NPC, linked and unlinked, with reloads. Enhance POW leaves MP current unchanged.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
