# v0.9 conditions: palette, reminders and source-aware markers

Status: ready-for-agent

Track **Cnd** of the v0.9 effects release: chunks **Cnd1** (conditions display) and **Cnd2** (source-aware controls).
Source plan: [effects release map](../effects-release/map.md) and its
[release chunks decision](../effects-release/issues/08-release-chunks.md). Policies come from the resolved decisions
[06 conditions and reminders](../effects-release/issues/06-conditions-and-reminders.md) (the palette, marker
ownership, surfaces and controls; its conditional-choice and quick-roll parts belong to Fx6a/Fx6b),
[03 lifetime and duplicates](../effects-release/issues/03-lifetime-and-duplicates.md) (human ending, no invented
clocks) and [09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md) (legacy
markers, vision and Dead). Effect records, the effect editor, the actor Effects list and owner passives come from the
[actor effects spec](../v09-actor-effects/spec.md); templates, applied effects and clocks from the
[application spec](../v09-application/spec.md). Rules evidence is in the
[conditions evidence](../effects-release/conditions-evidence.md). Every chunk must meet the
[definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

## Problem Statement

The token HUD offers Foundry's generic status list: Stunned, Shocked, Corroded, Regenerating, Hovering, Burrowing,
upgrade and shield markers. Most are not OpenQuest states, the icons are not the system's, and nothing explains what
a marker means at the table. OpenQuest's own states (Surprised, Fatigued, Held, Entangled, Stuck) are missing, and
Prone, Paralysed or Poisoned have no rules text: the SRD's Prone modifiers depend on close or ranged context, and
Paralysis from ghoul venom ends differently from a spider's.

Core markers also do too much. Marking a token Blinded or Invisible silently changes its vision and visibility on the
canvas, which is rules adjudication the Referee has not done. And they do too little: an effect that is only a
reminder ("Demoralised: may not cast offensive spells", "Owes the river spirit a favour") never appears on the token or
in the combat tracker unless it has a duration, so the reminder is invisible exactly where play happens. The tracker
shows effect icons with names only, so a player cannot see where a condition came from or what it does.

Removal is dangerous. Core's toggle removes every single-status effect with that status, so clicking Paralysed on the
HUD to clear a hand-placed marker can also delete the ghoul's venom effect and an unrelated spider bite. The HUD only
recognises effects owned by the actor, so a condition supplied by a creature ability or a readied item does not show
as active there, while a disabled or expired effect can.

## Solution

The system replaces the core status list with a curated **condition palette** of seventeen OpenQuest conditions, each
with a themed icon and a short rules summary. A **status marker** never supplies numbers: any numeric consequence
belongs to the effect that causes the condition (Demoralise halves combat skills; a Paralysed marker alone changes
nothing). Effects gain a Conditions field in the effect editor, so a spell template, a creature ability passive or a
hand-made effect can carry markers alongside its changes and rules text. A **standalone marker** (one placed directly
from the HUD) is a separate, marker-only effect; removing it never touches any other effect.

Blinded and Invisible become reminders: the system does not change token vision or visibility for them. Dead keeps its
defeated-combat behaviour, and is still only ever set by a human; zero HP never marks a creature dead.

Conditions and reminders become visible where play happens. Tokens and the combat tracker show an icon for every
active effect that carries a marker or is a reminder, even without a duration. Each tracker icon's tooltip gives its
name, source and rules text. The actor sheet's Effects list opens with a condition summary showing each active
condition and what supplies it.

In Cnd2 the HUD becomes source-aware. A condition supplied by any active effect, including an eligible item passive,
shows as active with a badge counting its sources. Clicking it opens a **condition sources** view listing each
source with its rules text and an explicit control to end it, switch it off or remove the standalone marker. Ending
one of two Paralysed sources leaves the creature Paralysed.

## User Stories

### Palette and markers (Cnd1)

1. As a Referee, I want the token HUD to offer OpenQuest conditions instead of Foundry's generic list, so that every
   marker I can place means something in this game.
2. As a Referee, I want the palette to contain Dead, Unconscious, Asleep, Prone, Surprised, Fatigued, Heavily fatigued,
   Blinded, Deafened, Paralysed, Held, Entangled, Stuck, Burning, Poisoned, Diseased and Invisible, so that the common
   SRD states are one click away.
3. As a Referee, I want each palette condition to have a distinct themed icon in the system's style, so that tokens are
   readable at a glance and match the sheets.
4. As a player, I want each palette condition to carry a short rules summary pointing to the relevant SRD rules, so
   that I know what to check when my character is Prone or Held.
5. As a Referee, I want a standalone marker to change no numbers, so that marking a goblin Prone does not apply a
   penalty the context may not call for.
6. As a Referee, I want removing a standalone marker to remove only that marker, so that I never delete a spell or
   ability effect that also supplies the condition.
7. As a Referee, I want removing the standalone marker to tell me when the condition is still supplied by another
   effect, so that I understand why it is still showing.
8. As a Referee, I want to add markers to an effect in the effect editor, so that a ghoul's venom effect shows
   Paralysed and Demoralise can show its own icon with its numbers.
9. As a Referee, I want an effect carrying a marker to keep owning its numbers once, so that adding the same condition
   as a standalone marker never doubles a penalty.
10. As a Referee, I want two effects supplying the same condition not to stack anything by virtue of the marker, so
    that numeric combination stays the rules of the effects themselves.
11. As a Referee, I want to create custom reminders with my own name, icon and rules text for cases outside the
    palette, so that a named spell or a one-off ruling does not need a palette entry.
12. As a Referee, I want named spells such as Hinder, Truth Seeker or Demoralise to stay source effects with their own
    name and icon, not palette entries, so that the palette stays short and each source keeps its own rules.
13. As a Referee, I want spell templates and ability passives to carry markers too, so that applying Demoralise from a
    card or giving a creature a permanent condition shows on the token.

### Special statuses (Cnd1)

14. As a Referee, I want marking a token Blinded or Invisible to leave its vision and visibility alone, so that I decide
    what the creature and others can see.
15. As a Referee, I want my explicitly saved token vision and visibility settings untouched by the new palette, so that
    upgrading changes nothing I configured.
16. As a Referee, I want marking a creature Dead to keep marking it defeated in combat, so that skipping defeated
    combatants keeps working.
17. As a Referee, I want a creature at zero HP not to be marked Dead automatically, so that unconsciousness, nonlethal
    damage, Fortune and stabilisation stay my call.
18. As a Referee, I want no other condition to block actions, change token settings, roll damage, or remove itself, so
    that the system reminds and I adjudicate.

### Visibility (Cnd1)

19. As a Referee, I want every active effect that carries a marker to show its icon on the token and in the combat
    tracker, so that conditions are visible where play happens.
20. As a Referee, I want reminder-only effects without a duration to show on the token and tracker as well, so that a
    "may not cast offensive spells" reminder is never hidden.
21. As a Referee, I want ordinary numeric effects without a duration or marker to stay off the token by default, so
    that a ring's permanent +2 AP does not clutter the canvas.
22. As a Referee, I want to override an effect's icon visibility (always, when temporary or marked, never), so that I
    choose what shows on the canvas.
23. As a player, I want each tracker effect icon's tooltip to show its name, source and rules text, so that I can read
    what a condition does without opening the sheet.
24. As a player, I want the actor sheet's Effects list to open with a summary of active conditions and what supplies
    each, so that I see the creature's state at a glance.
25. As a player, I want each effect row on the sheet to show the markers it carries, so that I know which effect causes
    which condition.
26. As a Referee, I want disabled, suppressed and expired effects to stop showing their markers and icons but remain
    inspectable in the Effects list, so that the display reflects only what is active.
27. As a Referee, I want a condition supplied by an eligible item passive (a creature ability, a readied cursed amulet)
    to show on the token, tracker and sheet, so that passives are as visible as applied effects.
28. As a Referee, I want a reminder to persist through reloads until someone ends it, so that the system never forgets
    it.
29. As a Referee, I want markers on one unlinked token to affect only that token's actor, so that two goblins from one
    base actor stay independent.
30. As a player who owns a character, I want to add and remove standalone markers on my own token, so that routine
    bookkeeping does not need the Referee.

### Source-aware controls (Cnd2)

31. As a Referee, I want a HUD condition to show as active whenever any active source supplies it, including item
    passives, so that the HUD agrees with the token icons.
32. As a Referee, I want a HUD condition supplied by effects to look different from one with only a standalone marker,
    and to show how many sources supply it, so that I know a click will not simply remove it.
33. As a Referee, I want clicking a condition supplied by effects to open a list of its sources instead of deleting
    anything, so that I end the right one.
34. As a Referee, I want each source in that list to show its name, where it came from (standalone, effect on the actor,
    passive from a named item) and its rules text, so that I can tell two Paralysed sources apart.
35. As a Referee, I want to end one source from that list and see the condition stay while another source remains, so
    that ending the venom does not wake a creature also paralysed by a spell.
36. As a Referee, I want ending an item passive from that list to switch the passive off on its item rather than delete
    the item, so that I can switch it back on later.
37. As a Referee, I want to open each source's effect or item from the list, so that I can inspect or edit it.
38. As a Referee, I want to add or remove the standalone marker from the same list, so that I can mark a condition the
    sources don't cover.
39. As a Referee, I want inactive effects carrying the condition listed separately with their inactive reason, so that I
    know why a disabled source does not count.
40. As a player, I want to open the condition sources view from the condition summary on the sheet, so that I can
    inspect sources without the token HUD.
41. As a player without ownership, I want the sources view read-only, so that I can read the rules without being able to
    change another creature.
42. As a Referee, I want unmarking a combatant defeated while effects other than the standalone Dead marker still supply
    Dead to show those sources, so that I end them deliberately rather than wonder why the skull stays.
43. As a Referee, I want ending a source on an unlinked token to change only that token's actor, so that the base actor
    and other tokens keep their effects.

### Compatibility and documentation

44. As a Referee upgrading a v0.8 world, I want existing effects with core statuses kept as they are, so that nothing is
    deleted behind my back.
45. As a Referee upgrading, I want effects carrying statuses outside the new palette (Stunned, Shocked) to stay listed
    and inspectable with their stored icon, so that I can end or edit them by hand.
46. As a Referee, I want a Conditions documentation page listing every palette condition, its rules summary and SRD
    references, the vision and Dead boundaries and the manual workflows (Hinder, Truth Seeker, Demoralise, ghoul
    paralysis), so that the table knows what the system does and does not adjudicate.

## Implementation Decisions

### Condition palette

- The system replaces the core status list during `init`, before world documents are prepared, with the palette below.
  Order is the table order. Each entry has an id, a localized label, a localized **rules summary** (the reminder scope
  from decision 06, with SRD section references), a themed icon and a **fixed standalone effect id**.
- Ids reuse core ids where the condition is the same, so stored effects keep their identity: `dead`, `unconscious`,
  `sleep`, `prone`, `blind`, `deaf`, `paralysis`, `burning`, `poison`, `disease`, `invisible`. New ids: `surprised`,
  `fatigued`, `heavilyFatigued`, `held`, `entangled`, `stuck`. Core `restrain` is not mapped to Held, Entangled or
  Stuck.

| Condition | Rules summary scope (decision 06) |
| --- | --- |
| Dead | Human-declared death; defeated in combat. Zero HP alone does not apply it. |
| Unconscious | Loss of consciousness; waking depends on the cause (fatigue fumble, zero MP, damage). |
| Asleep | Sleep and waking per source (Mischief, poison). |
| Prone | Close combat: attack and defence −20 while prone, attacker +20 against a prone target; ranged: prone attacker −50, prone target −20. Context decides. |
| Surprised | First round: only Parry/Dodge; a Perception fumble also prevents defence. |
| Fatigued | Fatigue rules and recovery; the marker alone changes nothing. |
| Heavily fatigued | Severe fatigue; penalties rise to −50%; other consequences adjudicated. |
| Blinded | Loss of sight; ranged attacks −50; no automatic vision change. |
| Deafened | Loss of hearing; no automatic restriction. |
| Paralysed | Onset, duration and ending per source (ghoul venom, spider venom). |
| Held | Grapple hold; escape by opposed Unarmed Combat. |
| Entangled | Web or net; escape by Athletics versus the recorded attack; web HP where relevant. |
| Stuck | Glue or similar; Athletics versus magnitude ×10 to break free. |
| Burning | Damage per source intensity until extinguished; no generic damage number. |
| Poisoned | Potency, delay, symptoms and recovery per poison. |
| Diseased | Progression, recovery and treatment per disease. |
| Invisible | Detection and ending per source; no automatic hiding or vision change. |

- Icons are new Game-Icons.net glyphs in the themed two-colour style (dark red background, light glyph), kept in a
  conditions subfolder of the themed icon set. They are new references with no legacy black copies, so the legacy icon
  check is unaffected. The README already credits Game-Icons.net.
- The palette is configuration data exported from a module free of Foundry calls at import time, so the palette test
  can read it.

### Markers and standalone markers

- Markers are the core `statuses` set on an effect. The effect editor (actor effects spec) gains a **Conditions** field:
  a multi-select of palette conditions. Statuses on an effect that are not in the palette are shown as "other stored
  statuses", preserved on save and removable one by one, like unmanaged changes.
- Markers never contribute numbers. The effect-contributions module reads only the curated changes; marker presence is
  not an input to any calculation.
- A **standalone marker** is the effect core creates from a palette entry: the palette label as name, its icon, its
  single status, the rules summary as rules text, no changes. Because each palette entry has a fixed effect id, core's
  toggle creates and removes exactly that effect and never another effect carrying the same status. An actor has at
  most one standalone marker per condition.
- The actor's status toggle keeps core behaviour for the standalone marker. When it removes the standalone marker and
  other active sources still supply the condition, Cnd1 shows a notification naming them; Cnd2 opens the condition
  sources view instead.
- Markers on templates: the Conditions field applies to App1 effect templates as well. The cast snapshot records the
  template's markers and the applied effect carries them. Whichever of Cnd1 and
  [App1](../v09-application/spec.md) lands second wires markers through the snapshot.
- A custom reminder is an ordinary actor effect with no changes (Fx1). Cnd1 adds no new reminder type; it makes such
  effects visible (below).

### Special statuses

- Dead stays the core defeated status, so the combatant's defeated state, the tracker skull and OpenQuest's
  skip-defeated rule keep working. Nothing sets or clears Dead from HP or any other value.
- The Blind and Invisible special-status mappings are removed (pointed at no palette condition), so core applies no
  vision, detection or visibility behaviour for Blinded or Invisible. This applies to stored pre-v0.9 effects with those
  statuses too, as decision 09 requires. Explicitly saved token vision and detection settings are not touched.
- Other core special statuses (burrow, hover, fly) keep core's mapping; they are not in the palette and are not shown on
  the HUD.

### Icon visibility

- Core draws a token or tracker icon for an applied effect when its show-icon setting is "always", or "conditional" and
  the effect is temporary. The system widens "conditional": an effect also shows when it carries any status or is a
  **reminder** (no curated changes). The decision is a pure predicate; the effect document applies it during its own
  preparation so that core's token and tracker drawing honour it without overriding temporariness or expiry.
- The effect editor exposes core's show-icon setting with labels: always; when temporary, marked or a reminder (the
  default); never.
- Protection +3 AP without a duration or marker therefore stays off the canvas until Clk1 gives it a duration; a ring's
  +2 AP passive stays off; a troll's regeneration reminder passive and a Demoralise effect show.

### Display surfaces (Cnd1)

- **Token**: core draws the icons of the actor's applied effects (active actor effects and active transferred passives)
  filtered by the predicate above. Overlay behaviour is core's, used for the standalone Dead marker set from the
  tracker.
- **Combat tracker**: OpenQuest's tracker template gives each effect icon its own tooltip with name, source name,
  markers and rules text, replacing the shared names-only tooltip. Dead continues to show as defeated, not as an icon.
  Existing refresh hooks on actor, item, token and effect changes keep the tracker current.
- **Token HUD (Cnd1)**: shows the palette with each condition's label and rules summary as its tooltip. Active
  highlighting is core's (standalone marker present) until Cnd2.
- **Actor sheet**: the Effects list (Fx1) gains a condition summary at its top: one chip per active condition with its
  icon and label, and a tooltip listing its active sources and the palette rules summary. Effect rows show the markers
  they carry. Inactive records stay listed with their inactive reason and supply no chip.
- All surfaces act on the token's actor, which for an unlinked token is its synthetic actor.

### Pure condition-sources module (the seam)

A new pure module, free of Foundry calls at import time, owns condition decisions over plain data. Inputs: the palette,
and the actor's effect records (id, name, icon, source name, statuses, whether it has curated changes, show-icon
setting, whether it is temporary, active state and inactive reason, owner kind: actor or item with item id and name,
and whether its id is a palette's standalone id). It provides:

- **Active sources per condition**: each palette condition (and each out-of-palette stored status) with its active
  sources, classified as standalone marker, actor effect or item passive. Disabled, suppressed and expired records are
  excluded from active sources and returned separately with their reason.
- **Icon visibility**: the widened show-icon predicate for one effect.
- **HUD state per palette condition** (Cnd2): off, standalone only, or source-backed, with the active source count.
- **Toggle plan** for a HUD click or a defeated toggle: create standalone, remove standalone, open the sources view, or
  remove standalone and report remaining sources.
- **Summary data** for sheet chips and tracker tooltips: per condition, its label, rules summary and source names.

### Source-aware controls (Cnd2)

- **HUD state**: the system's token HUD subclass computes each palette entry's state from the module instead of core's
  single-status check, so passives and multi-status effects count and inactive effects don't. Source-backed entries get
  a distinct style and a count badge.
- **Clicks**: off → add the standalone marker; standalone only → remove it; source-backed → open the condition sources
  view. Right-click keeps core's overlay toggle for the standalone marker only; on a source-backed entry it also opens
  the view.
- **Condition sources view**: an ApplicationV2 dialog in the light parchment theme for one actor and one condition. It
  lists active sources (icon, name, source name, kind with item name for passives, expandable rules text) and, below,
  inactive records with their reason. Per-row actions: open (the effect sheet; a passive's definition on its item);
  end (delete an actor or applied effect after confirmation, through the same path as the Effects list, so receipts
  and transitions follow); switch off (a passive's switch, never deleting the item); remove (the standalone marker).
  The view also offers adding the standalone marker when absent. It re-renders on effect and item changes.
- **Entry points**: HUD clicks as above; the sheet's condition chips; and unmarking defeated from the tracker when Dead
  still has sources other than the standalone marker.
- **Permissions**: actions follow the normal permissions of the actor (actor effects, standalone marker) or the item
  (passive switch). Others see the view read-only. Ending passives respects the source item; no actor-owned mirror is
  created.

### Representative content

Cnd ships no compendium templates. The manual checks build their sources by hand with the effect editor: a ghoul venom
effect (Paralysed marker, reminder with the actual-healing ending), Demoralise (combat-skill halving plus behavioural
reminder) and a creature ability passive with a marker. The documentation gives these as recipes. Markers on spell and
ability templates arrive with the content track's batches; the coverage inventory is unchanged.

### Delivery and dependencies

| Chunk | Blocked by | Delivers |
| --- | --- | --- |
| Cnd1 | [Fx1](../v09-actor-effects/spec.md) | Palette and themed icons, rules summaries, fixed standalone ids, Conditions field in the editor, removal notification, Blind/Invisible remapping, widened icon visibility, show-icon control, tracker tooltips, sheet condition summary and row markers, Conditions documentation page |
| Cnd2 | Cnd1, [Itm2](../v09-actor-effects/spec.md) | Source-aware HUD state and badges, click plan, condition sources view, sheet chip and defeated-toggle entry points, passive switch-off |

One PR per chunk into master. Downstream: content batches that put markers on templates and the bestiary ability
batches use the Conditions field. Chunks may be split further, but never merged across tracks.

## Testing Decisions

A good test exercises observable outcomes through a public seam: active sources, HUD states, icon visibility and
toggle plans as data, not internal helpers or markup. Tests run in plain Node with stubbed globals, per the repository
convention. Two seams, agreed with the user:

1. **Condition-sources module** (new test file): active sources per condition with standalone, actor-effect and passive
   sources; exclusion of disabled, suppressed and expired records, returned with their reason; multi-status effects;
   out-of-palette stored statuses; HUD state (off, standalone only, source-backed with count); icon visibility for each
   show-icon setting against temporary, marked, reminder and plain numeric effects; toggle plans for off, standalone
   only, source-backed, and defeated removal with remaining sources. Prior art: the pure-function tests in the magic,
   difficulty and roll test files.
2. **Palette data** (new test file): every palette entry has a unique id and fixed standalone id, points to an existing
   themed icon, and has its label and rules summary keys in the English localization source. Prior art: the legacy
   icons test.

The HUD, sheet chips, tracker tooltips, the sources view and the Dead and vision configuration are thin callers,
verified by the manual scenarios on a character and an NPC, linked and unlinked tokens, owner and GM users, with
reloads between steps.

### Acceptance examples

| Chunk | Setup | Action | Expected |
| --- | --- | --- | --- |
| Cnd1 | Any token | Open the token HUD | Seventeen OpenQuest conditions with themed icons; no Stunned, Shocked or other core entries |
| Cnd1 | Character, skill 60 | Add standalone Prone from the HUD; inspect token, tracker, sheet; roll the skill; reload | Prone icon on token and tracker, chip on sheet, tooltip with the rules summary; test at 60; still there after reload |
| Cnd1 | Actor with a hand-made "Ghoul venom" effect carrying Paralysed | Add standalone Paralysed; remove it from the HUD | Venom effect untouched; notification names it; Paralysed icon remains |
| Cnd1 | Actor with Demoralise (combat ×0.5, Demoralised reminder) | Add a standalone marker on top; roll Close Combat 65 | 32, not 16; reminder shown |
| Cnd1 | Any actor | Add a no-change reminder without duration; reload; view tracker | Icon on token and tracker; tooltip shows name, source and rules text; listed until deleted |
| Cnd1 | Actor with Protection +3 AP, no duration | View token | No icon (default visibility); set "always" → icon appears |
| Cnd1 | Token with explicit vision settings | Add Blinded, then Invisible; remove both | Vision, detection and visibility unchanged throughout |
| Cnd1 | Combat with skip-defeated on | Mark Dead from the tracker; separately reduce another actor to 0 HP | First is defeated and skipped; second is not Dead |
| Cnd1 | Any actor | Add Fatigued, Heavily fatigued, Burning, Poisoned, Diseased | No characteristic, movement, test, damage or HP change |
| Cnd1 | Two unlinked tokens of one actor | Add Prone on one; reload | Only that token's actor has it; base actor and other token unchanged |
| Cnd1 | v0.8 world: actor with core Dead marker (random id), another with a Stunned effect, a token with a Blind effect | Upgrade; unmark defeated on the first; inspect the others | First: notification names the old Dead effect, still defeated until it is deleted from the Effects list. Stunned stays listed with its stored icon and status. Blind no longer changes vision |
| Cnd1 | Owned character, player user | Add and remove standalone Prone on own token | Allowed; no effect on other actors |
| Cnd2 | Two hand-made Paralysed sources | Open HUD; click Paralysed; end one | Source-backed with badge 2; view lists both; after ending one, badge 1 and icon remains; ending both clears it |
| Cnd2 | Creature ability passive carrying Paralysed | Open HUD; switch the passive off from the view | Active with badge 1 before; ability item kept, passive switched off; condition clears; switching on restores it |
| Cnd2 | Readied amulet passive carrying Diseased | Store the amulet | Badge and icon gone; view lists the passive as inactive (item not in an eligible state) |
| Cnd2 | Disabled effect carrying Prone, no other source | Open HUD | Prone off; the sources view (from the sheet) lists it as inactive with reason |
| Cnd2 | Paralysed from a source only | Click Paralysed on the HUD | Sources view opens; nothing deleted |
| Cnd2 | Dead from a hand-made effect plus standalone Dead | Unmark defeated from the tracker | Standalone removed; sources view opens listing the effect |
| Cnd2 | Player observer on another's sheet | Click a condition chip | Read-only view with rules text; no actions |
| Cnd2 | Two unlinked tokens; Paralysed source on one | End it from that token's HUD | Only that synthetic actor changes; after reload both tokens, tracker and sheets agree |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk.

## Out of Scope

- Conditional choices in test dialogs, the reminders section and quick-roll handling (Fx6a, Fx6b).
- Numeric consequences for any palette condition; ready-made standalone condition templates (e.g. an SRD Fatigued with
  its penalties) are documented recipes, not shipped content.
- Automatic Dead from HP, automatic application or removal of any condition from resource thresholds, healing or
  rolls; action prohibition; resistance, escape or opposed tests; recurring damage.
- Automatic token vision, detection, hiding or token setting changes for any condition.
- Palette entries for named spells or abilities, and core `restrain` mapping to Held, Entangled or Stuck.
- Migrating, converting or repairing pre-v0.9 status effects, legacy marker ids or icons; inferring sources or numbers.
- Clocks on markers beyond the effect's own duration (Clk1); concentration and contextual endings stay manual.
- Templates with markers for spells and abilities, the bestiary ability pack and coverage inventory changes (content
  track).
- A general condition engine, containment or immunity framework.

## Further Notes

- Glossary terms used: **condition**, **status marker**, **reminder**, **applied effect**, **passive effect**,
  **effect template**. Candidate new terms for review: **condition palette** (the curated list of conditions offered
  for marking), **standalone marker** (a marker-only effect placed directly, independent of any source) and
  **condition source** (an active effect that supplies a condition). Add them to the glossary if they stick.
- Placement decided in this spec: the removal notification and the fixed standalone ids land in Cnd1 so the HUD is
  never destructive, even before source-aware controls; the defeated-toggle entry point and passive switch-off land in
  Cnd2. The marker field on templates is wired by whichever of Cnd1 and App1 lands second.
- Expired effects are excluded from active sources once Clk1 gives them an expired state; before Clk1 nothing expires.
- Implementer checks in the Foundry v14 sources (read `docs/foundry-v14-notes.md` first): that a palette entry's fixed
  effect id is honoured by the status toggle, the HUD and `fromStatusEffect` on world and synthetic actors; that
  removing the Blind and Invisible special-status mappings is tolerated by token vision and detection code; how the
  tracker's defeated toggle calls the status toggle; whether an effect's active state already excludes expired
  effects; that a prepared show-icon value is read by token and tracker drawing; and when the token HUD re-renders on
  effect and item changes.
- Documentation in the same PRs, edited as HTML under `docs/packs/` and regenerated: a new Conditions page (palette,
  rules summaries with SRD references, markers versus sources, vision and Dead boundaries, the Hinder, Truth Seeker,
  Demoralise and ghoul paralysis workflows, recipes for standalone condition effects such as Fatigued), and updates to
  the Actors page (condition summary, Conditions field, icon visibility) and the Combat page (tracker tooltips, Dead
  and defeated, the sources view).
- Release notes for v0.9 mention that the core status list is replaced, that Blinded and Invisible no longer change
  vision, and that effects with out-of-palette statuses stay listed but have no HUD entry.
