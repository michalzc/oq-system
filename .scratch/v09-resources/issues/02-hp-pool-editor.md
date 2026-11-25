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

**Status:** resolved

- [x] A grant always appends a new pool with a fresh identity after every existing pool.
- [x] Correcting a pool keeps its FIFO position; removing a pool drops only that pool.
- [x] A pool at zero stays listed until removed.
- [x] Amounts accept any nonnegative whole number with no upper cap; negative or fractional input is rejected.
- [x] The editor is an ApplicationV2 dialog alongside the existing attribute/characteristic dialogs, available on
      character and NPC sheets to anyone who can edit HP today (not GM-only), with the parchment theme kept.
- [x] Grants on an unlinked token's actor change only that token; on a linked token they change the world actor.
- [x] Pools, their remaining amounts and their order survive a reload unchanged.
- [x] Resource-points module tests for grant, correct (position kept) and remove (only its pool).
- [x] Manual: the spec's acceptance rows "Remove A" and "Correct A to 3, then grant C=4" pass on a character and an NPC.
- [x] The Actors documentation page explains temporary points and the pool editor (edit the HTML source, regenerate
      the journal sources).
- [x] `yarn test`, `yarn lint` and `yarn build` pass.

## Comments

### 2026-11-25 implementation notes

- Module (`src/module/utils/resource-points.js`): `grantPool`, `correctPool`, `removePool`, `isPointAmount` and
  `parsePointAmount` (typed input). They work on the pool list; grant and correct reject amounts that are not
  nonnegative whole numbers (`RangeError`), grant rejects a duplicate identity, correct rejects an unknown pool, and
  removing a pool already gone changes nothing.
- Actor (`OQBaseActor`): `temporaryPools(resource)`, `grantTemporaryPoints(resource, amount, label)` (fresh
  `randomID`, blank label → localized "Manual"), `correctTemporaryPool(resource, poolId, remaining)`,
  `removeTemporaryPool(resource, poolId)`; each is one update of `system.attributes.<resource>.pools`. `resource` is
  `hp` until ticket 05 adds MP pools.
- Dialog: `TemporaryPointsDialog` (`application/temporary-points-dialog.js`), one per actor and resource, opened by
  the layers icon beside HP when the sheet is editable. Every change saves at once (grant on submit/Enter, correct on
  change, remove by the trash icon). Unlike the other actor dialogs it registers in `actor.apps`, so it re-renders
  when the actor changes (damage, another user's edit) and never shows stale pools. `OQActorDialog` now accepts an
  `id` and forwards `open(actor, options)` for that.
- Grant amount inputs are `type=number min=0 step=1 required`: negative, fractional or blank grants are stopped by
  the browser's validation bubble before the handler; the handler also rejects them with "Enter a whole number of 0
  or more." A rejected correction shows that message and the field snaps back to the stored amount.
- Sheet layout fix: the HP number input no longer shrinks when "+N" and the control share its row (`flex: 0 0 2em`);
  on the character sheet it had collapsed to a sliver since ticket 01's "+N".

### 2026-11-25 manual QA

Foundry 14.370, `oq-dev`. The world had been shut down to the setup screen during the work (not by this session); it
was relaunched with the user's approval. Driven through the sheet control and dialog DOM.

| Row | Character (`QA pools PC`) | NPC (`QA pools NPC`) |
| --- | --- | --- |
| HP 6/10, A=4, B=3 → Remove A | 6/10, B=3 | 6/10, B=3 |
| HP 6/10, A=1 → Correct A to 3, then grant C=4 | A(3), C(4); sheet "6 / 10 +7" | A(3), C(4); "6 / 10 +7" |
| Grant -1 / 1.5 / blank; correct C to -2 | Pools unchanged; correction message shown, C back to 4 | Same |
| Grant 0 with a blank label; correct A to 0 | `Manual=0` appended last; A=0 stays listed | Same |

- Linked token of the character: a grant from its sheet landed on the world actor; the token has no delta.
- Unlinked token of the NPC: a grant landed in the token's delta only; the base NPC and another unlinked token were
  unchanged. With the token's editor open, `correctTemporaryPool` from the console re-rendered it with the new amount.
- Player `Edek` (owner of the character, not GM), after a reload: pools, amounts and order identical to before the
  reload; granting "Player grant" 3 and removing "Manual" worked; sheet "6 / 10 +9".
- Parchment theme kept (screenshot). No console errors or warnings.
- `yarn build` (with packs) ran while the world was stopped; `yarn build:docs` regenerated the documentation journal.

QA fixtures left in `oq-dev`: `QA pools PC` (now owned by `Edek`), `QA pools NPC`, tokens `QA pools linked` and
`QA pools unlinked`.

### 2026-11-25 review

Two-axis review (standards, spec) of 2d9a9c8. Changes made:

- Enter in a pool's Remaining field submitted the form, which grants: with an amount waiting in the grant row it
  created an unconfirmed pool. Enter there now only confirms the correction. Verified with real key input: typing 6 +
  Enter in C's field set C=6 and granted nothing; 2 + Enter in the grant row still granted `Manual=2`.
- Correcting a pool that someone else removed meanwhile threw "Unknown pool"; it now re-renders the stored pools.
  Verified in-world, no errors.
- `OQActorDialog.dialogId(actor, options)` replaces the copied id recipe; the pool editor's id is
  `TemporaryPointsDialog-<actor uuid>-<resource>`. The base class documents that a live dialog registers in
  `actor.apps`. Attributes dialog still opens with its old id.
- Amount parsing and its message live in one dialog helper; the dialog's correction handler is
  `onCorrectRemaining`; `isPointAmount` is module-private; `temporaryPools` says why it reads the source.
- Actors page: "Earlier versions … could store a current value above the maximum" (it no longer implies typing above
  the maximum is prevented; ticket 03 adds that clamp).

Kept: a grant being typed is cleared when someone else changes the actor, the price of never showing stale pools.
