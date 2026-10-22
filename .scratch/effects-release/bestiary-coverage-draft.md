# Bestiary coverage inventory

Supporting asset for [Choose effect mechanics and the spell/ability coverage boundary](issues/01-supported-mechanics.md).
The linked resolved decision owns the mechanics boundary. This inventory applies it to content; source ambiguities and
per-template details remain visible for later authoring/review. No ability behavior is implemented.

## Corpus and correspondence

Primary local source: [OQ3-SRD-Creatures.adoc](../../docs/OpenQuest3-SRD/OQ3-SRD-Creatures.adoc), lines 1–2476.
All table source references below name its headings and 1-based line numbers. The generated
[Bestiary journal](../../src/packs/bestiary/Bestiary_MMv6Yudtc0CCb7OU.yml) contains 37 pages corresponding to all 37
level-two creature headings (Nymphs nests Dryad/Hag/Naiad/Oread; Spirits nests spirit types). Spell lists and ordinary
weapon/attack damage are not duplicated here. The journal carries descriptive rules, not ready-to-use Item templates.
Searching `src/packs` found no `type: specialAbility` records.

The SRD also contains 24 Animal List entries. These are absent from the journal. Spider/Viper venom and spider webbing
are explicitly inventoried below as part of the agreed local SRD creature corpus, not a claim that they already ship in the journal.
Other bestiaries are outside the investigated local corpus.

## Coverage treatment rubric

The treatment terms match the [spell inventory](spell-coverage-draft.md):

- **Automated:** after a human decides outcome, recipient, parameters and application, an unambiguous ongoing numeric
  modifier recomputes while active. Human application/removal alone does not make a modifier Assisted.
- **Assisted:** an ongoing numeric subset combines with additional manual consequences, behavior or adjudication.
  Venom characteristic penalties plus separately applied HP damage and Demoralise numeric changes plus behavior
  belong here. An Assisted classification identifies a possible numeric payload, not implemented support.
- **Manual:** rules text, reminders and existing roll/resource/scene controls provide the workflow; no ongoing actor
  numeric modifier is assumed. This includes descriptive abilities, one-time outcomes, baseline authoring and
  numerical rules outside the supported payloads. Matching conditional test modifiers instead use Assisted.
  Manual rows can still ship useful ability templates,
  reminders and spell references; they do not necessarily need an actor effect.

Human application and ending/removal are the baseline for every category. No automatic opposed rolls, applicability
or context detection, next-applicable-use consumption, damage/healing adjudication, action restrictions, entity
creation, hidden-information disclosure, environmental triggers or recurring resource edits are assumed. Duration
handling is a separate decision; numeric rows do not promise automatic expiration. Preserve underlying learned skill
and Master semantics and use the eventual agreed modifier-combination policy.

Conditional numeric modifiers appear as matching entries in the test roll dialog; the person rolling chooses which
conditions apply. They are Assisted rather than permanently automatic or manually re-entered bonuses. Selection does
not consume an effect. Numeric-only conditional test replacements can use the same workflow without changing learned
skill or Master eligibility. Every row retains its manual remainder and source cautions.

The [resolved mechanics decision](issues/01-supported-mechanics.md) is authoritative. Individual source interpretations,
item grouping and the remaining resource/duration/application details still need their own review. A bestiary power can
reuse a spell payload while retaining different applicability, costs and lifetime. There are no unambiguously numeric-only
complete rule families below; Automated subsets occur inside Assisted abilities.

The [resolved resource decision](issues/02-resource-semantics.md) provides separate temporary HP/MP buffers spent
first, ordinary-only healing/regeneration, and manual Tap bookkeeping. This does not turn creature drain, feeding,
regeneration or exceptional healing into automatic triggers.

## Inventory by creature

### Basilisk

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B001 | Manual | Combat, 91–93 | Simultaneous gaze and bite | Gaze and bite can share an action. | GM chooses and resolves actions; no action enforcement. |
| B002 | Manual | Special Rules / Corrosive Blood, 97–103 | Corrosive blood | Reminder on struck weapon: non-magical weapon disintegrates after 1D4 rounds; blood/poison lose magic minutes outside body. | GM identifies weapon/material, rolls time, removes weapon, and judges separated substances. |
| B003 | Assisted | Basilisk Venom, 105–117 | Venom: CON −6 | Candidate characteristic −6 effect for 6D10 minutes. | GM handles exposure, potency 65 resistance, immediate 1D4 HP damage, duration roll and recovery. |
| B004 | Manual | Death Gaze, 119–125 | Death gaze | Instruction/reminder for opposed Persistence versus Resilience; target death on failure; magnitude-6 penetration, POW-metre range, no MP cost. | GM resolves opposition, susceptibility, defence penetration and death. |

### Bloodweed

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B005 | Assisted | Intro, 129–131 | Plant-cover deception | Offer +25 Deception as a conditional choice matching Deception tests. | The person rolling decides whether suitable plant cover applies; no automatic terrain detection. |
| B006 | Manual | Combat / Special Rules, 158–165 | Grapple, choke and bloodsucking MP drain | Instruction/reminder for grapple/choke and bite draining 1D6 MP in addition to damage. | GM resolves attack/grapple and applies HP/MP changes; no recurring automatic drain invented. |

### Dragon

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B007 | Manual | Combat, 328–329 | Attack alternatives | One tail, two claws, or one bite in a round. | GM chooses legal attack sequence. |
| B008 | Assisted | Special Rules / Breathe Flame, 348–359 | Breath and repeat-use exhaustion | Breath reminder plus a matching conditional Resilience penalty of −20 × the manually recorded repeat-attempt count. Cone is POW-long/wide; 4D6 fire, Dodge halves, AP applies, one free use per hour. | GM judges targets, defence/damage and hourly uses; person rolling selects the penalty only for the extra breath attempt. No automatic counter or penalty to unrelated Resilience tests. |

### Dwarf

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B009 | Manual | Special Rules, 407–411 | Earth Sense and Dark Sight | Reusable descriptive abilities: automatically know depth/structural soundness; see in darkness as day. | GM supplies information and judges darkness; no scene perception automation required. |

### Duck

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B010 | Assisted | Special Rules, 458–459 | Swimming mastery | Offer a conditional Athletics test value of 100% for swimming. | Person rolling selects swimming context; retain learned skill/Master eligibility. No unconditional Athletics override. |

### Elemental

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B011 | Manual | Intro / Elemental Scores, 506–523 | Elemental baseline derivation | Baseline: only SIZ, with HP/attack/area and other scores supplied by the elemental profile. | Author/import correct actor profile. Table attack values conflict with printed SIZ ×5 for small/large; do not silently choose a correction or reapply as effects. |
| B012 | Manual | Engulf / attack-type table, 525–543 | Engulf, elemental damage and shade fear | Reminder: area engulf with listed attack/resistance; undine drown, shade fear to MP, salamander burn, gnome crush, sylph bluster. Shade reaching zero target MP kills by shock. | GM identifies area/resistance, resolves tests and damage, and applies shock death. |
| B013 | Manual | Elemental Scores note, 530 | Disease and poison immunity | Descriptive immunity ability. | GM rejects applicable disease/poison outcomes. |
| B014 | Manual | Other Elemental Abilities, 547–549 | See invisible | Descriptive magical sensing of invisible creatures including immaterial spirits. | GM reveals/detects entities; no token vision engine required. |
| B015 | Assisted | Other Elemental Abilities, 548–549 | Hidden-character detection +50 | Offer +50 Perception as a conditional choice for detecting hidden characters. | The person rolling selects the relevant detection context; do not grant +50 to unrelated Perception tests. |
| B016 | Assisted | Other Elemental Abilities, 551–555 | Same-element concealment | Offer a conditional Deception test value of 90% beside the matching element. | The person rolling judges surroundings; this is a contextual test replacement, not additive +90 or a learned-skill replacement. |

### Gargoyle

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B017 | Assisted | Special Rules, 594–595 | Statue-Like Stillness | Offer the proposed +50 Deception statue-stillness modifier as a matching conditional choice. | Source says “50% modifier” without a plus sign; record that ambiguity. GM confirms interpretation and the person rolling chooses the relevant statue context. |

### Ghoul

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B018 | Manual | Combat, 630–631 | Extra howl | Howl once each round in addition to claw or bite. | GM chooses attacks; no action enforcement. |
| B019 | Manual | Ghoul Venom, 643–654 | Paralysing venom | Paralysis reminder after 1D3-round delay; potency 22; lasts 1D10 hours or until healing restores at least 1 HP. | GM resolves exposure/resistance, starts/ends paralysis and checks actual HP restoration; no healing trigger automation. |
| B020 | Assisted | Ghoul Howl, 656–660 | Demoralising howl | Candidate reuse of Demoralise numeric effect after explicit application; no MP/casting roll; POW-metre radius. | GM selects eligible creatures and adjudicates behaviour; resolve Demoralise rules through spell coverage. |

### Giant

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B021 | Manual | Intro, 664–666 | Height-dependent characteristics | Baseline authoring: above six metres, each extra two metres adds rolled 3D6+6 STR, 2D6+6 CON and 3D6+6 SIZ. | GM authors correct baseline. Not a blanket ongoing buff on already-sized NPCs. |

### Goblin

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B022 | Manual | Special Rules, 758 | Night Sight | Descriptive ability: night as day. | GM judges darkness; no mandatory lighting/token automation. |

### Gorgon

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B023 | Manual | Combat, 793–795 | Gaze timing plus normal attack | Gaze at beginning of round plus one talon/serpent attack. | GM follows timing and action sequence. |
| B024 | Manual | Petrifying Gaze Attack, 811–814 | Petrification | Petrified reminder after opposed target Resilience versus Gorgon Persistence. | GM determines susceptible creatures, opposition and petrification consequences. |
| B025 | Assisted | Gorgon Serpent Venom, 816–826 | Venom: CON −3 | Candidate CON −3 effect, 6D10 minutes. | GM handles 1D3-round delay, potency 34 resistance, 1D3 HP damage and duration. |

### Merpeople

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B026 | Manual | Special Rules, 976–977 | Amphibious breathing | Descriptive ability: underwater and air breathing. | GM adjudicates environment. Movement speeds are baseline, not additional effects. |

### Manticore

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B027 | Assisted | Manticore poison, 1015–1025 | Poison: CON −3 | Candidate CON −3 effect, 5D10 minutes. | GM handles exposure, 1D3-round delay, potency 50 resistance and 1D4 HP damage. Source labels ingested although combat uses sting; preserve ambiguity. |

### Mummy

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B028 | Manual | Skills, 1092–1093 | Mind-control / natural disease / poison immunity | Descriptive immunity ability. | GM rejects eligible outcomes; retain source distinction “natural” disease/poison. |
| B029 | Manual | Magic, 1107–1110 | POW-less magic / Tap fuel | Reminder: no Personal Magic; previously learned Divine Magic possible; sorcerers use Tap for MP. | GM manages eligibility and resources. Zero POW/MP is baseline; do not set it again as an active effect. |
| B030 | Manual | Special Rules, 1117–1123 | Flammable body | Burning reminder carrying initial hit damage repeated each round; one round rolling/immersion extinguishes and precludes other actions/reactions. | GM establishes ignition, records damage amount, applies recurring damage, and enforces extinguishing restrictions. |
| B031 | Manual | Special Rules, 1125–1126 | Repair instead of healing | Reminder: healing spells ineffective; Repair restores in 1D10 HP increments. | GM selects valid spell and applies actual HP restoration. |
| B032 | Manual | Special Rules, 1128–1130 | Mummification doubles STR and CON | Baseline conversion rule, already represented in published human mummy stats. | Do not attach ×2 to an imported mummy. Conversion is authored/manual; not ongoing buff stacking. |

### Nymphs, shared

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B033 | Manual | Nymphs intro, 1134–1137 | Re-form body | Reminder: destroyed body returns to magic world and reforms after 2D6 days if unmolested and home intact. | GM determines world/home conditions, elapsed time and return; no actor resurrection trigger. |

### Dryad

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B034 | Manual | Intro, 1141–1150 | Grove/tree bond and body manifestation | Reminder: restricted to 2×POW-metre grove, body dissolves on leaving; tied tree lifespan; stepping in/out forms/dissolves body. | GM judges territory, tree survival and manifestation; shared nymph reformation still applies. |
| B035 | Manual | Special Rules, 1188–1190 | Control grove plants | Descriptive plant movement/growth/fruiting; expressly cannot directly attack. | GM adjudicates fictional effects and restriction. |

### Hag

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B036 | Manual | Intro, 1194–1201 | Night-bound domain and manifestation | Reminder: leave only at night, return before dawn; sunlight destroys body; voluntary forming/dissolving allowed. | GM determines exposure, time, body destruction and shared nymph reformation. |
| B037 | Manual | Special Rules, 1239–1242 | Create shade | Reminder: one shade at a time, costs 1 MP per shade SIZ; replace after destruction. | GM creates/selects elemental actor, adjusts MP and tracks shade count. |

### Naiad

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B038 | Manual | Intro, 1249–1252 | Water-domain tether and MP recovery | Reminder: lose 1 MP per ten metres from home water; zero collapses body; regain MP only fully submerged. | GM measures relevant departure, adjusts MP, judges recovery and return. |
| B039 | Manual | Special Rules, 1292–1295 | Undine form | Reminder: one round, 1 MP per SIZ of undine; destruction returns unharmed naiad to home water. | GM selects alternative profile, applies MP/action cost and reverts form. No automatic actor transformation. |

### Oread

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B040 | Manual | Intro, 1299–1302 | Land-domain tether | Reminder: lose 1 MP per ten metres away; zero turns body to stone and returns spirit home. | GM measures distance, adjusts resources and adjudicates return. Do not copy Naiad submerged-recovery restriction. |
| B041 | Manual | Special Rules, 1342–1345 | Gnome form | Reminder: one round, 1 MP per SIZ of gnome; destruction returns unharmed oread home. | GM selects profile, applies costs and reverts form. |

### Orc

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B042 | Manual | Magic prose, 1385–1386 | Night Vision | Descriptive night/darkness-as-day ability even though outside Special Rules heading. | GM judges visibility. |

### Pentaghast

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B043 | Manual | Scream, 1421–1424 | Nauseating scream | Nausea/vomiting reminder, 50-metre hearing area, failed Resilience, 1D4 rounds; after either resistance result no longer affected. | GM determines hearing/targets, tests, duration and subsequent immunity; no trigger detection. |
| B044 | Assisted | Mocking laughter, 1425–1427 | Demoralising laughter | Candidate reuse of Demoralise numeric payload; once every two rounds, hearing required. | GM selects listeners, tracks cooldown and adjudicates behaviour. |
| B045 | Manual | Create Puppet, 1429–1435 | Create puppet | Reminder: once/day; species baseline and demon knowledge skills; controlled puppet, Perception detects disguise. | GM authors/selects puppet actor, copies relevant skills, and judges concealment. |
| B046 | Manual | The Gift of Tongues, 1437–1438 | Universal speech and mimicry | Descriptive ability, including perfect mimicry of previously heard persons. | GM determines prior hearing and fictional interaction. |
| B047 | Manual | Attributes / Damage Immunity, 1404, 1440–1441 | Damage / poison / disease immunity | Descriptive immunity to non-magical damage, poisons and disease; fur AP 2 remains separate baseline. | GM judges magic and applies damage. Attribute and prose statements are one ability, not two effects. |

### Pixie

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B048 | Manual | Magic, 1483–1484 | At-will Mischief | Reusable ability wrapper/reference to existing Mischief spell, cast at will. | GM follows Mischief outcomes; do not duplicate all ordinary pixie spell listings or invent MP/casting exemptions beyond “at will.” |

### Troll

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B049 | Manual | Combat, 1519–1520 | Club or claw | Only one of club/claw per combat round action. | GM chooses attack; ordinary rule reminder rather than active effect. |
| B050 | Manual | Special Rules, 1528–1530 | Regeneration | Reminder: heal 1D6 HP per round, excluding fire damage. | GM tracks fire damage separately and applies eligible healing; do not auto-heal all damage. |
| B051 | Manual | Special Rules, 1532–1533 | Night Vision | Descriptive night/darkness-as-day ability. | GM judges visibility. |

### Skeleton

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B052 | Manual | Special Rules, 1643–1644 | Mindless baseline | INT, POW and CHA zero; no independent intelligence, will or personality. | Author baseline; do not override actor repeatedly with an effect. |
| B053 | Manual | Skills / Special Rules, 1631, 1645–1649 | Disease / fatigue / poison / mind-control immunity | One descriptive immunity ability, including never suffering Fatigue. | GM rejects eligible outcomes; duplicate immunity prose is not extra effects. |
| B054 | Manual | Special Rules, 1647–1648 | Movement after animation | Same MR as in life but no flight/swimming. | GM authors movement baseline and adjudicates modes; not an additional MR buff. |

### Slime

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B055 | Manual | Skills / Special Rules, 1674, 1688–1692 | Slime immunities | Mind-control/poison/disease/acid immunity; only fire/magic kills; normal weapons and non-fiery Weapon Enhance do no damage; Disruption normal. | GM identifies damage source and applies exact exception; do not reduce to generic magical-weapon vulnerability. |
| B056 | Manual | Special Rules, 1694–1695 | Post-mortem acid | Reminder: acid persists CON days after death. | GM tracks corpse hazard and elapsed time. |
| B057 | Assisted | Special Rules, 1697–1702, 1708–1709 | Envelop defence / escape modifier | Offer −40 Athletics as a conditional choice for the specified defence/escape tests. | Person rolling selects the substitute-Dodge or escape context. GM resolves envelopment and no-parry restriction; do not penalise all Athletics uses. |
| B058 | Manual | Special Rules, 1704–1709 | Enmeshed acid / armour destruction | Enmeshed reminder: SIZ acid damage per round; armour only first round then dissolves unless enchanted; Dodge/Athletics escape. | GM applies repeated damage, judges armour enchantment and destroys armour after relevant round. |
| B059 | Manual | Special Rules, 1711 | Wall/ceiling movement | Descriptive climbing/clinging ability. | GM adjudicates surfaces; not generic flight. |

### Spirits, shared

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B060 | Manual | Spirits intro, 1715–1722 | Spirit combat / possession / immateriality | Reminder: Spirit Combat against living POW-bearing creatures; victory permits possession; no physical presence, STR/CON/DEX absent. | GM resolves spirit combat, possession type, eligibility and physical interaction. Do not turn absent characteristics into zero-value penalties. |

### Disease Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B061 | Assisted | Special Rules, 1755–1760 | Possession / disease / Resilience penalty | Candidate chosen −spirit POW Resilience test modifier (usually applied, not compulsory); disease persists until spirit ousted. | GM establishes covert possession, chooses whether penalty applies, resolves disease and ends effect after exorcism. |
| B062 | Manual | Special Rules, 1762–1764 | Death creates disease spirit | Reminder: on host death, POW% chance of rising as disease spirit after 2D6 hours. | GM rolls chance/time and creates actor; no death trigger. |

### Ghost

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B063 | Manual | Combat / Special Rules, 1800, 1811–1812 | Dominant possession / limited interaction | Possession reference plus reminder: only dominating/banishing spells or Spirit Combat participants affect ghost. | GM resolves possession and eligible magic/attacks; no damage immunity engine. |

### Healing Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B064 | Manual | Special Rules, 1851–1856 | Exorcise disease spirit | Reminder: only attacks covertly possessing disease spirit; driving it to zero HP expels both; cannot permanently possess. | GM resolves combat and removes spirits. Source says HP although spirit attributes list HP N/A; flag rather than silently convert to MP. |
| B065 | Assisted | Special Rules, 1858–1861 | Next disease-recovery Resilience bonus | Offer +spirit POW as a matching conditional Resilience modifier for the next test against mundane illness. | The person rolling selects disease-recovery relevance and clears the source afterward. No automatic next-applicable-roll consumption. |

### Magic Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B066 | Manual | Intro, 1865–1870 | Bound MP source / cannot initiate combat | Reminder: bound holder may spend spirit MP on spells; spirit cannot initiate Spirit Combat but may attack/defend with spells. | GM tracks whose pool pays and combat intent; not a permanent increase to holder MP maximum. |
| B067 | Manual | Magic, 1894–1899 | Single spell tradition / casting skill | Baseline: 1D6 spells from only one magic type; Divine spells regained normally; Personal/Sorcery casting POW ×5. | Author spell list and skill; no extra active effect or tradition enforcement needed. |

### Fear Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B068 | Assisted | Passion Spirits / Fear Spirit, 1913–1914 | Possession causes Demoralise | Candidate reuse of Demoralise numeric effect while possession lasts. | GM establishes/ends covert possession and adjudicates behaviour; indefinite until exorcism, not normal spell expiration. |

### Madness Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B069 | Manual | Passion Spirits / Madness Spirit, 1918–1936 | Fits / quiescence | Reminder: daily or stressful-situation opposed Persistence/Resilience; host success gives POW hours respite, failure 1D20 hours incapacitation. | GM decides stressful triggers and form of madness, resolves opposition, tracks respite and incapacitation; no action locks or trigger engine. |

### Pain Spirit

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B070 | Assisted | Passion Spirits / Pain Spirit, 1940–1953 | Possession skill-test penalty | Candidate −spirit POW to skill tests while symptoms apply; descriptive pain reminder. Numeric subset depends on resolving continuous versus conditional wording. | Prose mentions fast/concentrating/random spasms whereas example applies penalty throughout possession. Flag ambiguity; GM can manually toggle symptoms if conditional reading is chosen. Do not alter underlying base skills. |

### Unicorn

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B071 | Manual | Special Rule, 2018–2020 | Healing touch | Reusable Heal-8-like ability with touch, 6 MP cost, automatic casting success. | GM applies actual healing and cost; do not require a successful roll to expose its application instructions. |

### Vampire

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B072 | Manual | Night vision, 2075–2076 | Life-energy night vision | Descriptive ability: see dark/night by sensing life energy. | GM adjudicates visibility and what can be sensed. |
| B073 | Manual | Magic Point Drain, 2078–2086 | No natural regeneration / feeding | Attached/feeding reminder: no normal HP/MP recovery; successful bite drains 1D6 MP each round, heals chosen HP or MP one-for-one; zero victim MP unconscious, may then drain permanent POW. | GM applies each drain, chooses pool healed, handles capacity/unconsciousness and permanent POW change. Not a reversible −POW active effect. |
| B074 | Manual | Shapeshifting, 2088–2095 | Mist form | Reminder: one action, possessions transform, same SIZ/MR, physical-damage immunity, only movement actions, unaffected by strong winds, still harmed by sunlight. | GM chooses form, visual representation and movement and adjudicates all restrictions/damage. |
| B075 | Manual | Shapeshifting, 2097–2099 | Optional wolf and bat forms | Reminder: some vampires possess these alternate forms, one action to change. | GM supplies chosen profiles; no statistics specified here, so do not invent automatic transformation. |
| B076 | Manual | Shapeshifting, 2101–2104 | Death mist / permanent destruction | Reminder: turns to mist beginning next round after death; stake before then plus decapitation prevents return. | GM adjudicates timing and destruction. |
| B077 | Manual | Vampires and Sunlight, 2106–2110 | Sunlight damage | Reminder: one damage per hit location each exposed round; clothing may shield. | GM adjudicates coverage and damage. Source references hit locations unlike this system’s pooled HP; unresolved source mismatch must be explicit. |
| B078 | Manual | Holy symbols, 2112–2124 | Repelled by holy symbol | Protected/repelled reminder after opposed presenter Persistence versus vampire Resilience; GM-selected symbol modifier; 1D4 HP ignores AP/magic; vampire cannot attack presenter/protected people. | GM selects appropriate faith, modifier and protected group, resolves roll/damage and enforces restriction. |

### Zombie

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B079 | Manual | Special Rules, 2160 | Undead immunities | Descriptive fatigue/disease/poison/mind-control immunity. | GM rejects eligible outcomes; POW zero remains baseline. |

### Werewolf

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B080 | Manual | Intro / Shape-Shifting, 2164–2166, 2224–2226 | Shapeshifting trigger / timing | Reminder: one round to change; at will except compulsory full-moon wolf form; intro mentions rage. | GM decides trigger and form; no moon calendar or rage detection. |
| B081 | Assisted | Characteristics / Attributes, 2173–2187 | Wolf-form numeric package | Candidate manually activated STR ×2, INT ×0.5, wolf MR 30m (human 15m), form AP 1 as appropriate; derive other values consistently. | GM handles wolf anatomy, available attacks and selective immunity/damage rules; profile selection must avoid applying wolf multipliers to already-wolf baseline. Published INT 13→6 suggests rounding down; displayed damage modifier +1D6 conflicts with wolf attack +1D4. Decision/correction needed before exact template. |
| B082 | Manual | Night Vision, 2221–2222 | Night Vision | Descriptive night-as-day ability. | GM judges visibility. |
| B083 | Manual | Wolf-form damage rules, 2228–2237 | Selective wolf-form immunity | Reminder: only magic, fire or pure silver harms; normal Weapon Enhance contributes only magical added damage; Fireblade full weapon roll counts but attacker damage modifier does not; AP applies. | GM separates damage components and applies AP; a generic immunity/resistance flag would miss these exceptions. |
| B084 | Manual | Special Rules, 2239–2241 | Poison and asphyxiation vulnerability | Reminder: still living, can be poisoned when introduced, needs oxygen and can drown/asphyxiate. | GM adjudicates introduction and environmental consequences; not blanket poison immunity. |

### Wyvern

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B085 | Assisted | Wyvern Sting Poison, 2283–2293 | Poison: CON −4 | Candidate CON −4 effect, 6D10 minutes. | GM handles exposure, 1D2-round delay, potency 60 resistance and 1D6 HP damage. Source calls ingested despite sting delivery. |

### Animal List — Giant Spider (SRD Animal List; absent from journal)

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B086 | Assisted | Animal Poisons / Spider Venom, 2312–2323 | Spider venom: DEX −6 | Candidate DEX −6 effect, 6D10 minutes. | GM handles exposure, 1D3-round delay, potency spider CON ×3, 1D3 HP/minute, paralysis at zero DEX. No automatic threshold trigger. |
| B087 | Manual | Animal combat table, 2443–2444 | Webbing / entanglement | Entangled reminder carrying escape target from rolled attack and web HP = spider POW ×2. | GM resolves Athletics versus recorded attack, tracks separate web HP, damage and escape. Web movement speed is baseline. |

### Animal List — Viper (SRD Animal List; absent from journal)

| ID | Proposed | Source heading / lines | Ability or rule | Proposed coverage | Manual remainder / caution |
|---|---|---|---|---|---|
| B088 | Assisted | Animal Poisons / Viper venom, 2325–2336; combat 2474 | Viper venom: CON −6 | Candidate CON −6 effect, 6D10 minutes. | GM handles exposure, one-round delay, potency 48 resistance, 1D4 HP/minute and duration. |

## Checked exclusions and baseline cautions

Creature pages with no additional non-spell special rule to author here: Beastling, Centaur, Chreker, Elf, Griffin,
Hippogriff, Lizardman, Minotaur, Satyr and Sea Serpent. Listed magic remains covered by the spell inventory. Chreker,
Dragon, winged Gargoyle, Gorgon, Griffin, Hippogriff, Pixie and Wyvern flight; Merpeople/Sea Serpent swimming; natural
armour; ordinary skill percentages; absent/zero characteristics; normal attack dice; and normal movement speeds are
profile data. Avoid creating active effects that apply those numbers a second time. Where a creature lacks magic or
has fixed INT, that is an authoring/roleplaying property rather than an ongoing numerical effect.

The Animal List has Giant Ant, Bear, Big Cat, Giant Beetle, Cattle, Giant Crab, Giant Crocodile, Flightless Bird, Dog,
Elephant, Hawk, Giant Hawk, Horse, Giant Lizard, Giant Octopus, Pteranodon, Giant Python, Rhinoceros, Giant Spider,
Triceratops, Tyrannosaurus, Velociraptor, Viper and Wolf. Of these, only Giant Spider and Viper add explicitly described
persistent special rules in this source. Trunk grapple and constrict are ordinary named attacks without further
persistent mechanics specified here; resolve through normal GM adjudication. Animal movement modes/armour are baseline.

## Reusable special-ability item authoring work

No reusable specialAbility compendium records currently exist. This release therefore needs content authoring as well
as effect mechanics if “ready to use” includes bestiary powers. No items were implemented by this investigation.
A practical provisional authoring list is the inventory above: each Assisted row needs its numeric payload plus manual
instructions; Manual rows can still ship reusable descriptive abilities, reminders or spell references. Baseline-only
rows can remain authoring guidance. Shared packages can reduce duplicate records:

- Night/Dark Sight variants (retain dwarf darkness, goblin night, vampire life-sensing distinctions); Earth Sense;
  amphibious breathing; elemental invisible sensing; plant control; wall movement; tongues/mimicry.
- Manual selected-test modifier reminders for plant-cover concealment, hidden detection, statue stillness and slime
  Athletics escape; a contextual swimming mastery reminder and elemental 90% concealment reminder.
- Venom profiles for Basilisk, Ghoul, Gorgon, Manticore and Wyvern, plus Giant Spider/Viper from the Animal List. Keep
  delivery, potency, delay, immediate/recurring damage and removal condition in the card, even when only CON/DEX is
  automated.
- Demoralising howl/laughter/fear-possession wrappers reusing Demoralise; disease and pain possession modifiers;
  healing spirit’s next-test reminder; madness/quiescence; spirit combat/possession and bound MP instructions.
- Breath, gaze, petrification, scream, corrosion, burning, regeneration, slime enmeshment/acid, immunity packages,
  feeding, holy-symbol protection and webbing reminders. Preserve each creature’s actual exceptions.
- Nymph reformation/domain/form abilities, shade/puppet creation and vampire form/death abilities; wolf-form numeric
  package plus manual anatomy/damage rules; unicorn healing touch wrapper; Pixie at-will Mischief wrapper.

Do not force one Item per row: related rows can be one ability with multiple effect choices, and shared payloads can be
reused. Final record count and grouping belong to content/UX decisions. Manual does not mean content is omitted.
Stable IDs, source links, clear manual wording and a per-item manual test are needed when authoring eventually starts.

## Decisions exposed by the evidence

- The user confirmed the local SRD creature corpus, which includes the Animal List. Include spider/viper venom and
  webbing despite their absence from the journal; do not imply journal completeness covers them.
- Context-specific numeric values use matching conditional test choices, preserving learned skill/Mastery. Swimming at
  100% and elemental concealment at 90% are per-test replacements, never global base-skill overrides.
- Which form-change numeric package is worth supporting without polymorph automation? Werewolf gives numbers but
  includes rounding/damage inconsistencies; vampire wolf/bat forms provide no replacement statistics here.
- Source ambiguities needing recorded GM-facing guidance: Elemental SIZ ×5 versus table attack; Gargoyle unsigned
  “50% modifier”; Manticore/Wyvern “ingested” venom versus sting; Pain Spirit conditional prose versus continuous
  example; Healing Spirit HP wording versus spirits’ N/A HP; vampire hit-location sunlight damage; werewolf profile
  damage and rounding. These are evidence gaps, not silently corrected design decisions.

Full damage adjudication, area/line-of-sight detection, behaviour/action locking, spirit-combat resolution, automatic
possession/exorcism, environmental triggers, recurring resource edits and next-applicable-roll consumption remain
manual in these recommendations. The ongoing numeric subsets identified in Assisted rows remain automation candidates;
supported situational test modifiers use explicit matching conditional choices; consumption and context judgment remain human.

Inventory totals: **88 rule rows** across **40 creature/subtype groupings**: **0 Automated**, **20 Assisted**, **68 Manual**. These are complete-rule-family planning classifications, not implementation, numeric-payload or Item counts.
