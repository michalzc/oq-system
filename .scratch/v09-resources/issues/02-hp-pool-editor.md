# 02: HP pool editor: grant, correct, remove

**What to build:** An owner who can edit an actor's sheet opens a pool editor from a control beside HP, sees the
temporary HP pools in FIFO order with label and remaining amount, adds a grant (amount and optional label, defaulting to
a localized "Manual"), corrects a pool's remaining amount without moving it, and removes a pool, discarding only its
remainder. Part of chunk **Res1**; see [the spec](../spec.md), sections "Pure resource-points module", "Actor-level
interface" and "Sheet and pool editor".

The resource-points module gains grant, correct and remove; the base actor gains grant temporary points, correct a
pool and remove a pool, each one document update of the HP pool list (and ordinary current where relevant). These
actor methods are the reuse point for later chunks (Fx4, Clk2, Ench).

**Blocked by:** 01 (Recover legacy HP excess and show temporary HP on the sheet)

**Status:** ready-for-agent

- [ ] A grant always appends a new pool with a fresh identity after every existing pool.
- [ ] Correcting a pool keeps its FIFO position; removing a pool drops only that pool.
- [ ] A pool at zero stays listed until removed.
- [ ] Amounts accept any nonnegative whole number with no upper cap; negative or fractional input is rejected.
- [ ] The editor is an ApplicationV2 dialog alongside the existing attribute/characteristic dialogs, available on
      character and NPC sheets to anyone who can edit HP today (not GM-only), with the parchment theme kept.
- [ ] Grants on an unlinked token's actor change only that token; on a linked token they change the world actor.
- [ ] Pools, their remaining amounts and their order survive a reload unchanged.
- [ ] Resource-points module tests for grant, correct (position kept) and remove (only its pool).
- [ ] Manual: the spec's acceptance rows "Remove A" and "Correct A to 3, then grant C=4" pass on a character and an NPC.
- [ ] The Actors documentation page explains temporary points and the pool editor (edit the HTML source, regenerate
      the journal sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
