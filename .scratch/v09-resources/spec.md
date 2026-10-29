# v0.9 resources: temporary HP and MP pools

Status: ready-for-agent

Track **Res** of the v0.9 effects release: chunks **Res1** (temporary HP pools) and **Res2** (temporary MP pools).
Source plan: [effects release map](../effects-release/map.md) and its
[release chunks decision](../effects-release/issues/08-release-chunks.md). Policies come from the resolved decisions
[02 resource semantics](../effects-release/issues/02-resource-semantics.md),
[03 lifetime and duplicates](../effects-release/issues/03-lifetime-and-duplicates.md) (source-specific pools, FIFO) and
[09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md) (legacy excess). Every
chunk must meet the [definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

## Problem Statement

A Referee running OpenQuest in Foundry has no way to give a creature HP or MP beyond its normal maximum. Vigour's
magical HP, Tap's surplus MP and ad hoc "you have 5 extra HP until sunrise" rulings all need points that are spent
before ordinary points and that healing or rest does not refill. Today the only option is typing a current value above
the maximum, and that is fragile: the sheet shows it clamped to the maximum, and the next damage, healing, MP button,
sheet +/- click, token HUD edit or spell payment writes the clamped value back, silently throwing the extra points away.
Spell payment and affordability likewise see only clamped ordinary MP. Existing worlds may already hold such hidden
excess that the next action will destroy.

## Solution

Each actor's HP and MP gain **temporary points**, kept separately from ordinary points as an ordered list of
**temporary-point pools**, one per grant. The sheet shows ordinary current/maximum plus the available temporary total,
and opens a pool editor where an owner can add a grant, correct a pool's remaining amount or remove a pool.
Explicit damage, MP spending and quick decreases take points from the oldest pool first (FIFO), then from ordinary
points, floored at zero. Healing, MP gain buttons and quick increases restore ordinary points only, up to the normal
maximum. Spell affordability and payment use ordinary plus temporary MP. Tokens make the temporary amount visible on
the HUD and on the canvas bar. Hidden above-maximum values stored by earlier versions are recovered once into a single
"recovered excess" pool per resource, preserving the total.

Res1 delivers this for HP, including legacy HP recovery. Res2 adds the same for MP, including payment and legacy MP
recovery.

## User Stories

### Temporary HP (Res1)

1. As a Referee, I want to grant an actor a number of temporary HP from its sheet, so that I can apply rulings and
   spell benefits that give HP beyond the normal maximum.
2. As a Referee, I want to label a grant (e.g. "Vigour from Aldric", "Blessing"), so that I can tell grants apart
   later.
3. As a Referee, I want each grant to become its own pool listed in grant order, so that I can see which points
   come from where.
4. As a player, I want my sheet to show ordinary HP as current/maximum and temporary HP as a separate "+N", so that I
   know both my real wounds and my buffer at a glance.
5. As a player, I want the "+N" to show only the available temporary total, so that the number I see is the number I
   can lose before ordinary HP drops.
6. As a Referee, I want damage applied from a chat card to take temporary HP first, so that magical HP absorbs blows
   as the rules intend.
7. As a Referee, I want damage to drain the oldest pool completely before touching the next, so that spending follows
   a predictable order.
8. As a Referee, I want damage exceeding all temporary HP to continue into ordinary HP, floored at zero, so that one
   hit can break through the buffer and wound.
9. As a Referee, I want the chat damage message to say how much of the damage the temporary HP absorbed, so that
   everyone at the table understands why ordinary HP changed less than the damage roll.
10. As a Referee, I want armour to still reduce normal damage before temporary HP is touched, so that temporary HP
    does not change how armour works.
11. As a Referee, I want "ignore armour" damage to go to temporary HP first as well, so that both damage buttons
    agree.
12. As a Referee, I want a fully soaked hit to leave temporary HP untouched, so that armour soaks before magic.
13. As a Referee, I want healing from a chat card to restore only ordinary HP up to its maximum, so that healing never
    refills magical HP.
14. As a Referee, I want healing an actor at full ordinary HP to report that nothing was healed while leaving its
    temporary HP intact, so that the message is honest.
15. As a player, I want to correct my ordinary HP by typing a number on the sheet without touching my temporary HP, so
    that bookkeeping corrections are not mistaken for damage.
16. As a player, I want a typed ordinary HP above the maximum to be stored as the maximum, so that the system never
    again hides points above the maximum in the ordinary value.
17. As a player, I want right-clicking the HP label (−1) to take a point from temporary HP first, so that the quick
    control behaves like damage.
18. As a player, I want left-clicking the HP label (+1) to restore ordinary HP only, up to the maximum, so that the
    quick control behaves like healing.
19. As a Referee, I want to correct a pool's remaining amount in the pool editor without moving it in the FIFO order,
    so that I can fix mistakes without changing which points are spent first.
20. As a Referee, I want a new grant always to go after every existing pool, so that a fresh grant never jumps the
    queue.
21. As a Referee, I want a pool spent down to zero to stay listed at zero until I remove it, so that I can still see
    and correct it.
22. As a Referee, I want to remove a pool, discarding only its remaining points, so that ending one benefit never
    takes points granted by another.
23. As a Referee, I want grant amounts and corrections to accept any nonnegative whole number without an upper cap,
    so that I can follow rules with their own unusual limits.
24. As a Referee, I want negative or fractional amounts rejected in the pool editor, so that pools cannot go invalid.
25. As a Referee, I want ordinary HP, every pool's remaining amount and their order to survive a reload unchanged, so
    that preparation never grants or loses points.
26. As a Referee, I want the token HUD to show the temporary HP total next to the HP bar input, so that I can see it
    while running combat from the canvas.
27. As a Referee, I want the canvas HP bar to show a distinct marker when temporary HP exists, even when the ordinary
    bar is full, so that I notice buffered creatures.
28. As a Referee, I want typing "-5" into the token HUD HP input to take temporary HP first, so that the HUD agrees
    with chat damage.
29. As a Referee, I want typing "+3" into the token HUD HP input to restore ordinary HP only, up to the maximum, so
    that the HUD agrees with chat healing.
30. As a Referee, I want typing an absolute number into the token HUD HP input to set ordinary HP only, clamped to
    0…maximum, so that it agrees with typing on the sheet.
31. As a Referee, I want all of the above to behave the same for characters and NPCs, so that I don't need to
    remember which sheet type I'm using.
32. As a Referee, I want damage and grants on an unlinked token to change only that token's actor, so that two goblins
    from the same base actor keep separate temporary HP.
33. As a Referee, I want damage and grants on a linked token to change the shared world actor, so that sheet and token
    agree.
34. As a player who owns an actor, I want to manage its temporary HP the same way I can already edit its HP, so that
    I don't need the Referee for routine bookkeeping.
35. As a Referee upgrading a world, I want any HP still stored above an actor's normal maximum to be recovered into one
    "recovered excess" temporary HP pool, so that the upgrade does not destroy points the actor had.
36. As a Referee, I want that recovery to happen once only, however many times the world reloads or the migration
    retries, so that nobody gains points from upgrading.
37. As a Referee, I want actors whose HP was within its maximum to get no recovery pool, so that upgrading does not
    clutter sheets.
38. As a Referee, I want the recovery to use the maximum calculated from characteristics and the HP modifier, not the
    stale stored maximum, so that the recovered amount is correct.
39. As a Referee, I want an actor with a zero normal maximum to have all of its stored positive HP recovered as
    temporary HP, so that no points are lost.
40. As a Referee, I want each unlinked token's own stored HP recovered independently of its base actor and of other
    tokens, so that tokens don't gain or lose points they never had.
41. As a Referee, I want actors in my locked world compendia converted too, with the lock restored, so that my
    prepared creatures don't lose excess when I later import them.
42. As a Referee, I want an old actor JSON file or an old compendium actor imported after the upgrade to receive the
    same recovery, so that late imports are safe.
43. As a Referee, I want points that an earlier version had already clamped away to stay lost rather than being
    guessed back, so that the upgrade does not invent HP.
44. As a Referee, I want the recovered pool to behave like any manual pool (FIFO, not refilled by healing, editable,
    removable, no expiry), so that I can tidy it up when I decide where those points came from.

### Temporary MP (Res2)

45. As a Referee, I want to grant, label, correct and remove temporary MP pools exactly as for HP, so that Tap's
    surplus and similar rulings can be tracked.
46. As a player, I want my sheet to show ordinary MP as current/maximum plus a separate "+N" temporary MP total, so
    that I know what I can spend.
47. As a player, I want to cast a spell I can afford only with temporary MP, so that granted MP is actually usable.
48. As a player, I want the cast dialog's maximum affordable magnitude to count temporary MP, so that variable spells
    offer every magnitude I can pay for.
49. As a player, I want a shift-click quick cast to pick the highest magnitude affordable with ordinary plus temporary
    MP, so that quick casting agrees with the dialog.
50. As a player, I want casting to spend temporary MP first, oldest pool first, then ordinary MP, so that surplus
    points go before my own.
51. As a player, I want a cancelled cast dialog to leave ordinary MP and every pool unchanged, so that cancelling is
    free.
52. As a player, I want the affordability check repeated against the current ordinary plus temporary MP after the
    dialog closes, so that MP changed while the dialog was open is respected.
53. As a player, I want the cast's chat card to report the MP spent exactly as today, so that the card's meaning does
    not change.
54. As a Referee, I want the chat "spend MP" button to take temporary MP first, so that it agrees with casting.
55. As a Referee, I want the chat "gain MP" button to restore ordinary MP only, up to the maximum, so that ordinary
    regeneration never creates or refills temporary MP.
56. As a Referee, I want resting/regaining MP to leave temporary pools alone, so that a surplus does not regenerate.
57. As a Referee, I want right-click −1 on the MP label and "-N" on the token HUD MP input to spend temporary MP
    first, and +1/"+N" to restore ordinary MP only, so that quick controls agree with HP.
58. As a Referee, I want the token HUD and canvas MP bar to show temporary MP the same way as temporary HP, so that
    both resources look consistent.
59. As a Referee, I want to follow Tap manually by granting the overflow above ordinary maximum as a temporary MP pool
    and later lowering it one point per minute, so that Tap is playable without dedicated automation.
60. As a Referee upgrading a world, I want MP still stored above the normal maximum recovered into one "recovered
    excess" temporary MP pool, with no spell or store attribution and no decay timer, so that the upgrade preserves
    MP totals.
61. As a Referee, I want MP recovery to follow every HP recovery guarantee (once only, calculated maximum, zero
    maximum, unlinked tokens, locked world compendia, late imports, no reconstruction), so that both resources are
    equally safe.

### Cross-cutting

62. As a developer of a later chunk (Vigour, maximum transitions, magic point stores), I want one actor-level way to
    grant, spend, damage, heal and read available points, so that new features reuse the same rules instead of
    reimplementing them.
63. As a macro author, I want the existing ordinary value fields to keep meaning "ordinary current points", so that
    existing macros reading or writing them keep working.
64. As a Referee, I want the system documentation journal to explain temporary points, the pool editor, FIFO spending,
    healing and the token display, so that the table can learn the feature in game.

## Implementation Decisions

### Resource model

- Each of HP and MP has: ordinary current points (the existing stored current value, unchanged in meaning), the
  normal maximum (unchanged calculation from characteristics plus the attribute modifier) and a new stored, ordered
  list of temporary-point pools. List order is FIFO grant order; it is stable across reloads and for grants made at
  the same world time.
- A pool records a stable identity, a human-readable label and its remaining amount (nonnegative integer, no upper
  cap). Res adds no expiry, suspension or effect-link fields; later chunks (Clk2 Vigour) extend the pool record when
  they need them. No infrastructure is added ahead of its behavior.
- Prepared data exposes the available temporary total per resource (sum of remaining amounts) for sheets, token
  display and later chunks. It is derived, never stored, and preparation never writes resource state.
- The preparation clamp of ordinary current to the normal maximum stays. In the new format the system's own controls
  never store ordinary current above the normal maximum: every route writes ordinary current clamped to 0…maximum.
  Excess exists only as pools.
- An exhausted pool (remaining zero) stays listed until a person removes it. Spending skips it.

### Pure resource-points module (the main seam)

A new pure module, free of Foundry calls at import time, owns all point arithmetic over a plain resource state
(ordinary current, normal maximum, ordered pools). Every operation returns the new state plus a breakdown of how
much came from pools and how much from ordinary points, so callers can write one update and report it in chat:

- **Spend / damage** an amount: FIFO across pools with remaining points, then ordinary current, floored at zero.
  Damage and MP spending are the same operation; damage-specific armour handling stays in the caller.
- **Restore** an amount: ordinary current only, capped at normal maximum; pools untouched.
- **Set ordinary**: ordinary current clamped to 0…maximum; pools untouched.
- **Grant**: append a new pool with a fresh identity at the end of the list.
- **Correct**: set one pool's remaining amount, keeping its position.
- **Remove**: drop one pool and its remainder only.
- **Available total**: ordinary current plus available temporary points (used for MP affordability).
- **Legacy excess conversion** (see Compatibility) also lives here.

### Actor-level interface

The base actor gains a small set of methods wrapping the module, each performing a single document update of the
ordinary current value and the pool list together: damage HP, heal HP, spend MP, gain MP, grant temporary points,
correct a pool, remove a pool, and read available MP. All HP/MP mutation routes call these; none touch the stored
fields directly. They are the reuse point for Fx4, Clk2 and Ench chunks.

### Update routes

| Route | Behavior |
| --- | --- |
| Chat apply damage (normal / ignore armour) | Armour reduction as today, then spend/damage. The message reports total damage taken and the part absorbed by temporary HP; "soaked" when armour stops it all. |
| Chat apply healing | Restore ordinary HP; message reports the ordinary points actually restored. |
| Chat MP button, negative | Spend MP (FIFO first). Message reports total spent. |
| Chat MP button, positive | Restore ordinary MP only. Message reports ordinary points actually gained. |
| Spell payment (MP spells) | Affordability, maximum affordable magnitude and the post-dialog recheck use available MP (ordinary + temporary). Payment spends FIFO. Cancelling writes nothing. Divine (no-MP) casting unchanged. |
| Sheet number input | Set ordinary, clamped 0…maximum. |
| Sheet label click +1 / right-click −1 | +1 restores ordinary only; −1 spends/damages one point FIFO. |
| Token HUD bar input | Relative decrease spends/damages FIFO; relative increase restores ordinary only; absolute value sets ordinary, clamped. Implemented by overriding the actor's token-attribute modification for the HP and MP bars; other attributes keep core behavior. |

Chat-driven updates keep today's targeting (controlled tokens, deduplicated actors, synthetic actors for unlinked
tokens).

### Sheet and pool editor

- Character and NPC sheets share the attributes part: HP and MP show `current / max` and, when the temporary total is
  above zero, a distinct "+N" indicator. A control beside each resource opens the pool editor for owners who can edit
  the sheet (same permission as editing HP/MP today; not GM-only).
- The pool editor is an ApplicationV2 dialog alongside the existing attribute/characteristic dialogs. It lists pools
  in FIFO order with label and remaining amount, lets the user correct a remaining amount, remove a pool, and add a
  grant (amount, optional label defaulting to a localized "Manual"). Input is validated as nonnegative integers.
- The light parchment sheet theme is kept. New strings go under `OQ.*` in the English localization source.

### Token presentation

- The token HUD shows "+N" next to the HP and MP bar inputs when the corresponding temporary total is above zero.
- The canvas bar for HP/MP draws a small distinct marker when temporary points exist, visible even when the ordinary
  bar is full. Exact styling is the implementer's choice; no segmented or animated bar is required.
- Bars keep representing ordinary current / normal maximum. The default primary/secondary token bars stay HP and MP.

### Compatibility (legacy excess)

- **Legacy signal**: a resource whose stored source has no pool list at all is pre-v0.9 data. A resource with a pool
  list, even empty, is never reinterpreted. HP and MP are detected and converted independently, so Res1 and Res2 can
  each ship their own conversion.
- **Conversion** (pure, in the resource-points module): compute the normal maximum from the source characteristics
  (base + modifier) and the attribute modifier using the same formula as preparation, ignoring the stored maximum;
  floor it at zero. If stored current exceeds it, ordinary current becomes the maximum and the excess becomes one pool
  with a fixed, deterministic identity and a localized "Recovered excess" label. Otherwise the pool list becomes empty.
  The deterministic identity makes in-memory and persisted conversions agree and makes repeated conversion idempotent.
  No zero-amount recovery pool is created; no expiry, attribution or maximum transition is invented.
- **Integration**, following the 0.6.0 field-rename prior art (data model converts on load; a versioned migration
  persists): the actor data model's load-time migration converts complete actor sources, which covers world actors,
  compendium documents, compendium copies and `noHook` JSON imports after the world version advanced. A new versioned
  migration step (Res1: HP; Res2: a separate, later step for MP) persists the converted ordinary current and pool list
  for world actors and world compendium actors, so that a later partial write can never split ordinary current from its
  recovered pool or leave a source without a pool list.
- **Unlinked tokens**: the migration's Token handler converts the actor delta's own stored current, computing the
  maximum from the delta's characteristics merged over the base actor's. When the delta overrides a resource's current
  value, it receives its own explicit pool list (the recovery pool, or empty), so it neither inherits the base actor's
  recovery pool nor writes anything to the base actor or to other tokens. Deltas that don't override the value keep
  inheriting the base actor's state. The load-time conversion skips partial delta sources.
- Existing migration behavior applies unchanged: active-GM persistence, player in-memory application, retry on
  failure, explicit GM skip, world-compendium lock restoration, system packs rebuilt from source, module packs
  untouched, no edits to released migrations. No ActiveEffect traversal is added.
- System pack actors (if any carry resource values) are fixed in their YAML sources, not migrated.

### Delivery

- **Res1** (no prerequisites): schema, resource-points module, HP routes, sheet indicator and pool editor for HP, token
  HUD/bar for HP, HP legacy conversion and its migration step, documentation.
- **Res2** (blocked by Res1): the same for MP plus spell affordability/payment, MP legacy conversion in its own
  migration step, documentation. The pool editor and token presentation are extended, not duplicated.
- One PR per chunk into master. Downstream: Fx4 (maximum/current transitions) and Clk2 (Vigour) in other tracks
  are blocked by Res1/Res2; Ench2 by Res2.

## Testing Decisions

A good test exercises observable outcomes through a public seam — resulting ordinary current, pool amounts and order,
written updates, posted results — not internal helpers or markup. Tests run in plain Node with stubbed globals, per
the repository convention. Three seams, agreed with the user:

1. **Resource-points module** (new test file): every acceptance example below as a state-in/state-out case; FIFO
   across several pools including exhausted ones; damage beyond all points floors at zero; restore caps at maximum and
   never changes pools; grant appends, correct keeps position, remove drops only its pool; available total; legacy
   conversion for excess, no excess, zero maximum, stale stored maximum, negative modifiers, and idempotence (convert
   twice → identical result, same pool identity). Prior art: the pure-function tests in the magic and roll test files.
2. **Migration handlers** (existing migrations test file): the new HP and MP steps on actor sources, token sources with
   and without overriding deltas (including the inherited-recovery-pool trap), already-converted sources returning no
   changes, and runner-level coverage for locked world compendia and retry following the existing runner tests.
   Include the decision's no-intentional-conversion assertion: an actor with arbitrary legacy ActiveEffects gets no
   effect changes.
3. **Spell casting harness** (existing spell-casting test file): extend the stub actor with temporary MP pools and
   cover affordability funded only by temporary MP, maximum affordable magnitude counting temporary MP, FIFO payment,
   cancel writing nothing, MP changed (ordinary or pools) while the dialog is open, and shift-click capping.

Chat buttons, sheet controls, pool editor and token HUD/bar are thin callers of the actor methods; they are verified
by manual scenarios, not markup tests.

### Acceptance examples

`ordinary / maximum + pools` (A precedes B). Verify manually with reloads between steps, on a character and an NPC,
and on linked and unlinked tokens where relevant.

| Start | Action | Expected |
| --- | --- | --- |
| HP 6/10, A=4 then B=3 | Chat damage 5 (ignore armour) | HP 6/10, A=0, B=2; chat says 5 damage, 5 absorbed |
| HP 6/10 + A=4 | Damage 7 | HP 3/10, A=0 |
| HP 6/10, A=1, B=2 | Heal 4 | HP 10/10, A=1, B=2 |
| HP 6/10, A=4, B=3 | Remove A | HP 6/10, B=3 |
| HP 6/10, A=1 | Correct A to 3, then grant C=4 | Order A(3), C(4); total +7 |
| HP 10/10 + A=2, AP 2 | Normal damage 3 | HP 10/10, A=1 |
| HP 10/10 + A=2 | Token HUD "-3", then "+5", then "4" | 9/10 A=0; 10/10 A=0; 4/10 A=0 |
| HP 10/10 + A=2 | Sheet right-click HP label | HP 10/10, A=1 |
| MP 8/10, A=2 then B=4 | Cast costing 5 | MP 8/10, A=0, B=1; reload keeps B=1 and order |
| MP 0/10 + A=3 | Cast costing 3 | Allowed; MP 0/10, A=0 |
| MP 10/10 + A=25 | Spend 30 | MP 5/10, A=0 (no cap on generic pools) |
| MP 8/10 + A=4 | Open cast dialog, cancel | Nothing changes |
| MP 8/10 + A=4 | Chat gain MP 5 | MP 10/10, A=4 |
| MP 8/10 | Manual Tap gain 6: set MP 10, grant "Tap" 4; spend 3; GM lowers Tap by 1 | 10/10 Tap=4; 10/10 Tap=1; 10/10 Tap=0 |
| v0.8 actor: HP max computes 10, stored current 15, stored max 0 | Upgrade | HP 10/10 + Recovered excess 5, once |
| v0.8 actor: MP max 10, stored 14 | Upgrade | MP 10/10 + Recovered excess 4; no decay |
| v0.8 actor: HP max 10, stored 6 | Upgrade | HP 6/10, empty pool list |
| v0.8 actor: max 0, stored 3 | Upgrade | 0/0 + Recovered excess 3 |
| Converted HP 10/10 + recovered 5 | Damage 3, then heal | Recovered 2 remains; healing doesn't refill it |
| Two unlinked tokens with MP 12 and 15 in their deltas, base actor MP 9, max 10 | Upgrade | Tokens: 10/10 + 2 and 10/10 + 5; base 9/10 empty; no cross-writes |
| Unlinked token delta HP 6, base actor stored 15 (max 10) | Upgrade | Base 10/10 + 5; token 6/10 with its own empty pool list |
| Locked world compendium actor with HP 15/10 | Upgrade | Converted, lock restored, IDs kept |
| Old actor JSON with HP 15/10 | Import after upgrade | HP 10/10 + Recovered excess 5; reloading doesn't add another |
| Converted actor (empty pool list), HP 6 | Lower HP modifier so maximum is 4, reload | Ordinary shown 4/4; no recovery pool is created |
| Repeat migration / retry after partial failure | Reload, retry | Same totals, one recovery pool per resource |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk.

## Out of Scope

- Applied effects, Vigour's grant/suspension/ending and the effect-to-pool link (Clk2, application track).
- Maximum/current transitions from effects and the POW exception (Fx4).
- Pool expiry, suspension and clocks (Clk1/Clk2).
- Magic point stores, store-paid casting, recoverable/unpaid payment (Ench track). Today's underfunded-cast behavior
  is unchanged apart from counting temporary MP.
- Manual choice or reordering of the pool spending order; FIFO is fixed for v0.9.
- Automatic Tap characteristic drain and per-minute decay; Tap stays manual bookkeeping. Its full rules workflow is
  written in the content track's manual-coverage documentation batch.
- Negative HP, death/unconsciousness automation; the zero floor stays.
- Adjusting stored ordinary current when a person lowers the HP/MP modifier in the attributes dialog (existing
  preparation clamp behavior is kept).
- Migrating, classifying or repairing pre-v0.9 user/macro/module ActiveEffects.
- Segmented or animated token bars; spell/ability coverage inventory changes (no spell becomes automated here).

## Further Notes

- Glossary terms used: **temporary points**, **temporary-point pool**, **normal maximum**, **magic point store**
  (deliberately not a temporary MP pool). The "Recovered excess" pool is an ordinary manual pool, not an applied
  effect.
- Documentation updates in the same PRs: the Actors page (temporary points, pool editor, token display), the Chat page
  (damage absorption, healing and MP buttons) and, in Res2, the Magic page (spell payment with temporary MP, a short
  pointer for manual Tap bookkeeping). Edit the HTML sources and regenerate the journal sources.
- The legacy signal relies on new actors persisting their pool list at creation and on the versioned migration
  persisting it for existing actors; the implementer must confirm that creation and JSON import write the full
  converted source, and that the migration handler sees the load-time converted data (as with the 0.6.0 renames).
- Implementations may split a chunk further if review needs it (e.g. legacy conversion separate from the live
  routes), but must not merge chunks across tracks, and a split must not ship a route that can discard recorded
  excess before its conversion lands.
