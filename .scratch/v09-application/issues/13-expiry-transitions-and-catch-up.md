# 13: Expiry moves HP/MP once, and the GM catches up after a reload

**What to build:** A creature at HP 10/14 under a +4 HP maximum effect, with a temporary-HP pool B=3, has the effect's
deadline pass while nobody is connected. When the GM loads the world, the effect is marked expired and HP becomes 6/10
with B=3 untouched; reloading again changes nothing. Effects that expire while the GM is connected adjust current points
the same way, exactly once, like disabling them. Third and last slice of chunk **Clk1**; see [the spec](../spec.md),
section "Clocks (Clk1)" (expiry transitions and catch-up), and user stories 74, 75.

Expiry is a lifecycle event for the actor-effects maximum/current transition, run once by the active GM that persists
the expiry. On ready, the active GM asks the pure module for effects past their deadline but not marked expired, on
world actors and on unlinked token actors in every scene, marks them expired and runs their transitions once. A
persisted expired state is never processed again. Before writing code, check in the v14 sources whether core's registry
already covers unlinked token actors on inactive scenes.

**Blocked by:** 12 (World-time clocks), [actor-effects 05 (HP/MP maximum effects move current
points)](../../v09-actor-effects/issues/05-maximum-current-transitions.md) (closes Fx4)

**Status:** ready-for-agent

- [ ] Expiry of an effect that changed an HP or MP maximum runs the maximum/current transition once, in the active GM's
      expiry write; other clients never adjust.
- [ ] On world ready the active GM catches up elapsed but unmarked effects on world actors and on unlinked token actors
      in every scene, once.
- [ ] Already expired effects and effects without a clock are never processed.
- [ ] Applied-effects module tests: catch-up selection (elapsed but unmarked, already marked, no clock, combat gone).
- [ ] The Combat documentation page explains catch-up on load.
- [ ] Manual: the spec's Clk1 row "HP 10/14 under a +4 maximum effect, deadline passed while offline, pool B=3" passes
      on a world actor and an unlinked token on an inactive scene, with a second reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
