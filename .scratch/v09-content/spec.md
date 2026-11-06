# v0.9 content: spell templates, creature abilities, coverage and release

Status: ready-for-agent

Track **Content** of the v0.9 effects release: the **coverage page** (Cov), six **spell batches** (Sp1–Sp6c), five
**creature ability batches** (Ab1–Ab5b), the **manual-coverage documentation batch** (Man), the **SRD spell refresh
macro** (Ref) and the **release-acceptance checklist** (Rel). Source plan: [effects release
map](../effects-release/map.md) and its [release chunks decision](../effects-release/issues/08-release-chunks.md),
section "Content, documentation and tools". Policies come from the resolved decisions
[01 supported mechanics](../effects-release/issues/01-supported-mechanics.md) (coverage boundary, treatments, numeric
contract), [02 resource semantics](../effects-release/issues/02-resource-semantics.md) (Tap, Vigour),
[03 lifetime and duplicates](../effects-release/issues/03-lifetime-and-duplicates.md),
[04 chat-card application](../effects-release/issues/04-chat-card-application.md),
[05 item ownership](../effects-release/issues/05-item-ownership-and-transfer.md),
[06 conditions and reminders](../effects-release/issues/06-conditions-and-reminders.md),
[07 enchanted items](../effects-release/issues/07-enchanted-items.md) (manual enchanted kinds),
[09 migration and compatibility](../effects-release/issues/09-migration-and-compatibility.md) (no automatic adoption)
and [10 SRD spell refresh](../effects-release/issues/10-srd-spell-refresh.md) (the macro contract). Starting data:
the [spell inventory](../effects-release/spell-coverage-draft.md) and the
[bestiary inventory](../effects-release/bestiary-coverage-draft.md). Every chunk must meet the
[definition of a reviewable chunk](../effects-release/assessment.md#definition-of-a-reviewable-chunk).

The mechanics this track builds on are specified in the other track specs:
[resources](../v09-resources/spec.md), [actor effects](../v09-actor-effects/spec.md),
[application and clocks](../v09-application/spec.md), [conditions](../v09-conditions/spec.md) and
[enchanted items](../v09-enchanted/spec.md). Those tracks ship only their representative templates: Protection (App1),
Shield (App4), Weapon Enhance and Enhance Skill (App6) and Vigour (Clk2). This track adds every other spell
template, all creature abilities, the coverage documentation, the refresh tool and the release itself.

Must ship: Cov, every Sp and Ab batch, Man and Rel. Ref may slip to 0.9.x as a unit without blocking anything else.

## Problem Statement

Once the mechanic tracks land, a Referee can build effects by hand and apply them from cards, but the SRD content
still does nothing. The 162 pack spells have no effect templates, so a successful Haste, Demoralise or Enhance STR
card offers no Apply effect, and the Referee must rebuild each spell's numbers in the effect editor at the table.
Earth Scream and Venom, two real SRD spells, are missing from the pack entirely. Creature powers exist only as prose
in the Bestiary journal: there is no Basilisk venom, Ghoul Howl or werewolf wolf form to drop onto an NPC, and the
Animal List's spider and viper venoms aren't in the journal at all.

Nobody can tell what the system does for a given spell. The coverage analysis lives in planning notes. A player
casting Countermagic or a GM resolving a gorgon's gaze has no in-game page saying "this one is yours to adjudicate,
and here is how". The same is true for matrices, potions, scrolls, blessed items and Tap, which v0.9 deliberately
leaves manual.

Existing worlds are stuck on old spell text. Upgrading never touches owned spell copies, which is right, but then a
character's Protection never gains its template unless someone deletes and re-adds it, losing learned magnitude and
Divine remaining magnitude.

Finally, there is no agreed end-to-end check that the release works on a fresh world and on an upgraded v0.8.2 world
before the version is cut.

## Solution

- **Coverage page (Cov).** A new documentation journal lists every SRD spell and every creature rule family with its
  **coverage treatment**: Automated, Assisted or Manual. Each row says what the system calculates and what the table
  does by hand. The page always describes what has actually shipped; each batch flips its rows when its templates
  land. A pack-content test keeps the page and the packs consistent.
- **Spell batches (Sp1–Sp6c).** Templates are authored into the SRD spells pack in mechanic order. Each batch is
  about a dozen spells and has its own short manual check. Where a rule needs a small, general template capability
  the mechanic tracks didn't build, the first batch that needs it adds it: a per-N-magnitude step (Haste), a
  **standard-skill selector** (Ironmind → Persistence), a choice among alternative templates at application (Fear's
  branches), a characteristic chosen at application (Enhance (characteristic)), a value entered at application
  (Shapechange) and component-aware weapon damage (True Weapon, Fireblade). Earth Scream and Venom are added as new
  pack items.
- **Creature ability batches (Ab1–Ab5b).** A new **SRD Creature Abilities** compendium of special-ability items, one
  folder per creature, each item linking to its Bestiary journal page as the rules source. Related rules group into one
  item with several effect definitions. Numeric parts are templates applied through Use ability (venoms, howls,
  possession penalties) or owner passives with a switch (werewolf wolf form). Manual abilities ship as reusable items
  with rules text and, where a target carries an ongoing state, a reminder template. These are building blocks for a
  later actor bestiary; the journal stays the reference.
- **Manual-coverage documentation (Man).** A new documentation page gives concrete workflows for everything v0.9
  leaves to the table: manual spell families, matrices, potions, scrolls, blessed items and relics, Tap and special
  reservoirs, and manual creature rule families. Coverage rows link to it.
- **SRD spell refresh (Ref).** A GM-only, manually invoked `game.oq.refreshSrdSpells()` previews and refreshes
  pack-linked spell copies in place on world actors, world items and unlinked tokens. It keeps learned magnitude,
  remaining magnitude, casting skill and name, exactly as decision 10 specifies.
- **Release checklist (Rel).** A code-free final ticket: a short end-to-end session on a fresh world and on a copy of
  a v0.8.2 world, then the version bump and release.

## User Stories

### Coverage page (Cov)

1. As a player, I want an in-game page listing every SRD spell with whether the system automates it, assists with it
   or leaves it manual, so that I know what to expect before I cast.
2. As a Referee, I want each creature rule family from the SRD bestiary and Animal List listed the same way, so that I
   know which creature powers I adjudicate by hand.
3. As a Referee, I want each row to say exactly what the system calculates, so that I don't assume more automation
   than exists.
4. As a Referee, I want each row to give the concrete manual steps for the rest (rolls to make, resources to edit,
   markers to place, effects to end), so that "manual" is a workflow, not a shrug.
5. As a player, I want each row to link to the spell or ability item, so that I can open it and drag it onto my sheet.
6. As a Referee, I want the three treatments defined at the top of the page, so that Automated, Assisted and Manual
   mean the same thing everywhere.
7. As a Referee, I want the page to state that every treatment still needs a human to decide outcome, recipient and
   application, so that "Automated" isn't read as automatic casting, resistance or damage.
8. As a Referee, I want spells whose templates haven't shipped yet to be listed as Manual, so that the page never
   promises behaviour that isn't in my installed version.
9. As a Referee, I want the page to record SRD source ambiguities (werewolf rounding and damage, gargoyle's unsigned
   modifier, ingested-versus-sting venoms, pain spirit wording, healing spirit HP, vampire hit locations, elemental
   attack values, Heal Body) and how v0.9 treats each, so that I see where my ruling is needed.
10. As a Referee, I want the page to say that Binding Spirits is a procedure inside Call Spirit, not a separate SRD
    spell, so that the extra pack item doesn't confuse spell counts.
11. As a Referee, I want creature rules that are only profile data (giant height, elemental scores, mummification,
    skeleton mindlessness, magic spirit traditions) marked as "author the creature's statistics", so that I don't look
    for an ability item that would double-count them.
12. As a maintainer, I want an automated check that every spell item and every ability item is listed, and that a row's
    treatment agrees with the templates its item carries, so that the page can't drift from the packs.

### Spell templates, general (all Sp batches)

13. As a player, I want every Automated and Assisted SRD spell to come with its effect template, so that a successful
    card offers Apply effect without hand-building the effect.
14. As a Referee, I want template numbers to follow the SRD per magnitude, so that the applied effect matches the cast.
15. As a Referee, I want each template's rules text to carry the spell's remaining manual rules (restrictions,
    exclusions, endings), so that the reminder is visible wherever the effect is.
16. As a Referee, I want a template's duration to come from the spell's Duration trait, so that applied effects
    expire as the rules say once clocks are in.
17. As a Referee, I want spells with rolled, concentration or until-used durations to carry no clock and say so in the
    rules text, so that I roll or end them by hand instead of trusting a wrong deadline.
18. As a Referee, I want conflicting-spell rules (Fanaticism and Demoralise, Berserk over Fanaticism, missile spell
    exclusions, Truth Seeker excluding other bonuses) stated in the rules text, so that the conflict review shows me
    what to decide.
19. As a player, I want refreshed pack spells to keep their item ids, so that existing links, macros and hotbar entries
    keep working.
20. As a Referee, I want a spell whose useful outcome is a lasting state on a creature (a ward, a condition, a
    permission) to ship a reminder template even when nothing is calculated, so that the state is visible on the
    token and tracker until someone ends it.
21. As a Referee, I want instant, information, summoning, area and enchantment-creation spells to ship no template, so
    that Apply effect isn't offered where there is nothing to apply.
22. As a Referee, I want each batch to come with a short manual check I can run on fresh copies of its spells, so that
    I can review content without reading YAML.

### Movement and combat order (Sp1)

23. As a player, I want Mobility and Slow to change movement by 2m per magnitude, with Slow never below 1m, so that the
    sheet shows the right movement.
24. As a player, I want Haste and Hamper to change movement by 1m per magnitude and combat order by 10 per two full
    magnitudes, so that odd magnitudes round down as the rules say.
25. As a Referee, I want Haste and Hamper never to change the rolled skill or Master status, so that only declaration
    order moves.
26. As a Referee, I want Rout to double the movement of the combatants I choose, with the unit and escape rules as a
    reminder, so that fleeing troops move correctly without a unit engine.
27. As a Referee, I want Hamper's movement never to go below zero, so that a large magnitude doesn't produce negative
    movement.

### Skill test modifiers and alternatives (Sp2)

28. As a Referee, I want a template to target a standard skill such as Persistence, Influence, Dodge or Close Combat
    on whoever receives it, so that a pack spell works on any recipient without me choosing the skill each time.
29. As a Referee, I want a standard skill to be found the same way the system already finds a spell's casting skill,
    so that hand-built NPCs with ordinary skill names work too.
30. As a Referee, I want a recipient without that skill to show a missing target and no contribution, so that nothing
    is silently applied to the wrong skill.
31. As a player, I want Thunder's Voice and Radiant Appearance to add to Influence tests and Stink Bomb to subtract,
    so that social tests come out right.
32. As a player, I want Fanaticism to add +20 to Close and Unarmed Combat and +50 to Persistence, and Berserk +50 to
    Close Combat, with their restrictions and aftermath as reminders, so that the numbers apply and the rules stay
    visible.
33. As a Referee, I want Demoralise to halve the recipient's combat skills with its behavioural rules as a reminder,
    so that the halving happens once and the restrictions are visible.
34. As a Referee, I want Glow cast on the eyes to subtract 5 per magnitude from combat skills and Dodge, so that the
    dazzled target's attacks and defences suffer.
35. As a Referee, when a spell's outcome has alternatives, I want the Apply dialog to let me pick which branch to apply,
    so that a Fear resisted with a success applies Shaken and not Fleeing.
36. As a Referee, I want no branch to be preselected and at least one to be required, so that I always make the choice.
37. As a Referee, I want Fear and Madness to offer each lasting branch from their result tables, with the shaken
    branch's −20 to all skill tests calculated, so that the common case is quick and the rare ones are visible.
38. As a Referee, I want one-off branch consequences (Fear's fumble HP loss, Madness's permanent INT loss) left as
    manual instructions, so that nothing irreversible happens from a click.

### Characteristics (Sp3)

39. As a player, I want Enhance (characteristic) and Diminish (characteristic) to ask which characteristic when I apply
    them, so that one pack spell covers all seven variants.
40. As a player, I want Diminish never to reduce a characteristic below 1, so that the SRD floor holds.
41. As a player, I want Enhance and Diminish POW to leave MP alone, so that the SRD exception holds.
42. As a player, I want Enhance or Diminish CON or SIZ to move my HP maximum and current HP together, so that the
    agreed maximum/current rule applies.
43. As a Referee, I want Mindblast to reduce INT by its magnitude, never below zero, with the CHA-based duration as a
    reminder, so that dependent skills recalculate.
44. As a Referee, I want Shapechange to ask for the new form's STR, DEX, CON and SIZ when I apply it, so that the
    system recalculates everything while I keep anatomy and abilities in my hands.
45. As a Referee, I want a value entered at application to be validated as a whole number and shown in the review
    before I confirm, so that a typo doesn't become a permanent effect.
46. As a Referee, I want Mischief to offer each lasting result from its table as an alternative, numeric where the
    table is numeric (test penalties, half SIZ) and reminders otherwise, so that I roll the D20 and apply the result.

### Conditional choices and damage additions (Sp4)

47. As a player, I want Coordination to add 10 per magnitude to combat order and Dodge, and offer its Athletics bonus
    as an unchecked choice for DEX-based uses, so that I decide when it's relevant.
48. As a player, I want Strength to add 1 per magnitude to my damage without changing STR, and offer its Athletics
    bonus as an unchecked choice for STR-based uses.
49. As a player, I want Ironmind offered as an unchecked +20 on Persistence tests, so that I tick it against mental
    magic or opposed Influence only.
50. As a player, I want Befuddle to subtract 20 from tests of skills whose formula directly references INT, so that
    the penalty follows the agreed matching rule.
51. As a player, I want Hinder to ask which skill when applied and offer its penalty as an unchecked choice on that
    skill's tests, so that the next relevant test can use it and I end it afterwards.
52. As a player, I want Truth Seeker, Second Sight, Resist (Element), Sun Disc and Create Godform offered as unchecked
    choices on the tests they can match, with their condition text, so that I judge relevance.
53. As a player, I want Enhance Unit to add 1D6 damage to the troops I apply it to, so that their damage rolls include
    it.
54. As a Referee, I want Shield's +10 per magnitude against malign magic offered as a conditional choice on resistance
    tests, alongside its AP, so that the complete spell ships.
55. As a Referee, I want Sun Disc's blindness offered as a separate alternative to apply to a target that failed its
    Dodge, so that the caster's cold resistance and the victim's blindness don't get mixed up.

### Selected weapons (Sp5)

56. As a Referee, I want Dull Weapon to subtract 2 per magnitude from the chosen weapon's damage without touching the
    wielder's Damage Modifier, so that the SRD distinction holds.
57. As a player, I want Damage Boosting to add 1 per magnitude to the chosen weapon's damage, with the 5 ENC limit as a
    reminder.
58. As a player, I want True (Weapon) to double only the chosen weapon's normal damage dice, leaving the Damage Modifier
    and other additions alone, so that 1D8 +1D4 becomes 2D8 +1D4.
59. As a player, I want Fireblade to add 1D10 fire damage to the chosen weapon, shown as fire on the damage card, so
    that the GM can separate fire from normal damage.
60. As a Referee, I want Firearrow to add its 1D10 fire on the chosen missile weapon with its rules text explaining the
    replacement reading, so that I can edit the damage dialog when I rule that fire replaces normal damage.
61. As a player, I want Speedart to add +20 hit and +3 damage to the chosen missile weapon with an "ends after firing"
    reminder, so that one shot gets the bonus and I end it afterwards.
62. As a Referee, I want Pierce, Multimissile and Sureshot to attach a reminder to the chosen weapon, so that the AP
    bypass or extra attacks are visible when that weapon is used.
63. As a Referee, I want damage cards to keep normal dice, Damage Modifier, typed and other terms distinguishable, so
    that I can apply immunities like the werewolf's by hand.

### Conditions, wards and permissions (Sp6a–Sp6c)

64. As a Referee, I want condition spells (Block Sense, Glue, Invisibility, Palsy, Slip, Venom) to carry the matching
    palette marker and their source rules, so that the token shows the condition with its own escape and ending rules.
65. As a Referee, I want Block Sense to offer Blinded, Deafened and an "other sense" reminder as alternatives, so that
    the chosen sense is what's marked.
66. As a Referee, I want behavioural spells (Scare, Vomit, Puppet, Dominate (Species), Earth Scream) to carry a reminder
    with their behaviour and ending, so that the affected creature's state is visible.
67. As a player, I want ward spells (Countermagic, Spirit Shield, Damage Resistance, Spell Resistance, Spirit
    Resistance, Spirit Block, Absorption, Reflection) to sit on my sheet as reminders with their magnitude in the
    name, so that the GM sees what to compare an incoming spell against.
68. As a Referee, I want Countermagic's reminder to say it ends after its first attempt even if it fails, and Spell
    Resistance's to say it also blocks beneficial spells, so that the differences between wards stay visible.
69. As a player, I want permission spells (Cushion Fall, Skin of Life, Walk on (Element), Water Breath, Breathe Water,
    Tongues, Mindspeech, Back Eyes, Babel, Fly, Care, Cover Blind Side, Farsight) to sit on my sheet as reminders,
    so that I remember what I can do and for how long.
70. As a Referee, I want Fly's reminder to state the flying speed rule (6m plus 2m per allocated magnitude) instead of
    changing walking movement, so that walking stays correct.
71. As a Referee, I want Care's reminder to tell me to apply the caster's current Protection or Countermagic to the
    recipient through their normal cards, so that no live link engine is implied.
72. As a player, I want Earth Scream and Venom in the spells pack, so that Axe Maidens and sorcerers can learn them.
73. As a Referee, I want Venom's reminder to give potency, onset and per-round damage, so that I can resolve each damage
    event by hand.

### Creature abilities, general (all Ab batches)

74. As a Referee, I want an SRD Creature Abilities compendium with one folder per creature, so that I can find a
    creature's powers in one place.
75. As a Referee, I want each ability item to link to its Bestiary journal page, so that the full creature rules are one
    click away.
76. As a Referee, I want related rules grouped into one item (a venom with its delay, potency, damage and duration), so
    that I add one item per power, not five.
77. As a Referee, I want the Animal List's spider and viper abilities included with the full SRD rule in their
    description, so that they're usable although the journal has no page for them.
78. As a Referee, I want abilities whose numbers land on a victim to apply through Use ability with no roll and no MP,
    so that I resolve exposure and resistance first and then apply.
79. As a Referee, I want ability items never to duplicate profile numbers (natural armour, flight speeds, skill
    values, zero characteristics), so that adding an ability doesn't double-count the creature's statistics.
80. As a Referee, I want manual abilities to ship as items with their rules text, so that I can drop "Regeneration" or
    "Night Vision" on an NPC sheet as a visible reminder of what it can do.
81. As a Referee, I want rolled durations (6D10 minutes) stated in the rules text and left off the template clock, so
    that I roll and set the duration on the applied effect.

### Venoms and poisons (Ab1)

82. As a Referee, I want Basilisk, Gorgon serpent, Manticore, Wyvern and Viper venoms to lower the victim's CON by
    their SRD amount, with the victim's HP maximum and current HP following, so that the poisoned creature weakens and
    recovers correctly.
83. As a Referee, I want Giant Spider venom to lower DEX by 6 with paralysis at zero DEX as a reminder, so that I watch
    the threshold.
84. As a Referee, I want each venom's immediate and recurring HP damage left as an instruction, so that damage is
    applied once, by hand, and never during preparation.
85. As a Referee, I want each venom to carry the Poisoned marker and Ghoul venom the Paralysed marker with its
    "ends when healing restores at least 1 HP" rule, so that the token shows the state and its ending.
86. As a Referee, I want each venom's potency, delay and the SRD's ingested-versus-sting wording quoted, so that I make
    the call with the source in front of me.

### Demoralising and spirit abilities (Ab2)

87. As a Referee, I want Ghoul Howl, Pentaghast mocking laughter and Fear spirit possession to reuse Demoralise's
    numbers and reminders, so that every demoralising power behaves the same.
88. As a Referee, I want Disease, Pain and Healing spirit abilities to ask for the spirit's POW when applied, so that
    the penalty or bonus matches the actual spirit.
89. As a Referee, I want the Healing spirit's bonus offered as an unchecked choice on Resilience tests against mundane
    illness, so that the next relevant test can use it and I end it afterwards.
90. As a Referee, I want possession effects to carry no clock and say they last until the spirit is ousted, so that
    they don't expire like spells.
91. As a Referee, I want the Pain spirit's ambiguity (symptoms throughout versus only when active) stated, so that I can
    disable the applied effect between spasms if I read it that way.

### Conditional creature modifiers (Ab3)

92. As a Referee, I want Bloodweed's plant cover (+25 Deception), Gargoyle's statue stillness (+50 Deception) and the
    Elemental's hidden-character detection (+50 Perception) offered as unchecked choices on the creature's own tests,
    so that I tick them when the situation applies.
93. As a Referee, I want Slime envelopment's −40 Athletics offered as an unchecked choice on the victim's escape or
    substitute-Dodge tests, so that ordinary Athletics isn't penalised.

### Werewolf (Ab4)

94. As a Referee, I want a Wolf Form ability that, when switched on, doubles STR, halves INT (rounding down) and sets
    movement to 30m on a human-form werewolf, so that the wolf's statistics follow from one toggle.
95. As a Referee, I want Wolf Form shipped switched off and its description to warn against using it on a wolf-form
    profile, so that multipliers aren't applied twice.
96. As a Referee, I want the werewolf's selective immunity, shapeshifting trigger, Night Vision and poison/asphyxiation
    vulnerability as manual items, so that every werewolf rule has a home.

### Manual creature abilities (Ab5a, Ab5b)

97. As a Referee, I want every remaining creature rule family (gazes, breath, regeneration, drain, forms, immunities,
    domains, possession, creation abilities) available as an item with its exact SRD exceptions, so that I don't
    re-read the journal mid-fight.
98. As a Referee, I want abilities that leave a state on a target (petrification, webbing, slime enmeshment, burning
    mummy, holy-symbol repulsion, corrosive blood on a weapon) to carry a reminder template, with the Entangled, Held
    or Burning marker where the palette has one, so that the target's state is visible.
99. As a Referee, I want the Pixie's at-will Mischief to point at the Mischief spell and the Unicorn's healing touch to
    describe its Heal-like effect and 6 MP cost, so that I reuse the spell rules instead of duplicating them.

### Manual-coverage documentation (Man)

100. As a Referee, I want a Manual Magic page with workflows for manual spell families (one-time damage and healing,
     ordered dispels, wards, information, summoning, areas, enchantment creation), so that I know which existing roll,
     resource edit or marker to use.
101. As a Referee, I want workflows for matrices, potions, scrolls, Divine blessed items and relics, so that I can run
     them with existing items, stores, skill tests and hand-made effects.
102. As a Referee, I want the Tap workflow (fill ordinary MP first, then a manual temporary MP pool up to twice normal
     capacity, remove one excess MP per minute after it ends, record permanent drain on the characteristic), so that
     Tap works with the agreed resource rules.
103. As a Referee, I want special reservoirs (Sorcerer's Stone, bound Magic Spirits, Mindlink, Places of Power)
     described with the closest supported tool, so that I know what the system does and doesn't track.
104. As a Referee, I want product limits kept apart from rules (single-source payment, ordinary-only refill), so that I
     don't mistake an interface choice for an SRD prohibition.
105. As a Referee, I want manual creature families (spirit combat, possession, regeneration, drain, transformations)
     covered too, so that the bestiary side has the same guidance.
106. As a player, I want coverage rows to link to the relevant workflow section, so that I jump from "Manual" straight
     to how.

### SRD spell refresh (Ref)

107. As a GM, I want to run a refresh of SRD spells on my world when I choose, never automatically, so that upgrading
     never rewrites my players' spells.
108. As a GM, I want a preview grouped by actor, world items and unlinked tokens before anything is written, so that I
     see what changes.
109. As a GM, I want only spells linked to the SRD spells pack to be refreshable, never matched by name, so that custom
     spells with SRD names are left alone.
110. As a GM, I want learned magnitude, Divine remaining magnitude, casting skill and the chosen name kept, so that a
     refresh never refills a spent spell or resets a learned magnitude.
111. As a GM, I want description, traits, image and effect templates replaced from the pack, so that copies gain the
     v0.9 templates.
112. As a GM, I want embedded ids, sorting, folders, ownership and source links kept, so that macros and links still
     resolve.
113. As a GM, I want copies that already match shown as up to date and skipped, so that the preview highlights real
     changes.
114. As a GM, I want copies with hand-made effects left unchecked and requiring an explicit Replace or Keep text only,
     so that I never lose custom work by default.
115. As a GM, I want differences in spell type, variability or MP cost flagged but never changed, so that I fix rules
     shape on the sheet myself.
116. As a GM, I want duplicates listed and refreshed independently, missing pack sources listed but not selectable, and
     unlinked same-named spells listed only as information with the manual re-add steps, so that every case is visible.
117. As a GM, I want rows that changed since the preview skipped, a failing actor not to stop the others, and a
     whispered summary, so that partial failures are clear and a re-run converges.
118. As a player, I want running the refresh to be refused for me, so that only a GM changes everyone's spells.
119. As a GM, I want the refresh never to cast, charge MP, apply effects or touch compendia, charms, cards or temporary
     pools, so that it is bookkeeping only.
120. As a GM, I want the documentation to give the macro body and the manual re-add steps, so that I can add it to my
     hotbar and handle unlinked copies.

### Release (Rel)

121. As the maintainer, I want a short end-to-end session on a fresh world covering each track's headline scenario,
     so that the chunks work together, not just alone.
122. As the maintainer, I want the same session on a copy of a v0.8.2 world (excess HP/MP recovered once, owned spells
     unchanged, legacy effects untouched, refresh run deliberately), so that upgrading is safe.
123. As the maintainer, I want the version bumped and release notes collected from every track, so that users learn
     about the replaced status list, the vision change for Blinded and Invisible and the casting payment change.

## Implementation Decisions

### Coverage treatments and the coverage page (Cov)

- Treatments are those of decision 01: **Automated** (an unambiguous ongoing numeric effect once a human has decided
  outcome, recipient and application), **Assisted** (a numeric subset plus manual consequences, including conditional
  choices), **Manual** (rules text, reminders and existing controls; no ongoing numeric effect).
- A row's treatment states **current shipped behaviour**. Until a spell's batch lands, its row says Manual, with the
  inventory's manual workflow. The batch flips the row to its target treatment in the same PR. The page is honest at
  every commit; the target treatments live in this spec's batch tables.
- The page is a new journal, **Spell and Ability Coverage**, in the documentation pack, authored as HTML under the
  journal sources and generated by the docs build. Pages: Overview (treatment definitions, the "human decides" baseline,
  reclassifications, source ambiguities and how v0.9 treats each, Binding Spirits, Heal Body, profile-data rows),
  Personal Magic, Divine Magic, Sorcery, Creature Abilities.
- Row contract, which the pack-content test parses: one table row per spell item (and per source-only spell until its
  item exists) or per creature rule family. The first cell links the item by its compendium UUID. A creature rule
  family without an item links its Bestiary journal page instead, and an Animal List family without an item cites the
  SRD section. The second cell is exactly one of Automated, Assisted or Manual. Further cells say what the system
  calculates and the manual workflow, linking to the Manual Magic page section where one exists (after Man).
- Starting data: the two inventory drafts, rewritten for players and GMs. The drafts stop being maintained when Cov
  lands; a note at their top points to the page.
- Rows for templates already shipped by the mechanic tracks (Protection, Shield, Weapon Enhance, Enhance Skill,
  Vigour) state their real treatment when Cov lands. A mechanic chunk landing after Cov flips its own row. There is no
  separate Vigour content batch: Clk2 ships the only temporary-HP spell.
- Target treatment totals after all batches: spells **15 Automated, 26 Assisted, 122 Manual** of 163 SRD spells, plus
  the Binding Spirits procedure as a Manual row (164 rows). Creature rule families **0 Automated, 17 Assisted,
  71 Manual** of 88.
- Reclassifications from the drafts, recorded on the Overview page:
  - **Fly** and **Care**: Assisted → Manual. Fly has no flying-movement target and must not overwrite walking movement;
    Care's numbers come from applying the caster's own spells normally. Both ship reminder templates.
  - **Dragon breath exhaustion** (B008), **Duck swimming** (B010), **Elemental same-element concealment** (B016):
    Assisted → Manual. They are a repeat-counted self-penalty and two test-value replacements; the vocabulary has no
    test-value override and the dialog's other-modifier field is the manual route (enter the difference).
  - **Speedart** stays Assisted, but its hit and damage bonuses apply unconditionally to the bound missile weapon until
    ended, instead of being a conditional choice. The bound weapon is only fired for the shot it buffs; the reminder
    says to end it after firing.
- Interpretations recorded on the Overview page: Hamper's movement minimum is 0 and Mindblast's INT minimum is 0
  (the SRD states no floor; values never go negative); Pain spirit applies throughout possession (the SRD example's
  reading), disabled by hand between spasms under the other reading; Gargoyle's "50% modifier" is +50; Firearrow adds
  its 1D10 fire and the GM edits the damage formula when ruling it replaces normal damage. Heal Body is an unresolved
  name in the sample religion and gets no item.

### Template authoring rules (all Sp and Ab batches)

- Templates are effect templates in the App track's sense (the "apply to recipient" role) embedded in the pack item
  source, with stable `_id`s. They use only the curated change vocabulary plus this track's extensions. Pack sources
  keep every existing item `_id`.
- **One template per alternative outcome.** Everything that applies together goes in one template: Coordination's order,
  Dodge and Athletics choice are three changes of one template. Several templates on one item are alternatives that the
  applier chooses among (below).
- **Durations** come from the spell's Duration trait: rounds or world time with the per-magnitude increase where the
  trait has one. Instant spells that leave a next-use benefit (Truth Seeker), concentration, rolled durations,
  "until used/fired" and permanent effects carry no clock; the rules text states the ending. Possession abilities carry
  no clock.
- **Rules text** opens with the source's rule summary and lists every manual remainder from the inventory row:
  restrictions, conflicts and exclusions, one-off damage or healing, resistance, endings. It names conflicting spells
  so App2's review shows them.
- **Markers**: condition spells and abilities carry the palette condition through the Conditions field (Cnd1).
  Named-spell states without a palette condition (Demoralised, Scared, Fanatic) are reminders with the source's own
  name and icon.
- **Which Manual spells get a reminder template**: those that leave a lasting state on a creature, such as a ward, a
  condition, a behaviour or a permission with a duration (the Sp6 lists). Instant, information, summoning, area,
  object-only and enchantment-creation spells get none.
- **Icons**: themed icons only. The spell's existing icon is kept unless the template needs a more specific themed
  icon.
- **Ability items** are `specialAbility` items with no test formula unless the SRD gives the ability its own test.
  Their templates apply through Use ability (App4). Ability templates have fixed values, except values entered at
  application (below).
- **Profile numbers are never effects**: natural armour, flight and swim speeds, skill values, zero or absent
  characteristics, and baseline conversions (giant height, mummification, elemental scores, skeleton mindlessness,
  magic spirit traditions) stay creature statistics. These rule families get no item; their coverage rows say to
  author the creature's profile.

### Template capability extensions

Small, general capabilities the mechanic tracks didn't need, each added by the first batch that needs it. Each extends
the existing pure modules (the App track's applied-effects module for snapshot and plan, the Fx track's
effect-contributions module for calculation) and their editors, with tests at those seams. None is a new engine.

| Extension | Behaviour | Added by | Used by |
| --- | --- | --- | --- |
| **Per-N-magnitude step** | A per-magnitude value may have a step N: contribution = value × floor(magnitude / N). Default 1. | Sp1 | Haste, Hamper |
| **Standard-skill selector** | A skill-test selector naming a standard skill by the same name slug the system already uses to find a spell's casting skill. Matches the recipient's skill with that slug. No match is a missing target with no contribution, shown on the applied effect. The editor offers the SRD basic skills as a fixed list. Works on templates and owner passives, and survives copies to other actors. | Sp2 | Sp2–Sp6, Ab1–Ab5 |
| **Alternative templates** | When a snapshot holds more than one template, the review dialog lists them with checkboxes, none preselected; Confirm needs at least one. Each chosen template creates its own applied effect; the deterministic effect id includes the template id. One-template snapshots are unchanged. | Sp2 | Fear, Madness, Mischief, Block Sense, Sun Disc |
| **Characteristic chosen at application** | A characteristic change may target "the characteristic chosen at application". The review asks for one of the seven; the applied effect records it as a fixed characteristic. It extends App6's binding requirement; characteristics never go missing. | Sp3 | Enhance (characteristic), Diminish (characteristic) |
| **Value entered at application** | A change value may be "entered at application" with a label ("New STR", "Spirit's POW") and a sign. The review asks for a whole number and shows the resolved change; Confirm needs every value. | Sp3 | Shapechange, Disease, Pain and Healing spirits |
| **Weapon dice multiplier** | A bound-weapon change "multiply normal weapon dice" (×2): only the weapon's own dice terms are multiplied; the Damage Modifier and added terms are unchanged. | Sp5 | True (Weapon) |
| **Typed damage term** | An added damage term may carry a damage type label (fire). The damage basis and card show it as a separate labelled component. | Sp5 | Fireblade, Firearrow |
| **Negative weapon damage term** | A bound-weapon damage addition may be negative (−2 per magnitude); the weapon's own dice and the Damage Modifier are kept separate. A total below zero follows the damage roll's existing handling, which the implementer confirms and documents. | Sp5 | Dull Weapon |

The standard-skill selector deliberately differs from App6's identity binding: App6 rejects name matching for a skill
the applier picked, while a standard skill is the existing slug convention for SRD skills. Both can coexist on one
template (Hinder binds; Ironmind uses the standard skill).

### Spell batches

Each batch is blocked by App1, Cov and the listed mechanic chunks, carries its manual check, and flips its coverage
rows. Treatments are targets.

**Sp1 Movement and combat order.** Blocked by [Fx2, Fx5](../v09-actor-effects/spec.md). Adds the per-N step.

| Spell | Template | Treatment |
| --- | --- | --- |
| Mobility | movement +2/mag | Automated |
| Slow | movement −2/mag, minimum 1 | Automated |
| Haste | movement +1/mag; combat order +10 per 2 mag | Automated |
| Hamper | movement −1/mag, minimum 0; combat order −10 per 2 mag | Automated |
| Rout | movement ×2; unit cap, escape direction, no defence, attacks through blockers as reminder | Assisted |

**Sp2 Skill test modifiers and alternatives.** Blocked by [Fx5](../v09-actor-effects/spec.md). Adds the standard-skill
selector and alternative templates.

| Spell | Template | Treatment |
| --- | --- | --- |
| Thunder's Voice | Influence +20 | Automated |
| Radiant Appearance | Influence +50; light-hating attackers' −20 as reminder | Assisted |
| Stink Bomb | Influence −20; rounds, Resilience, 1D4 damage, fumble as reminder | Assisted |
| Fanaticism | Close Combat +20, Unarmed Combat +20, Persistence +50; no casting, Demoralise cancels, Berserk supersedes | Assisted |
| Berserk | Close Combat +50; automatic Resilience/Fatigue, no Parry/Dodge/magic, aftermath | Assisted |
| Demoralise | combat group ×0.5; offensive spell and pre-combat rules, Fanaticism cancels | Assisted |
| Glow | combat group −5/mag and Dodge −5/mag (cast on eyes); light as reminder | Assisted |
| Fear | alternatives per lasting Fear Effects branch; Shaken: all skills −20; others reminders; fumble HP loss manual | Assisted |
| Madness | alternatives per lasting Madness Effects branch; Shaken: all skills −20; INT loss and catatonia manual | Assisted |

**Sp3 Characteristics.** Blocked by [Fx3, Fx4](../v09-actor-effects/spec.md), [App6](../v09-application/spec.md) and
Sp2 (alternative templates for Mischief). Adds characteristic-chosen and value-entered.

| Spell | Template | Treatment |
| --- | --- | --- |
| Enhance (characteristic) | chosen characteristic +1/mag | Automated |
| Diminish (characteristic) | chosen characteristic −1/mag, minimum 1 | Automated |
| Mindblast | INT −1/mag, minimum 0; CHA-days duration as reminder | Automated |
| Shapechange (Species) to (Species) | STR, DEX, CON, SIZ override, each entered at application; anatomy, abilities, magnitude example as reminder | Assisted |
| Mischief | alternatives per lasting Type of Mischief result: test penalties and half SIZ numeric, others reminders | Assisted |

**Sp4 Conditional choices and damage additions.** Blocked by [Fx6a](../v09-actor-effects/spec.md),
[App6](../v09-application/spec.md) (Hinder) and Sp2.

| Spell | Template | Treatment |
| --- | --- | --- |
| Coordination | combat order +10/mag; Dodge +10/mag; Athletics +10/mag conditional "DEX-based use" | Assisted |
| Strength | actor-wide damage +1/mag (nonmagical); Athletics +10/mag conditional "STR-based use" | Assisted |
| Ironmind | Persistence +20 conditional "against mental magic or opposed Influence" | Assisted |
| Befuddle | INT-based skills −20; no spells or offensive actions as reminder | Assisted |
| Hinder (Skill) | bound skill −10/mag conditional "next test of this skill"; end after use | Assisted |
| Truth Seeker | all skills +10/mag conditional "discovers lies, secrets or hidden objects"; excludes other spell bonuses | Assisted |
| Second Sight | Perception +20 conditional "hidden magical items, people or creatures" | Assisted |
| Resist (Element) | resistance group +10/mag conditional "against the element"; damage reduction 2/mag as reminder | Assisted |
| Sun Disc | alternatives: caster's resistance group +50 conditional "against cold"; target's Blinded (1D4 hours) | Assisted |
| Create Godform (Deity) | all skills +20 conditional "deity-taught skill"; temporary spells and knowledge as reminder | Assisted |
| Enhance Unit | actor-wide damage +1D6; limit 30, rout and mind-control immunity as reminder | Assisted |
| Shield (completion) | adds resistance group +10/mag conditional "against malign magic" to App4's AP template if App4 shipped AP only | Assisted |

**Sp5 Selected weapons.** Blocked by [Itm1](../v09-actor-effects/spec.md), [App5, App6](../v09-application/spec.md).
Adds the weapon dice multiplier, typed damage term and negative weapon damage term.

| Spell | Template | Treatment |
| --- | --- | --- |
| Dull Weapon | bound weapon damage −2/mag; wielder's DM untouched | Automated |
| Damage Boosting | bound weapon damage +1/mag; 5 ENC limit as reminder | Automated |
| True (Weapon) | bound weapon normal dice ×2 | Automated |
| Fireblade | bound weapon +1D10 fire; burning and Weapon Enhance exclusion as reminder | Assisted |
| Firearrow | bound missile weapon +1D10 fire; replacement reading, burning, exclusions as reminder | Assisted |
| Speedart | bound missile weapon hit +20, damage +3; ends after firing; Firearrow/Multimissile exclusions | Assisted |
| Pierce | bound weapon reminder: ignore magnitude AP on its hits | Manual |
| Multimissile | bound missile weapon reminder: extra attacks without DM or criticals | Manual |
| Sureshot | bound missile weapon reminder: no automatic failure, defenders −20 | Manual |

**Sp6a Conditions and behaviour.** Blocked by [Cnd1](../v09-conditions/spec.md) and Sp2 (Block Sense alternatives).
Adds Earth Scream and Venom as new pack items with generated stable ids, following the pack's existing Divine and
Sorcery item conventions.

| Spell | Template (all reminder-only) | Treatment |
| --- | --- | --- |
| Block Sense (Sense) | alternatives: Blinded; Deafened; other sense | Manual |
| Glue | Stuck; Athletics vs magnitude ×10 to break free | Manual |
| Invisibility | Invisible; observers −20 Perception, ending on attack/casting | Manual |
| Palsy | Paralysed; quarter-current-HP check | Manual |
| Slip | Prone | Manual |
| Venom (new) | Poisoned; potency mag ×5, per-round damage | Manual |
| Scare | flee; 1D6 rounds | Manual |
| Vomit | disabled; magnitude rounds; fumble damage | Manual |
| Puppet | controlled; retest when endangered | Manual |
| Dominate (Species) | dominated; telepathic commands | Manual |
| Earth Scream (new) | flee caster for duration | Manual |

**Sp6b Wards.** Blocked by [Cnd1](../v09-conditions/spec.md). Countermagic, Spirit Shield, Damage Resistance, Spell
Resistance, Spirit Resistance, Spirit Block, Absorption, Reflection: reminder templates whose name includes the
magnitude and whose rules text gives the comparison rule and what ends the ward. All Manual.

**Sp6c Senses and permissions.** Blocked by [Cnd1](../v09-conditions/spec.md). Cushion Fall, Skin of Life, Walk on
(Element), Water Breath, Breathe Water, Tongues, Mindspeech, Back Eyes, Babel, Fly, Care, Cover Blind Side, Farsight:
reminder templates. All Manual.

Every other SRD spell (instant, information, one-time damage or healing, dispel, summoning, area, object,
enchantment-creation) gets no template. Its row stays Manual with its workflow, finalized by Man.

### Creature ability pack

- New Item compendium **SRD Creature Abilities** (`oq-system-special-abilities`), registered in the manifest's pack
  list and pack folder, same ownership as the other packs. The first ability batch to land registers it.
- One folder per creature or creature group (Spirits, Nymphs), plus Giant Spider and Viper from the Animal List.
  Items are named for the ability ("Basilisk Venom", "Regeneration"), not prefixed with the creature.
- Each item's description starts with the rules summary, then a "Source" link to the Bestiary journal page by UUID.
  Giant Spider and Viper items quote the full SRD rule and cite the Animal List; the journal is not extended.
- Items carry no default-actor flag and are not added to new actors.

### Creature ability batches

Each is blocked by [App4](../v09-application/spec.md), Cov and the listed chunks, and flips its rows.

**Ab1 Venoms and poisons.** Blocked by [Fx3, Fx4](../v09-actor-effects/spec.md), [Cnd1](../v09-conditions/spec.md).

| Item | Template | Treatment |
| --- | --- | --- |
| Basilisk Venom (B003) | CON −6, Poisoned; potency 65, 1D4 HP, 6D10 minutes | Assisted |
| Gorgon Serpent Venom (B025) | CON −3, Poisoned; delay 1D3 rounds, potency 34, 1D3 HP, 6D10 minutes | Assisted |
| Manticore Poison (B027) | CON −3, Poisoned; potency 50, 1D4 HP, 5D10 minutes; ingested/sting wording | Assisted |
| Wyvern Sting Poison (B085) | CON −4, Poisoned; potency 60, 1D6 HP, 6D10 minutes; ingested/sting wording | Assisted |
| Giant Spider Venom (B086) | DEX −6, Poisoned; potency CON ×3, 1D3 HP/minute, paralysis at DEX 0 | Assisted |
| Viper Venom (B088) | CON −6, Poisoned; potency 48, 1D4 HP/minute, 6D10 minutes | Assisted |
| Ghoul Venom (B019) | Paralysed; delay 1D3 rounds, potency 22, 1D10 hours or healing restores ≥1 HP | Manual |

**Ab2 Demoralising and spirit abilities.** Blocked by [Fx5, Fx6a](../v09-actor-effects/spec.md), Sp2 (standard skill)
and Sp3 (value entered).

| Item | Template | Treatment |
| --- | --- | --- |
| Ghoul Howl (B020) | Demoralise numbers and reminders; POW-metre radius | Assisted |
| Mocking Laughter (B044) | Demoralise numbers and reminders; once per two rounds | Assisted |
| Fear Spirit Possession (B068) | Demoralise numbers; until ousted | Assisted |
| Disease Spirit Possession (B061) | Resilience −(entered spirit POW); disease until ousted | Assisted |
| Pain Spirit Possession (B070) | all skills −(entered spirit POW); ambiguity stated | Assisted |
| Healing Spirit Aid (B065) | Resilience +(entered spirit POW) conditional "next test against mundane illness" | Assisted |

**Ab3 Conditional creature modifiers.** Blocked by [Fx6a](../v09-actor-effects/spec.md), [Itm2](../v09-actor-effects/spec.md)
and Sp2. These are owner passives on the creature's own ability (switch on), not applied templates, except Slime's
which applies to the victim.

| Item | Definition | Treatment |
| --- | --- | --- |
| Plant Cover (Bloodweed, B005) | passive: Deception +25 conditional "in suitable plant cover" | Assisted |
| Statue-Like Stillness (Gargoyle, B017) | passive: Deception +50 conditional "standing still as a statue" | Assisted |
| Elemental Senses (B014, B015) | passive: Perception +50 conditional "detecting hidden characters"; see invisible as rules text | Assisted |
| Envelop (Slime, B057, B058) | template on victim: Athletics −40 conditional "escape or substitute Dodge"; enmeshed acid as reminder, Held marker | Assisted |

**Ab4 Werewolf.** Blocked by [Itm2, Fx2, Fx3](../v09-actor-effects/spec.md). Wolf Form (B081): owner passive, switch
shipped off, STR ×2, INT ×0.5 (round down), movement override 30m; AP, attacks, damage-modifier discrepancy and
anatomy as reminder; description warns to use it on a human-form profile only. Manual items: Shapeshifting (B080),
Night Vision (B082), Wolf-Form Immunity (B083, listing the damage-component rules), Mortal Vulnerabilities (B084).

**Ab5a, Ab5b Manual creature abilities.** Blocked by [Cnd1](../v09-conditions/spec.md). Every remaining non-profile
Manual rule family, grouped per creature as the inventory's "Reusable special-ability item authoring work" section
suggests, about a dozen items per batch: Ab5a covers Basilisk to Mummy (including Dragon breath, Duck swimming and
Elemental concealment, now Manual), Ab5b covers Nymphs to Zombie, Spirits and Giant Spider webbing. Reminder
templates where a target carries an ongoing state: Petrified (Gorgon, reminder), Webbed (Spider, Entangled, escape
target and web HP), Burning Body (Mummy, Burning), Holy Symbol Repulsion (Vampire, reminder), Corrosive Blood
(Basilisk, reminder on the struck weapon's wielder), Nauseating Scream (Pentaghast, reminder). Pixie's At-Will
Mischief links the Mischief spell; Unicorn's Healing Touch describes its Heal-like effect, touch and 6 MP cost.

### Manual-coverage documentation (Man)

- New **Manual Magic** page in the System Documentation journal, with sections the coverage rows link to:
  one-time damage and healing (explicit HP edits, never effects), ordered dispels (Dispel Magic and Dismiss Magic stop
  at the first unremovable effect; Neutralise Magic skips), wards, information spells, summoning and creation, areas
  and regions, enchantment creation, matrices, potions, scrolls, Divine blessed items and relics (from decision 07's
  scope table), the manual split-payment recipe (from the enchanted spec), Tap (decision 02), special reservoirs
  (decision 07), and manual creature families (spirit combat and possession, regeneration, drain and feeding,
  transformations, immunities and damage components).
- Each workflow names the existing tool: a skill test, the damage dialog, a resource or pool correction, a store
  spend, a standalone marker, a hand-made effect, ending an effect.
- Product limits are kept apart from rules, as the enchanted spec requires.
- Written against the Ench chunks that have landed. If Ench slips, store and charm references say "from 0.9.x" and are
  updated when Ench ships.
- Blocked by every Sp and Ab batch, so the coverage rows it links are final.

### SRD spell refresh (Ref)

Implements [decision 10](../effects-release/issues/10-srd-spell-refresh.md) unchanged; this spec adds only the module
shape.

- A new **pure refresh-plan module**, free of Foundry calls at import time:
  - **Plan**: from the pack spell definitions (id, overwritten fields, rules-shape fields, templates) and the
    collected candidates (owner kind and identity, item id, name, compendium source, retained fields, rules-shape
    fields, existing effects) to grouped rows. Each row has a status (refreshable, up to date, has custom effects,
    rules shape differs, duplicate, source no longer in SRD) and a default selection, plus the informational
    unlinked-same-name list.
  - **Payload**: for a selected row and its choice (refresh, Replace, Keep text only), the item update and the effect
    deletions and creations. Retained fields are read from the current item, and templates keep the pack template ids.
  - **Revalidation**: compare a previewed row with a fresh candidate and report "changed since preview".
- Thin callers: `game.oq.refreshSrdSpells()` with a GM gate, collection from world actors, the world Items directory
  and unlinked token actors on all scenes, the preview dialog (ApplicationV2, light parchment theme), per-actor writes
  and the whispered summary.
- Documentation: a section on the Magic page with the macro body, what is kept and replaced, and the manual re-add
  steps for unlinked copies.
- Blocked by Sp1 (the first content batch). May slip to 0.9.x.

### Release checklist (Rel)

- A code-free ticket, blocked by every must-ship chunk in every track.
- Fresh world: run each track's headline scenario from the release chunks decision once, in order, on a character
  and an NPC, including one spell from each content batch and one ability from each ability batch.
- Copy of a v0.8.2 world: excess HP/MP recovered into one manual pool once; owned spells unchanged after upgrade and
  pack rebuild; pre-v0.9 effects still listed and untouched; old cards readable without Apply; then a deliberate
  refresh run if Ref shipped.
- Bump the manifest version, collect release notes from every track spec's "release notes" items (replaced status
  list, Blinded and Invisible no longer change vision, out-of-palette statuses, five-second rounds, recoverable
  payment replacing underfunded casting if Ench2 shipped, the new compendium and coverage page), then cut the release
  through the existing workflow.

### Delivery and dependencies

| Chunk | Blocked by | Delivers |
| --- | --- | --- |
| Cov | — | Coverage journal and pages, pack-content test (invariants), draft retirement notes |
| Sp1 | App1, Fx2, Fx5, Cov | Per-N step, five movement/order templates |
| Sp2 | App1, Fx5, Cov | Standard-skill selector, alternative templates, nine skill-test templates |
| Sp3 | App1, App6, Fx3, Fx4, Sp2, Cov | Characteristic-chosen, value-entered, five characteristic templates |
| Sp4 | App1, App6, Fx6a, Sp2, Cov | Twelve conditional and damage-addition templates |
| Sp5 | App1, App5, App6, Itm1, Cov | Weapon dice multiplier, typed and negative terms, nine bound-weapon templates |
| Sp6a | App1, Cnd1, Sp2, Cov | Earth Scream and Venom items, eleven condition/behaviour reminders |
| Sp6b | App1, Cnd1, Cov | Eight ward reminders |
| Sp6c | App1, Cnd1, Cov | Thirteen sense/permission reminders |
| Ab1 | App4, Fx3, Fx4, Cnd1, Cov | Ability pack registration (if first), seven venom items |
| Ab2 | App4, Fx5, Fx6a, Sp2, Sp3, Cov | Six demoralising and spirit items |
| Ab3 | App4, Itm2, Fx6a, Sp2, Cov | Four conditional creature items |
| Ab4 | App4, Itm2, Fx2, Fx3, Cov | Wolf Form and four werewolf manual items |
| Ab5a, Ab5b | App4, Cnd1, Cov | Remaining manual creature items with reminders |
| Man | every Sp and Ab batch | Manual Magic page, coverage links |
| Ref | Sp1 | Refresh-plan module, `game.oq.refreshSrdSpells()`, preview, documentation |
| Rel | every must-ship chunk | End-to-end sessions, version bump, release notes, release |

Mechanic chunks live in [actor effects](../v09-actor-effects/spec.md) (Fx, Itm), [application](../v09-application/spec.md)
(App, Clk) and [conditions](../v09-conditions/spec.md) (Cnd). One PR per chunk into master. Batches may be split
further (for example Ab5 by creature), never merged across tracks. Cov is a day-one start.

## Testing Decisions

A good test exercises observable outcomes through a public seam: what the pack sources and coverage page declare,
what a pack template resolves to at a given magnitude, and what the actor's values become, rather than YAML layout or
markup. Tests run in plain Node with stubbed globals, per the repository convention. Two seams, agreed with the user:

1. **Pack-content test** (new test file, added by Cov, extended by every batch). It reads the spell and ability pack
   sources and the generated coverage journal source.
   - Invariants: every template uses only known change targets, operations, selectors and extensions; template and item
     ids are unique and unchanged across a fixed list of existing ids; icons are themed and exist; every spell item
     appears in exactly one coverage row and every ability item in at least one; each row's treatment is one of the
     three; an item whose rows include Automated or Assisted carries at least one numeric change, and an item whose rows
     are all Manual carries none (an ability item grouping several rule families takes its strongest row); ability items' journal links resolve to existing Bestiary pages; standard-skill selectors name a slug of a
     basic-skills pack skill; spell templates' per-magnitude values appear only on spells.
   - Worked examples: a table of (pack item, magnitude, choices, entered values, fixture actor) → expected values, run
     through the App track's snapshot resolution and the Fx track's effect-contributions module. Each batch adds rows
     for its acceptance examples below. Prior art: the legacy icons test (reads repository files) and the pure-function
     tests in the magic and roll test files.
2. **Refresh-plan module** (new test file, Ref): link-only matching (renamed linked spell matched; same-named unlinked
   spell only informational); retained magnitude, remaining magnitude, casting skill and name; rules-shape flagging
   without changes; custom-effect rows unchecked with Replace and Keep text only payloads; the no-template case;
   duplicates; missing source; up-to-date detection and idempotence (applying a payload then planning again yields up
   to date with no duplicated template); revalidation of a row whose item, link or effect set changed. Prior art: the
   compendium utils test (stubbed packs and items) and the migrations test.

Extensions are tested at the seams their mechanic tracks own: the per-N step, alternatives, characteristic-chosen and
value-entered in the applied-effects module test, and the standard-skill selector, weapon dice multiplier, typed and
negative terms in the effect-contributions module and roll tests. Dialogs, sheets, the refresh collection and writes,
and the release sessions are verified manually on a character and an NPC, linked and unlinked tokens, GM and owner
users, with reloads between steps. Each batch's manual check uses fresh copies of its items dragged from the pack.

### Acceptance examples

| Chunk | Setup | Action | Expected |
| --- | --- | --- | --- |
| Cov | Packs before any batch | Open the coverage journal; run the tests | 164 spell rows and 88 creature rows; Protection, Shield, Weapon Enhance, Enhance Skill, Vigour show their shipped treatment, others Manual; test passes |
| Cov | Remove one spell's row from the page source | Run the tests | Fails naming the spell |
| Sp1 | MR 15 | Apply Haste magnitude 3; Hamper magnitude 3; Slow magnitude 8 | 18 and order +10; 12 and order −10; 1 |
| Sp1 | MR 4 | Apply Hamper magnitude 6 | 0, never negative |
| Sp1 | Close Combat 50 | Haste 3, declare | Order 60; Close Combat test still 50; not Master |
| Sp2 | Actor with Persistence slug skill 40 | Apply Fanaticism | Persistence 90; Close and Unarmed Combat +20 |
| Sp2 | Hand-built NPC with a skill named "Influence" | Apply Thunder's Voice | Influence +20 |
| Sp2 | NPC without Influence | Apply Thunder's Voice | Applied effect shows missing target; no contribution |
| Sp2 | Fear card | Apply effect | Branch checkboxes, none ticked, Confirm disabled; tick Shaken → all skill tests −20 |
| Sp2 | Close Combat 65, Fanaticism active | Apply Demoralise; review | Conflict review shows Fanaticism; ending it leaves Close Combat 32 |
| Sp3 | STR 12 | Apply Enhance (characteristic) 3 choosing STR; reload | STR 15; DM recalculated; same after reload |
| Sp3 | CON 10, SIZ 10, HP 6/10 | Apply Enhance CON 4 | HP 8/12 |
| Sp3 | POW 10, MP 8/10 | Apply Enhance POW 3 | MP 8/10 |
| Sp3 | INT 2 | Apply Mindblast 4 | INT 0 |
| Sp3 | Human STR 12, SIZ 13 | Apply Shapechange entering STR 30, DEX 12, CON 20, SIZ 30 | Values overridden; DM and HP maximum recalculated; INT, POW, CHA unchanged |
| Sp4 | Athletics `@str+@dex` 50, Coordination 2 and Strength 2 applied | Open Athletics test | Two unchecked choices (+20 each); Dodge +20 automatic; damage +2 |
| Sp4 | Hinder 2 bound to Stealth | Test Stealth; test Perception | Stealth lists −20 unchecked; Perception lists nothing |
| Sp4 | Shield 2 applied | Test Persistence | +20 offered unchecked "against malign magic"; AP +2 |
| Sp5 | Sword 1D8, DM +1D4 | Apply True (Weapon) to it | Damage 2D8 +1D4; other weapon unchanged |
| Sp5 | Sword 1D8, DM +1D4 | Apply Dull Weapon 2 to it | Damage 1D8 −4 +1D4, components separate on card |
| Sp5 | Sword 1D8 | Apply Fireblade; attack and roll damage | Card shows 1D8 normal and 1D10 fire separately |
| Sp6a | Fresh pack | Find Earth Scream and Venom | Present with traits; Earth Scream Divine, Venom Sorcery |
| Sp6a | Block Sense card | Apply choosing Deafened | Deafened marker on token; Blinded not applied |
| Sp6b | Countermagic 3 card | Apply to self; view token and tracker | Reminder "Countermagic 3" visible with its rules; no values changed |
| Ab1 | HP 10/10, CON 10, SIZ 10 | Use Basilisk Venom, apply; end it | CON 4, HP maximum and current fall by the same amount; Poisoned marker; ending restores both |
| Ab1 | Ghoul Venom applied | Heal 2 HP | Paralysed remains until ended by hand |
| Ab2 | Ghoul with Ghoul Howl | Use ability; apply to two targets | No roll, no MP; each target's combat skills halved with reminders |
| Ab2 | Disease Spirit Possession | Apply entering POW 12 | Resilience −12; no clock |
| Ab3 | Gargoyle with Statue-Like Stillness | Test Deception | +50 offered unchecked; ticked → applied once |
| Ab4 | Werewolf human form STR 14, INT 13, MR 15 | Switch Wolf Form on; off | STR 28, INT 6, MR 30, DM recalculated; restored |
| Ab5 | Troll with Regeneration | View sheet | Item with rules and journal link; no effect, no values changed |
| Ref | Decision 10's manual acceptance workflow | Steps 1–6 | As decision 10 states |
| Rel | Fresh world and v0.8.2 copy | Run the sessions | Every headline passes; release cut |

Run `yarn test`, `yarn lint` and `yarn build` for each chunk; batches that change packs also run `yarn build:packs`
and, for documentation, `yarn build:docs` with the regenerated sources committed.

## Out of Scope

- Mechanics beyond the listed extensions: test-value overrides, flying movement, damage-type immunity or resistance,
  automatic next-use consumption, recurring damage, opposed rolls, area or region effects, summoning, polymorph
  automation, unit engines.
- Templates for Manual spells outside the Sp6 lists, and numeric effects for any Manual row.
- A creature actor bestiary; Bestiary journal changes, including Animal List pages.
- Enchanted-item content: no compendium of stores, charms, matrices, potions or scrolls.
- Automatic refresh at upgrade, ready, migration or pack rebuild; refreshing compendia, charms, cards or temporary
  pools; name-based identification; a text diff viewer; merging effects.
- Migrating, classifying or repairing pre-v0.9 effects or spell copies.
- Correcting SRD source ambiguities; they are recorded and left to the GM.
- Heal Body as a spell; other bestiaries and class or rank ability libraries.
- Localized content beyond English.

## Further Notes

- Glossary terms used: **effect template**, **applied effect**, **conditional effect**, **reminder**, **condition**,
  **status marker**, **passive effect**, **Modified skill**, **spell refresh**. Candidate new terms for review:
  **coverage treatment** (Automated, Assisted or Manual, as defined on the coverage page) and **standard skill** (an SRD
  basic skill a template targets by its name slug). Add them to the glossary if they stick.
- Placement decided in this spec with the user: two test seams (pack-content invariants with worked examples through
  the existing pure modules, and the refresh-plan module), and the standard-skill selector matching by the existing
  name slug rather than compendium source or per-application binding.
- Refinements of the release chunks decision recorded here: the content work is split into Cov, Sp1–Sp6c, Ab1–Ab5b,
  Man, Ref and Rel; the template extensions are added by the first batch that needs them; Sp2 comes before Sp3 because
  Mischief needs alternative templates; there is no separate Vigour batch (Clk2 covers it); the coverage page states
  shipped behaviour, so rows flip as batches land.
- The inventory drafts' counts (15/28/120 spells, 0/20/68 creature families) change to 15/26/122 and 0/17/71 through
  the five reclassifications above. Rule-family rows in the drafts stay the starting data for wording.
- Implementer checks (read `docs/foundry-v14-notes.md` first): how App1 handles several templates on one snapshot
  (the alternative-templates extension assumes one applied effect per chosen template); whether journal HTML keeps
  table structure through the docs build as the row contract needs; whether the slug lookup used for casting skills is
  available during effect preparation for unlinked token actors; how the damage roll treats totals below zero; how
  core's pack folders are expressed in pack YAML (follow the spells pack).
- The SRD basic skills put Dodge, Persistence and Resilience in the resistance group, so resistance-group conditional
  choices (Resist (Element), Sun Disc, Shield) also appear on Dodge tests. That is intended: they are unchecked and
  the person rolling judges relevance. Glow targets the combat group plus Dodge as a standard skill for that reason.
- Each batch PR lists its spells or abilities, the flipped coverage rows and the manual check performed.