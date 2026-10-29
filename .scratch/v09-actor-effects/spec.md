# v0.9 actor effects: numeric effects, test choices and item effects

Status: ready-for-agent

Track **Fx/Itm** of the v0.9 effects release: chunks **Fx1** (actor effects with Protection), **Fx2** (movement),
**Fx3** (characteristics), **Fx4** (maximum/current transitions), **Fx5** (skill test modifiers), **Fx6a** (conditional
choices), **Fx6b** (quick-roll paths), **Itm1** (item-local effects) and **Itm2** (owner passives). Source plan:
[effects release map](../effects-release/map.md) and its
[release chunks decision](../effects-release/issues/08-release-chunks.md). Policies come from the resolved decisions
[01 supported mechanics](../effects-release/issues/01-supported-mechanics.md),
[02 resource semantics](../effects-release/issues/02-resource-semantics.md) (maximum/current transitions),
[05 item ownership and transfer](../effects-release/issues/05-item-ownership-and-transfer.md),
[06 conditions and reminders](../effects-release/issues/06-conditions-and-reminders.md) (conditional choices, quick
rolls, reminders) and [09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md)
(legacy effects left alone). Every chunk must meet the
[definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

## Problem Statement

A Referee running OpenQuest in Foundry cannot represent an ongoing benefit or restriction on a creature. Protection's
extra AP, Mobility's extra movement, Enhance STR, Enhance Skill, Demoralise's halved combat skills, an enchanted ring's
armour bonus or a creature's permanent ability all have to be applied by editing native modifiers (the AP modifier,
the characteristic modifier, the skill modifier) and remembered and undone by hand. That loses track of where a number
came from, and undoing the wrong amount is easy. It also gets the rules wrong. A raised skill modifier can make a
character a Master, and a skill modifier competes with situational modifiers in ways the SRD does not intend. A
characteristic change made by hand also does not recalculate the right things in the right order.

Situational bonuses are worse: Strength's +10% applies only to STR-based Athletics, Ironmind only against mental magic,
Hinder only to the next relevant test. There is nowhere to put them so that they are offered when relevant without
being applied to every roll. Shift-click quick rolls skip any chance to choose. Reminders about restrictions
("Demoralised: may not cast offensive spells") live only in people's heads.

Foundry's own Active Effects can store changes, but the system has never supported them. The actor applies them after
its items are prepared, so a characteristic change would leave skills, damage modifier and weapons stale. The core
editor allows arbitrary field edits that bypass the OpenQuest rules. Item effects are not prepared at all, and owner
passives ignore whether an item is readied or stored.

## Solution

Actors gain an **Effects** list (character and NPC sheets) where an owner can create, edit, enable, disable and delete
effects. An effect has a name, an icon, a source name and rules text (its **reminder**), plus zero or more numeric
changes chosen from a curated OpenQuest vocabulary rather than arbitrary data paths. A system effect editor offers
only supported targets and operations, each with its rule-specific limits. An effect with no changes is a pure reminder.

A single, deliberately ordered calculation applies active effects during actor preparation. Characteristic changes
reach skills, the Damage Modifier and HP maximum before items are prepared, and AP and combat order use the prepared
items. Source values are never rewritten, so disabling or deleting an effect restores the calculated values on the
next preparation. Values changed by effects show their contributing sources.

Skill effects are **test modifiers**: they change the Modified skill, never the learned skill or Master eligibility.
Unconditional modifiers apply automatically, and the strongest applicable magic modifier wins under the SRD's
one-modifier rule. **Conditional effects** appear unchecked in the test dialog only when they match the test. The person
rolling ticks those that apply, and nothing is consumed. A shift-click quick roll opens the dialog when such a choice
exists. Reminders appear in a separate dialog section and on the result card.

When an effect changes an HP or MP normal maximum, ordinary current points move by the same signed amount once, at the
moment the effect is created, edited, enabled, disabled or deleted. Temporary points are untouched.

Items can carry effects too. A weapon's **item-local effect** improves only that weapon. A readied piece of equipment,
worn armour or a creature ability can supply an **owner passive** to its actor, gated per definition by the item's
state and its own on/off switch.

Each chunk adds one visible slice of this, in the order of the dependency graph below.

## User Stories

### Actor effects and AP (Fx1)

1. As a Referee, I want an Effects list on character and NPC sheets, so that I can see every ongoing benefit and
   restriction on a creature in one place.
2. As a Referee, I want to create a new effect on an actor from its sheet, so that I can record a spell, blessing or
   ruling without editing native modifiers.
3. As a Referee, I want to give an effect a name, icon, source name and rules text, so that anyone reading the sheet
   knows what it is, where it came from and what rules it brings.
4. As a Referee, I want to add an AP change to an effect (e.g. Protection 3: +3 AP), so that the creature's armour
   points include the magic.
5. As a Referee, I want effect AP to add on top of worn or natural armour and the native AP modifier, so that
   Protection 3 over 2 AP armour gives 5 AP.
6. As a Referee, I want to disable an effect without deleting it, so that I can suspend a benefit and restore it later.
7. As a Referee, I want disabling, re-enabling, deleting and reloading to restore exactly the calculated values, with
   no repeated or leftover bonus, so that I can trust the sheet.
8. As a Referee, I want the effect editor to offer only targets and operations the system supports, so that I cannot
   accidentally write a bonus into a field that would be overwritten or misused.
9. As a Referee, I want to create an effect with no numeric changes, only rules text, so that I can keep a reminder
   such as "Owes the river spirit a favour" on the sheet.
10. As a player, I want to read an effect's rules text from the sheet, so that I can follow its restrictions without
    looking up the spell.
11. As a player, I want a value changed by effects to show which effects contributed and how much, so that I
    understand where my AP comes from.
12. As a player, I want disabled effects to stay visible with a "disabled" state, so that I can tell what is suspended.
13. As a player who owns an actor, I want to manage its effects with the same permission I have to edit the actor, so
    that routine bookkeeping doesn't need the Referee.
14. As a Referee, I want effects created on an unlinked token's sheet to change only that token's actor, so that two
    goblins from one base actor stay independent.
15. As a Referee, I want effects on a linked token to belong to the shared world actor, so that sheet and token agree.
16. As a Referee, I want duplicating, exporting and importing an actor to carry its effects and their enabled state,
    so that prepared creatures keep their magic.
17. As a Referee upgrading a world, I want effects created by macros or modules before v0.9 left as stored and still
    listed, so that nothing is deleted behind my back, even though their behaviour is not guaranteed.

### Movement (Fx2)

18. As a Referee, I want to add a movement rate change to an effect (Mobility: +2m per magnitude), so that the sheet
    shows the creature's real movement.
19. As a Referee, I want a movement reduction with a minimum (Slow: −2m per magnitude, never below 1m), so that the
    spell's floor is respected without me checking it.
20. As a Referee, I want Mobility and Slow on the same creature to combine visibly, so that I can adjudicate whether
    both apply.
21. As a Referee, I want fractional movement from a multiplier kept as calculated, so that the system doesn't invent a
    rounding rule the SRD doesn't state.

### Characteristics (Fx3)

22. As a Referee, I want to add a characteristic change to an effect (Enhance STR +2), so that the creature's STR is
    raised while the effect lasts.
23. As a Referee, I want a characteristic change to flow into skills whose formulas reference it, so that Close Combat
    rises with STR.
24. As a Referee, I want a characteristic change to recalculate the Damage Modifier, so that crossing a threshold
    changes weapon damage.
25. As a Referee, I want CON and SIZ changes to recalculate the HP normal maximum, so that the creature's capacity
    matches its characteristics.
26. As a Referee, I want a characteristic reduction with a floor (Diminish: never below 1), so that the spell's limit
    is respected.
27. As a Referee, I want a halved characteristic to round down (INT 13 halved is 6), so that results follow the
    agreed rounding.
28. As a player, I want a skill raised to 100% or more by a temporary characteristic increase not to make me a Master,
    so that magic does not grant mastery the rules reserve for training.
29. As a player, I want the sheet to show my effective characteristic and skill values and reveal the learned values,
    so that I can tell magic from training.
30. As a Referee, I want POW changes from effects never to change MP maximum or current MP, so that Enhance and
    Diminish POW follow their SRD exception.
31. As a Referee, I want the characteristic dialog and native modifiers to keep working as today, so that permanent
    changes stay distinct from ongoing effects.

### Maximum/current transitions (Fx4)

32. As a Referee, I want an effect that raises the HP normal maximum by 4 to raise current HP by 4 when it is applied,
    so that the creature gains usable points (HP 6/10 becomes 10/14).
33. As a Referee, I want removing that effect to lower current HP by the same amount, so that HP 10/14 returns to 6/10
    when nothing else happened.
34. As a Referee, I want the adjustment to use the actual change in normal maximum, so that a CON increase that moves
    the maximum by 2 adds 2, not the characteristic delta.
35. As a Referee, I want negative maximum effects to lower current points the same way, floored at zero, so that the
    rules stay consistent in both directions.
36. As a Referee, I want each floor applied at its own transition without hidden debt (HP 6/10, −8 maximum → 0/2,
    removal → 8/10), so that the system never invents negative HP.
37. As a Referee, I want editing an effect's amount, disabling it and re-enabling it to adjust current points by the
    resulting change only, so that toggling is not a heal or damage exploit.
38. As a Referee, I want reloading, re-rendering and data preparation never to repeat an adjustment, so that points
    are not gained or lost by opening the world.
39. As a Referee, I want temporary HP and MP pools untouched by maximum transitions, so that magical buffers stay
    separate from capacity.
40. As a Referee, I want direct MP-maximum effects to adjust current MP, while Enhance/Diminish POW leave MP alone, so
    that both rules hold.
41. As a Referee, I want changing native modifiers in the attributes or characteristics dialogs to keep today's
    behaviour, so that only effect lifecycle events move current points.
42. As a Referee, I want two changes that leave the effective maximum unchanged to move no current points, so that
    unrelated edits don't heal or wound.

### Skill test modifiers (Fx5)

43. As a Referee, I want an effect to modify tests of one chosen skill (Enhance Skill: +10% per magnitude), so that
    the bonus applies only where the spell says.
44. As a Referee, I want an effect to modify tests of a skill group (combat skills) or of all skills, so that
    Fanaticism and similar effects need one change, not one per skill.
45. As a Referee, I want a multiplier on skill tests (Demoralise halves combat skills: 65 becomes 32), so that
    halving effects are calculated with the agreed rounding.
46. As a player, I want a test modifier never to change my learned skill or make me a Master, so that skill 95 with
    +10 still rolls.
47. As a player, I want only the strongest applicable magic modifier to count, independently of difficulty (skill 60,
    difficulty +20, magic +20 and −30 gives 50), so that the SRD's one-modifier rule holds.
48. As a Referee, I want equal and opposite magic modifiers flagged rather than silently cancelled, so that I decide
    which applies.
49. As a player, I want weapon and casting tests to include the modifiers of their underlying skill, so that Enhance
    on Close Combat improves my sword attacks.
50. As a player, I want the test dialog and result card to show the magic modifier and its source, so that everyone
    sees why the target number changed.
51. As a Referee, I want an effect to modify combat order (Coordination: +10% per magnitude), so that declarations use
    the right order without raising DEX.
52. As a Referee, I want test modifiers not to change combat order, so that situational bonuses don't reorder the round.
53. As a Referee, I want an effect bound to a skill that was later deleted to show a missing target and contribute
    nothing, so that it never silently attaches to a same-named skill.
54. As a Referee, I want to rebind a missing skill target explicitly in the editor, so that I can repair it.

### Conditional choices (Fx6a)

55. As a Referee, I want to mark a skill change as conditional with a human-readable condition ("STR-based Athletics
    only"), so that it is offered rather than applied automatically.
56. As a player, I want the test dialog to list only conditional effects that match the current test, unchecked, with
    source, condition and contribution, so that I choose what applies.
57. As a player, I want a ticked conditional effect to count only for that roll, so that the next test starts clean.
58. As a player, I want ticking or rolling never to consume or end the effect, so that clearing a next-test bonus stays
    an explicit choice.
59. As a Referee, I want an effect to target skills whose own formula directly references a characteristic (Befuddle:
    INT-based skills), so that characteristic-based spells work without listing skills.
60. As a Referee, I want that matching to read only the skill's own formula, not its name or other skills, so that a
    fixed 70% skill is never treated as INT-based.
61. As a player, I want Athletics (`@dex+@str`) to offer both Strength's and Coordination's conditional entries, so
    that I pick the one matching how I'm using the skill.
62. As a player, I want a separate reminders section in the test dialog listing rules of effects that bear on the
    test, so that restrictions are visible when I decide.
63. As a player, I want the result card to record which conditional entries I selected and their contribution, so
    that the table can check the roll.
64. As a Referee, I want an effect to add damage to the creature's own weapon damage (Strength: +1 per magnitude,
    nonmagical), so that the damage formula shows the bonus without raising STR.
65. As a player, I want cancelling the dialog to change nothing, so that opening it is free.

### Quick-roll paths (Fx6b)

66. As a player, I want a shift-click quick roll on a skill, weapon, rolled ability or MP-cast spell to open its
    normal dialog when a conditional choice matches, so that I never miss a relevant choice.
67. As a player, I want quick rolls with no matching conditional choice to stay quick, so that ordinary play isn't
    slowed down.
68. As a player, I want quick results to carry reminder context on the chat card, so that restrictions like
    Demoralise's are visible even without a dialog.
69. As a macro user, I want hotbar and macro rolls to follow the same rule, so that every entry point behaves alike.
70. As a player, I want rolled ability and casting dialogs to offer matching conditional choices too, so that Ironmind
    or Hinder work on every relevant test.
71. As a player, I want non-rolled Divine casting to stay unchanged, so that no skill test or checkbox is invented.

### Item-local effects (Itm1)

72. As a Referee, I want to add an effect to a weapon that improves only that weapon's hit chance or damage, so that an
    intrinsically enchanted sword is +2 to hit without affecting other weapons.
73. As a Referee, I want that enhancement to survive renaming, state changes, reload and copying the weapon, so that
    the item stays enchanted wherever it goes.
74. As a player, I want a second weapon sharing the same skill, and the skill itself, to stay unaffected, so that the
    bonus is truly local.
75. As a player, I want the weapon's test dialog and card to show the item-local modifier as a magic modifier, so that
    the strongest-modifier rule includes it.
76. As a Referee, I want added item-local damage shown in the weapon's damage formula, so that the bonus is visible
    before rolling.

### Owner passives (Itm2)

77. As a Referee, I want an item effect to apply to its owner while the item is active, so that a readied ring of
    protection grants +2 AP.
78. As a Referee, I want to choose which item states make each passive eligible, defaulting to readied for weapons and
    equipment, worn for armour and natural for natural items, so that the passive follows how the item is used.
79. As a Referee, I want a passive to stop when its item is carried or stored and to return once when readied again,
    so that AP is 2, then 0, then 2 (never 4).
80. As a Referee, I want each passive to have its own on/off switch, defaulting to on, so that I can suspend one
    benefit without unequipping the item.
81. As a Referee, I want creature abilities to supply passives gated only by their switch, so that a troll's
    regeneration reminder or a creature's thick hide is always on unless switched off.
82. As a player, I want the actor's Effects list to show passives from items separately from effects on the actor,
    with the source item and why one is inactive, so that I know where each benefit comes from.
83. As a Referee, I want deleting an item to remove its passives, and copying an item to another actor to bring its
    passives there without leaving a duplicate behind, so that benefits follow their source.
84. As a Referee, I want existing worn-armour AP to stay distinct from an armour passive, so that the passive adds on
    top of the armour's own AP.
85. As a Referee, I want toggling, equipping and reloading never to create temporary points, so that passives can't be
    farmed for HP.
86. As a Referee, I want passives on an unlinked token's items to affect only that token's actor, so that tokens stay
    independent.

### Cross-cutting

87. As a developer of a later chunk (Apply effect, Weapon Enhance binding, clocks, conditions), I want one curated
    change vocabulary and one calculation module, so that applied effects reuse the same rules.
88. As a Referee, I want the system documentation to explain effects, the editor, conditional choices, item effects
    and how to build common spells by hand, so that the table can use the feature before ready-made templates exist.

## Implementation Decisions

### Effect records

- Effects are core Foundry Active Effects, owned either by an actor or by an item. The system registers its own effect
  document class and an effect data model that extends the core change schema. It keeps the `type`, `phase` and
  `priority` definitions core requires, and adds OpenQuest fields as each chunk needs them. No field is added ahead of
  its behaviour.
- The core effect description holds the **rules text** (the reminder). Name, icon and enabled/disabled are the core
  fields. A **source name** is stored as readable text so it survives deletion of whatever it refers to. Actor effects
  created by hand have a typed source name; later chunks fill it from cards and items.
- An effect has zero or more **changes**. Each OpenQuest change names a **target** from the curated vocabulary below,
  an **operation** (`add`, `multiply` or `override`, where the target allows it), a value, an optional **minimum**
  (the rule-specific floor) and, for skill-test targets, a **selector** and an optional **conditional** flag with
  **condition text**. Exact field names are the implementer's choice.
- Core key-path application skips OpenQuest changes; the system's calculation is their only interpreter. Changes not
  in the vocabulary (pre-v0.9 user, macro or module effects) keep core behaviour, are not converted, classified or
  repaired, and are preserved untouched when such an effect is opened and saved in the system editor. The editor shows
  them as other stored changes not managed by OpenQuest.
- Core `statuses` and duration are not edited by these chunks. Condition markers belong to Cnd1 and clocks to Clk1;
  the editor hides those controls until their chunks add them.

### Curated change vocabulary

Each target is introduced by the chunk that first needs it. The editor offers only targets that exist.

| Target | Operations, limits | Chunk |
| --- | --- | --- |
| Armour points | add, multiply, override | Fx1 |
| Movement rate | add, multiply, override; optional minimum (Slow: 1m); no rounding | Fx2 |
| Characteristic (STR, CON, DEX, SIZ, INT, POW, CHA) | add, multiply, override; optional minimum (Diminish: 1); round down | Fx3 |
| HP normal maximum, MP normal maximum | add (signed) | Fx4 |
| Skill test modifier, selector: named skill, skill group, all skills | add (flat magic modifier) or multiply (round down) | Fx5 |
| Combat order | add | Fx5 |
| Skill test modifier, selector: characteristic-based skills | as above | Fx6a |
| Conditional flag + condition text on skill test changes | — | Fx6a |
| Weapon damage addition (actor-wide) | add a formula term | Fx6a |
| Weapon hit modifier, weapon damage addition (this weapon only) | add | Itm1 |

Per-target combination is deterministic and visible: multipliers apply to the unmodified value, then additions, then
an override replaces the result, then the minimum applies. When one target has both multiplicative and additive
contributions, or more than one override, the value's source breakdown lists them all so a human can adjudicate.
This is not a general conflict engine.

### Pure effect-contributions module (the main seam)

A new pure module, free of Foundry calls at import time, owns all effect arithmetic over plain data. Its inputs are the
active changes with their effect identity, name, source name and rules text, plus the actor facts it needs:
unmodified characteristics, skills (identity, group, own base formula, advancement), weapons and item states. It
provides:

- **Attribute contributions**: the effective value and source breakdown for AP, movement, each characteristic, HP/MP
  normal maximum and combat order, following the combination order and minimums above.
- **Characteristic reference matching**: the set of characteristics a formula references directly (`@int+@pow` →
  INT, POW; `70` and `@skills.x.value` → none; braced references count). No recursion, no name inference, no
  algebra.
- **Skill test contributions** for one test: unconditional modifiers (reduced to the single strongest magic modifier,
  with ties between equal and opposite modifiers reported, not silently resolved), multipliers, the list of matching
  conditional choices, and the reminders relevant to the test.
- **Weapon contributions**: hit modifiers and damage terms scoped to one weapon (item-local in Itm1, and the channel
  App6's bound Weapon Enhance reuses later) plus actor-wide damage additions.
- **Passive eligibility**: whether an item-borne definition is active, given item type, item state, the definition's
  eligible states and its switch.
- **Missing targets**: a named-skill selector whose skill identity is absent yields a missing-target state and no
  contribution.

Rounding follows decision 01: characteristics and skills round down after multiplication; HP maximum keeps its
existing round-up calculation; movement and damage formulas are not rounded.

### Actor preparation order

The existing three-level order stays and effects are applied inside it, once per preparation, never written back:

1. **Base data**: native characteristic values (base + mod) are kept as the unmodified values. Effect
   characteristic contributions then give the effective values that everything else reads. HP normal maximum uses
   effective CON and SIZ plus direct HP-maximum contributions. MP normal maximum uses unmodified POW plus direct
   MP-maximum contributions, so POW effects never change MP (the exclusion lives in preparation, Fx3). Damage
   Modifier uses effective STR and SIZ. Movement includes its contributions.
2. **Embedded documents**: skills compute their **effective value** from effective characteristics and their
   **learned value** from unmodified characteristics. Master eligibility reads the learned value (Master requires
   learned and Modified skill both at 100% or more, under the existing mastery Rule Option). Each skill exposes its
   effect test contributions for weapons and spells that reference it. Weapons add item-local and actor-wide damage
   terms after the Damage Modifier.
3. **Derived data**: AP adds effect AP to native AP and the best worn/natural armour. Combat order adds its
   contributions to the declared item's value. Skill test modifiers never reach combat order.

Item effects with role "this item" are prepared by their item (Itm1). Owner passives are collected from the actor's
items before step 1, using their stored state (Itm2). The core `applyActiveEffects('initial')` call remains, for
non-OpenQuest changes only. `getDataForItems` keeps exposing effective characteristics.

### Test resolution

- The Modified skill is: effective skill value, after any skill multiplier, plus difficulty, plus the single strongest
  magic modifier from the unconditional test modifiers and the selected conditional choices, plus the dialog's
  existing "other modifier" field. That field keeps today's prefill from native skill/weapon modifiers and stays
  editable, so the Referee can correct double counting. Skill 60, difficulty +20 and competing +20/−30 gives 50.
- When the strongest positive and negative magic modifiers are equal, the dialog and card show the tie with both
  sources and apply neither. The person resolves it by disabling an effect or entering a manual modifier.
- Weapon tests include the referenced skill's contributions plus the weapon's item-local hit modifiers in the same
  strongest-modifier selection. Spell casting includes its casting skill's contributions.
- Dialogs list conditional choices only when they match the test, unchecked every time. Selection is not stored on
  the effect. A separate reminders section lists the rules text of active effects that contribute unconditionally to
  this test and of active reminder-only effects. Result cards show the magic modifier with its source (Fx5), the
  selected conditional entries (Fx6a) and reminders (Fx6b, for quick and normal rolls).
- Matching: a named selector matches by skill identity, a group selector by skill group, a characteristic selector by
  direct formula reference. Weapon and casting tests match through their referenced skill. Rolled special-ability
  tests match only the all-skills selector and characteristic selectors, against the ability's own formula.
- **Quick rolls (Fx6b)**: every skip-dialog entry point (sheet shift-click, macro and hotbar calls, quick casting of
  MP spells) asks one pure predicate: does any conditional choice match this test? If so, it opens that path's normal
  dialog. If not, it stays quick, and the card carries the reminders. Non-rolled Divine casting is unchanged.
- Follow-up damage snapshots of selected contributions are App5's (application track); these chunks only show the
  contributions on the test card.

### Maximum/current transitions (Fx4)

- An effect lifecycle event triggers a transition: create, change edit, enable, disable or delete of an actor effect,
  and, once Itm2 exists, a passive switch, an item state change or creation/deletion of an item carrying passives.
  The initiating client compares each resource's effective normal maximum before and after the event. When it
  changed, that client makes one follow-up actor update: ordinary current becomes `clamp(current + delta, 0, new
  maximum)`. Temporary-point pools are untouched.
- Data preparation, reload, re-render and other clients never adjust. Edits to native modifiers, characteristics or
  advancement do not trigger transitions; their existing preparation clamp behaviour is kept.
- The arithmetic is a new operation in the Res track's resource-points module ("adjust for maximum change"), reached
  through the Res actor-level interface. Clk1 (application track) reuses the same transition for expiry and its
  catch-up.
- Before Fx4 lands, Fx3's CON/SIZ effects change the HP maximum without moving current points; this interim
  behaviour is documented in Fx3's notes.
- Whichever of Fx4 and Itm2 lands second wires item-driven transitions.

### Item effects (Itm1, Itm2)

- Each item-borne definition has an explicit **role**: "this item" (Itm1, transfer off) or "owner while active"
  (Itm2, transfer on). The third role, "apply to recipient" (dormant effect templates), is added by App1 in the
  application track. Item sheets gain an Effects section listing definitions with their role. Weapons get it in Itm1;
  armour, equipment and special abilities in Itm2. Spells get it in App1.
- "This item" definitions offer only the weapon hit and weapon damage targets and affect only their own item. They
  travel with copies natively.
- "Owner while active" definitions offer the actor vocabulary. Each has a set of **eligible states** (defaults:
  readied for weapons and equipment, worn for armour, natural for natural weapons and armour; carried or stored can
  be ticked where a rule requires) and an on/off switch defaulting to on. Special abilities have no state; only the
  switch gates them. Ineligibility is reported through the effect's suppression (core `isSuppressed`), so core's
  expiry and disabling checks still apply.
- The actor Effects list shows owner passives in their own group with source item, state and inactive reason
  (disabled, item not in an eligible state). Toggling there updates the definition on the item. No actor-owned mirror
  copy is ever created.
- A named-skill selector on a passive binds by skill identity within the owning actor. After a copy to another actor it
  shows a missing target until someone rebinds it in the editor. Group, all and characteristic selectors work anywhere.

### Sheets and editor

- Character sheets gain an Effects tab and NPC sheets an Effects section, using the shared actor sheet part. Each row
  shows icon, name, source name, state (enabled, disabled, missing target; Itm2 adds ineligible), an enable toggle,
  edit, delete and expandable rules text. A create control adds an actor effect and opens the editor.
- The system effect editor is an ApplicationV2 sheet registered for Active Effects (a subclass of the core effect
  config). It replaces the free key/type/value change rows with the curated target, operation, value, minimum,
  selector and conditional editor. It keeps name, icon, enabled, rules text and source name, and keeps the light
  parchment theme.
- Values changed by effects (AP, movement, characteristics, HP/MP maximum, skills, combat order, weapon damage) show
  a marker and a tooltip listing contributing effects and amounts. Skills reveal their learned value in that tooltip.
- New strings go under `OQ.*` in the English localization source. Icons come only from the themed icon set.

### Representative content

These chunks ship no compendium templates. Applying spells from cards (App1) and the spell/ability content batches
come later. Each chunk's manual check builds its representative effect by hand: Protection, Mobility/Slow, Enhance
STR, a direct +4 HP maximum, Enhance Skill, Strength/Coordination/Ironmind, an intrinsic +2 sword, a ring of
protection and a creature ability. The documentation gives these as worked recipes. The spell coverage inventory is
unchanged.

### Delivery and dependencies

| Chunk | Blocked by | Delivers |
| --- | --- | --- |
| Fx1 | — | Effect records, data model and document class, editor, actor Effects list, calculation module with AP, preparation order, contributions tooltip, reminder-only effects, documentation |
| Fx2 | Fx1 | Movement target and minimum |
| Fx3 | Fx1 | Characteristic target, effective/learned values, Master eligibility, DM/HP maximum recalculation, POW exclusion from MP maximum |
| Fx4 | [Res1, Res2](../v09-resources/spec.md), Fx3 | HP/MP maximum targets, lifecycle transitions, resource-points operation |
| Fx5 | Fx1 | Skill test modifiers (named, group, all; add, multiply), strongest-modifier selection, tie reporting, combat order, missing skill target, dialog/card modifier display |
| Fx6a | Fx5 | Characteristic-based selector, conditional choices, reminders section, actor-wide damage addition, selected entries on cards |
| Fx6b | Fx6a | Quick-roll predicate on every skip-dialog path, choices in ability and casting dialogs, reminders on cards |
| Itm1 | Fx1 | Role field, weapon Effects section, item-local hit/damage preparation |
| Itm2 | Fx1 | Owner passives, eligible states, switch, suppression, item Effects sections for armour/equipment/abilities, passive group on actor sheet |

One PR per chunk into master. Downstream: App1 and Cnd1 are blocked by Fx1, App5 by Fx6a, App6 by Itm1, Clk1 by Fx4,
Cnd2 by Itm2, and the content batches by their mechanic chunk. Chunks may be split further, but never merged across
tracks.

## Testing Decisions

A good test exercises observable outcomes through a public seam, such as effective values, breakdowns, Modified skill,
listed choices and resulting resource state, rather than internal helpers or markup. Tests run in plain Node with
stubbed globals, per the repository convention. Three seams, agreed with the user:

1. **Effect-contributions module** (new test file): every numeric acceptance example below as data-in/data-out. Cover
   each target's operations, minimums and rounding (65 halved → 32, INT 13 halved → 6, Slow floor 1, Diminish floor
   1); multiply/add/override ordering and multi-source breakdowns; POW contributions excluded from MP maximum; learned
   vs effective skill and Master eligibility; direct-reference matching (`@int+@pow`, braced references, `70`,
   `@skills.x.value`, a formula whose characteristic term cancels); named/group/all/characteristic selectors;
   strongest magic modifier and equal-opposite ties; conditional choices listed only on matching tests;
   reminder selection; missing named targets; weapon-local vs actor-wide damage; passive eligibility by item type,
   state, eligible states and switch. Prior art: the pure-function tests in the magic, difficulty and roll test files.
2. **Roll resolution** (existing roll test file): Modified skill with difficulty, effect magic modifier, selected
   conditional choices and the other-modifier field; skill 95 + 10 not mastered; 60/+20/(+20, −30) → 50; the
   quick-roll predicate (matching conditional → dialog; unconditional or reminder-only → quick).
3. **Resource-points module** (Res track's test file): the "adjust for maximum change" operation for every
   transition example below, including zero floors, both directions and untouched pools.

Sheets, the editor, dialogs, cards and the wiring of preparation stages and lifecycle hooks are thin callers. They are
verified by the manual scenarios, on a character and an NPC, linked and unlinked tokens, with reloads between steps.

### Acceptance examples

| Chunk | Setup | Action | Expected |
| --- | --- | --- | --- |
| Fx1 | Worn armour 2 AP | Add "Protection 3" (+3 AP); disable; enable; delete; reload after each | 5; 2; 5; 2 AP; no stored field changes |
| Fx1 | Any actor | Add a reminder-only effect, reload | Listed with rules text; no value changes |
| Fx1 | Two unlinked tokens of one actor | Add Protection to one | Only that token's actor gains AP; base actor unchanged |
| Fx2 | MR 15 | Mobility +4m; Slow −6m; both; Slow −16m min 1 | 19; 9; 13 (breakdown lists both); 1 |
| Fx3 | STR 12, SIZ 13, DEX 14, Close Combat `@str+@dex` adv. 20, sword 1D8 + DM | Enhance STR +2; remove | DM none → +1D4; Close Combat 46 → 48; damage 1D8 → 1D8 +1D4; all restored |
| Fx3 | Deception (`@dex+@int`) learned 98 | Enhance DEX +4 (effective 102) | Rolls normally, not mastered; tooltip shows learned 98 |
| Fx3 | INT 13 | Halve INT; Diminish INT −20 min 1 | 6; 1 |
| Fx3 | MP 8/10, POW 10 | Enhance POW +3 | MP 8/10 |
| Fx4 | HP 6/10 + temp 4 | +4 HP maximum effect; remove it | 10/14 + 4; 6/10 + 4 |
| Fx4 | HP 6/10 | −4 maximum; remove | 2/6; 6/10 |
| Fx4 | HP 6/10 | −8 maximum; remove | 0/2; 8/10 |
| Fx4 | HP 2/14 under +4 | Remove it | 0/10 |
| Fx4 | SIZ 10, CON 10, HP 6/10 | Enhance CON +4 | Maximum 12, HP 8/12 |
| Fx4 | HP 10/14 under a +4 maximum effect | Disable; enable; reload; edit to +6 | 6/10; 10/14; unchanged; 12/16 |
| Fx4 | Any | Edit HP modifier in the attributes dialog | No transition (today's behaviour) |
| Fx5 | Skill 95 | Enhance Skill +10 | Rolls against 100; not Master |
| Fx5 | Skill 60, two effects +20 and −30 | Roll at difficulty +20 | Modified skill 50; card shows the −30 source |
| Fx5 | Skill 60, effects +20 and −20 | Roll | Tie shown with both sources; neither applied |
| Fx5 | Close Combat 65, Demoralise ×0.5 combat group | Roll a sword | 32; Dodge unaffected |
| Fx5 | Declared Close Combat 50, Coordination +20 order, +20 Dodge | Declaration; Dodge test | Order 70; Dodge +20; Close Combat test unchanged |
| Fx5 | Enhance bound to skill A | Delete A, import same-named skill | Missing target, no contribution until rebound |
| Fx6a | Skill 60, conditional +20 matching it | Open dialog; tick; roll; open again | 60 unchecked; 80; card lists entry; unchecked again, effect intact |
| Fx6a | Athletics `@dex+@str`, Strength and Coordination conditionals, Ironmind on Persistence | Open Athletics test | Both Athletics entries listed, Ironmind absent |
| Fx6a | Befuddle −20 INT-based, skills Lore `@int`, fixed `70`, Dodge `@dex+10` | Test each | Only Lore gets −20 |
| Fx6a | Strength +2 damage, sword 1D8 + DM | View weapon damage | 1D8 +1D4 +2; STR unchanged |
| Fx6b | Hinder conditional on Stealth | Shift-click Stealth | Dialog opens with Hinder unchecked |
| Fx6b | Only Demoralise active | Shift-click Close Combat | Quick roll; card shows Demoralise reminder |
| Fx6b | Matching conditional on a casting skill | Shift-click an MP spell; macro roll | Cast dialog opens with the choice; same via macro |
| Itm1 | Swords A (+2 hit local) and B, same skill | Roll A, B, skill; rename/store/ready A; copy A to another actor | A +2 only; survives all; copy keeps +2 |
| Itm1 | Sword A local +1D4 damage | View damage | A's formula gains +1D4; B unchanged |
| Itm2 | Ring readied, passive +2 AP | Carried; stored; readied; reload | AP +0; +0; +2 (not 4); +2 |
| Itm2 | Ring passive with carried ticked | Set carried | +2 AP |
| Itm2 | Creature ability passive +2 AP | Switch off; on | AP −2; +2; ability item unchanged |
| Itm2 | Ring copied to actor B, original deleted | Inspect both | B follows its own state; A loses the benefit; no stale actor effect |
| Itm2 | Two unlinked tokens share base actor and item IDs | Equip ring on one | Only that token gains AP |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk.

## Out of Scope

- Effect templates on spells and abilities, Apply effect, recipients, snapshots, application receipts, conflict
  review, Use ability, weapon binding by an applied effect and the damage snapshot (App1–App6).
- Durations, round and world-time expiry, catch-up and Vigour (Clk1, Clk2). The editor hides duration until Clk1.
- Condition palette, status markers, token/tracker icons and source-aware marker controls (Cnd1, Cnd2).
- Temporary-point pools themselves (Res1, Res2); magic point stores and charms (Ench).
- True Weapon's doubling of normal weapon dice and Fireblade's typed fire damage. The weapon vocabulary is extended
  when their content batch needs them; Itm1 supports flat hit and added damage terms only.
- Compendium templates, the bestiary ability pack and coverage inventory changes (content track).
- Automatic consumption or clearing of next-test effects, opposed rolls, resistance, immunity, damage application and
  any general conflict or stacking engine.
- Migrating, classifying or repairing pre-v0.9 effects; legacy status markers.
- Situational truth of conditional choices; matching only decides eligibility.
- Transitive or name-based characteristic inference and stored skill-basis metadata.
- Changing native modifier fields, the characteristics/attributes dialogs or existing skill reference slugs.
- An inventory-transfer engine; core drag-copy semantics are kept.

## Further Notes

- Glossary terms used: **test modifier**, **Modified skill**, **Master**, **conditional effect**, **reminder**,
  **item-local effect**, **passive effect**, **applied effect** (an actor effect created by hand is an applied effect
  without a card), **effect template** (App track), **normal maximum**, **temporary points**. Add "effect change
  target" to the glossary if review finds the vocabulary needs a domain name.
- Placement decided in this spec with the user: group/all-skill selectors, skill multipliers and combat order go in
  Fx5; characteristic selectors and the actor-wide damage addition in Fx6a. The POW-to-MP-maximum exclusion moves
  from Fx4 into Fx3's preparation, because it is a preparation rule; Fx4 verifies that current MP is unchanged.
- Documentation in the same PRs, edited as HTML under `docs/packs/` and regenerated: the Actors page (Effects list,
  editor, contributions tooltips, learned values, passives), the Rolls page (magic modifier, ties, conditional
  choices, reminders, quick rolls), the Items page (item effects, roles, eligible states) and worked recipes for the
  representative effects.
- Implementer checks: confirm in the Foundry v14 sources (`docs/foundry-v14-notes.md` first) how to register an
  effect data model and sheet. Confirm that overriding change application keeps core status and token change
  handling, and that transferred item effects are visible to the actor before base data preparation.
- The before/after maximum comparison for Fx4 relies on the initiating client's preparation. Concurrent edits from two
  clients can race; that matches existing resource controls and is acceptable for v0.9.
