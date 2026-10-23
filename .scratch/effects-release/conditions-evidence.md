# Conditions and reminder evidence

Supporting facts for [Choose OpenQuest conditions and useful manual reminder workflows](issues/06-conditions-and-reminders.md).
Local source inspection only; no live Foundry verification and no approved design choices in this file.

## Local SRD condition evidence

All rule references below are under `docs/OpenQuest3-SRD/`.

| Candidate | Rule evidence and limitations |
| --- | --- |
| Dead | Combat lines 1221–1234: zero HP ordinarily means death, with nonlethal, fortune and prompt healing/stabilization exceptions. Do not infer unavoidable death merely from zero HP. |
| Unconscious | Spot Rules 119–121: fatigue fumble lasts 3D6 minutes; Personal Magic 16–17: zero MP until one MP regained. Ending depends on cause. |
| Asleep | Divine Magic 1231–1232: Mischief sleep for 1D6 rounds; Spot Rules 313–314: poison sleep. No universal sleep clock. |
| Prone | Combat 657–664 and 846–858: close-combat attack/defense while prone −20; close attacker against prone target +20; ranged attacker prone −50, ranged target prone −20. Context matters. |
| Surprised | Combat 410–418: one round, only Parry/Dodge; Perception fumble also prevents defense. Preserve source variant. |
| Fatigued | Spot Rules 109–112: all tests −20; movement ×0.75; DEX/INT each −3. |
| Heavily fatigued | Spot Rules 114–117: “above penalties” increase to −50%. Non-percent consequences are ambiguous; do not invent extra characteristic/movement reductions. |
| Blinded / Deafened | Personal Magic 252–258: Block Sense. Combat 858: blinded ranged attacker −50, not an all-tests penalty. |
| Paralysed | Creatures 643–654: ghoul venom delay, 1D10 hours or actual healing of at least 1 HP; Creatures 2320–2323: spider venom at zero DEX. Different cause/ending rules. |
| Held | Combat 748–754: hold escape is opposed Unarmed Combat, with distinct damage/throw options. |
| Entangled | Creatures 2443–2444: web escape Athletics versus recorded attack, web HP = spider POW ×2. |
| Stuck | Personal Magic 655–663: Glue uses Athletics versus magnitude ×10 to avoid/break free; initial stuck interval one round. “Immobilised” would be an umbrella, not its own uniform SRD rule. |
| Burning | Spot Rules 270–286: damage depends on intensity; Personal Magic 623–627: Fireblade 1D10 per round until extinguished by an action or magic. No universal burning damage. |
| Poisoned / Diseased | Spot Rules 289–318 and 354–407: source-dependent potency, delay, effects and progression. |
| Invisible | Divine Magic 992–1002: hearing/feeling/smell detection at −20 Perception; concentration loss, casting or attacking ends this spell. Not automatic token hiding. |

No occurrence of “stunned” was found in the local SRD. Helpless is a target context in Combat 657/846, without a
uniform acquisition/removal rule in those passages. Keep specific named spells/abilities as source effects rather
than expanding the generic palette to every source name.

## Representative named sources

- Hinder (Skill), Personal Magic 695–709: −10 per magnitude allocated to a named target's next test in the selected
  skill. Matching does not justify automatic consumption or skip allocation choices.
- Truth Seeker, Personal Magic 949–955: +10 per magnitude to the next test discovering lies/secrets/hidden objects;
  excludes other spell-effect bonuses. Purpose and exclusion adjudication remain human.
- Demoralise, Personal Magic 475–484: halve combat skills, forbid offensive spells, avoid fighting/run/surrender
  before combat. Fanaticism cancels it and vice versa. Numeric and behavioral portions belong to the source.
- Fear, Divine Magic 887–917: outcomes differ (coma/damage, flight, −20 tests, immunity). A generic fear marker must
  not imply one branch's penalty. Ghoul Howl and fear possession explicitly reuse Demoralise instead.
- Spot Rules 128–129 says Vigour removes fatigue, whereas its own spell entry at Personal Magic 966–974 describes
  magical HP. Flag the inconsistency for human adjudication rather than extending the agreed Vigour automation.

## Current UI and core integration

- OQ has no override of CONFIG.statusEffects/specialStatusEffects. Core defaults in
  `foundryvtt-api/client/config.mjs:1738` include many non-OQ markers: stun, shock, corrode, regen, hover, burrow,
  generic upgrades/shields and others. Their icons also do not use this repository's required themed paths.
- `foundryvtt-api/client/documents/actor.mjs:235–255` aggregates statuses from active applicable effects. Core has no
  separate numeric status engine. `active-effect.mjs:128–138` can construct a no-change status effect and defaults
  icon visibility to ALWAYS. One source effect can carry both supported numeric changes and a status marker.
- `actor.mjs:547–578` native toggle can delete every actor-owned single-status effect when no static configured ID
  is present. Naive HUD removal could delete several independently sourced paralysis effects. Native HUD checks
  actor-owned effects and does not itself check their active state (`client/applications/hud/token-hud.mjs:117–130`),
  so transferred effects and inactive effects need explicit system display/control handling.
- Core DEFEATED special status is dead (`client/config.mjs:1917`). Combatant isDefeated checks its defeated flag or
  actor status (`client/documents/combatant.mjs:125`); OQ skipDefeated uses it (`src/module/document/combat.js:36`).
  Statuses do not currently prohibit other actions or automatically adjudicate HP/death.
- Core special statuses blind/invisible and others affect token vision/perception/filter behavior
  (`client/canvas/placeables/token.mjs:946,4524–4540`). Pure reminder treatment requires explicit configuration.
- Actor sheets have no condition/effect list yet. The combat tracker renders effect icons with a names-only tooltip
  (`src/public/templates/applications/combat-tracker/tracker.hbs:32`). Core tracker uses active effects and showIcon
  (`client/applications/sidebar/tabs/combat-tracker.mjs:295–307`); indefinite no-change reminders need visible icons.
  OQ custom hooks already refresh on effect/item/token changes and distinguish synthetic actor UUIDs.

## Roll paths

- Sheet Shift-click passes skipDialog (`src/module/sheet/actor/actor-base-sheet.js:221–226`). Skills, weapons and
  rolled abilities then call testRoll directly (`src/module/document/item/base-item.js:50–57`). Current normal dialogs
  have difficulty/modifier/visibility only, with no conditional choices or reminder section.
- MP quick casting chooses highest affordable magnitude (`src/module/document/item/spell.js:78–104`). Non-rolled
  Divine quick casting chooses remaining magnitude and skips confirmation (`:107–140`), with no skill test. Rolled
  casting has its own dialog/template (`src/module/application/spell-cast-dialog.js:21`); generic-dialog-only changes
  would miss casting tests.
- `game.oq.rollItem` opens the ordinary test path (`src/module/utils/oq-game.js:6–12`); direct custom callers can ask
  to skip the dialog. Cover those calls as well as sheet Shift-click.
- Follow-up damage currently rereads the live item (`src/module/chat-handlers/updates-from-chat.js:79–90`). The
  resolved historical-damage contract already requires new work; reminders must not change it into a current lookup.
