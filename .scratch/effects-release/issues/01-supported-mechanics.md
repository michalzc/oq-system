# Choose effect mechanics and the spell/ability coverage boundary

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md

## Question

Which recurring mechanical families should v0.9 automate, and which exact cases should use manual assistance?
Build an explicit coverage inventory of SRD spells and the agreed bestiary corpus, using the representative evidence
in the [evaluation](../assessment.md). The user wants ready-to-use templates as well as explicit manual cases.

Decide supported actor fields/operations, skill versus test modifiers, named weapon targets, derived-value exceptions,
and how a modifier combines with other effects and situational modifiers. Avoid granting Master status through test
bonuses or treating Strength as a characteristic increase. Resolve Enhance POW's MP exception explicitly.

Choose what counts as bestiary coverage: the repository SRD journal is available, but reusable ability items need
authoring. Identify other bestiary sources only if the user wants them included. Do not assume all bestiaries exist locally.

Deliver a coverage rubric and mechanic contract, with concrete examples classified as automated, assisted, or manual.
Keep full damage adjudication and next-applicable-roll consumption outside the automation boundary already established.

## Comments

### Coverage source confirmed

The user selected the spells from all three SRD magic traditions and the creatures/spirits in this repository as the
release coverage corpus. Additional bestiary sources are not part of the ready-made v0.9 content commitment.
Mechanical families and mixed-rule handling are still under discussion; this ticket remains claimed, not resolved.

### Initial mechanic boundary confirmed

The user approved ongoing numeric effects on AP, movement, characteristics and dependencies, named-skill test
modifiers, and selected-weapon hit/damage modifiers after explicit human application. Situational relevance,
resistance, actual HP damage/healing, and next-use consumption remain human actions.

For mixed effects, automate the unambiguous numeric part and display the remaining rules. Demoralise is the agreed
example: calculate its combat-skill reduction while the GM adjudicates avoidance of combat and spell restrictions.
Detailed operation/combination semantics and characteristic exceptions remain open.

### Maximum/current coupling requested

The user rejected the proposed no-refill default: for directly changed MP maxima and directly or indirectly changed
HP maxima, an increase in maximum should increase current value by the same amount; removing the effect should
decrease current value by that amount. Clarification is still needed on the POW spell exception, negative effects,
and lower-bound/removal behavior. Preserve this as a constraint on the separate resource decision rather than
resolving that ticket here.

### Additional numeric operations confirmed

The user approved direct combat-order modifiers (Coordination), general damage additions without changing STR
(Strength), added weapon damage dice (Fireblade), and doubling only normal weapon damage dice (True Weapon).
Burning, immunity adjudication and applying actual damage remain manual.

### Test modifier semantics confirmed

The user approved preserving learned skill/Mastery under temporary effects. A skill of 95 with a temporary +10 still
rolls and does not become a Master. Select the strongest applicable flat magic modifier independently of difficulty:
skill 60, difficulty +20 and competing magic +20/-30 yields a Modified skill of 50. Equal opposing magic modifiers and
ambiguous combinations such as halving plus another spell remain GM choices rather than silently cancelling.
The glossary now explicitly distinguishes Test modifier from learned skill and includes temporary effects in Modified skill.

### POW exception and resource delta confirmed

The user confirmed that Enhance/Diminish POW preserve both MP maximum and current MP. Direct MP-max effects and
direct/CON/SIZ-derived HP-max effects increase current by the same maximum delta, and removing them reverses it.
Agreed example: HP 6/10 becomes 10/14 under a +4 maximum effect and returns to 6/10 on removal if nothing else happens.
Spending, lower bounds, negative maximum effects and special pools remain for the resource decision.

### Automatic characteristic-based skill targeting requested

The user chose automatic inference of characteristic-based skills, rather than requiring the GM to enumerate INT-based
skills for Befuddle. The exact inference contract and fallback for fixed-number/custom/indirect formulas are under
investigation. Situational use of a skill (for example STR-based versus DEX-based Athletics tests) still requires
human judgment under the previously confirmed boundary.

### Numeric operations and rounding confirmed

The user approved addition, multiplication/halving and explicit replacement with rule-specific limits. Diminish has
characteristic floor 1; Slow has movement floor 1m. Integer skills/characteristics round down unless a specific rule
says otherwise (65 halved -> 32; INT 13 halved -> 6); HP maximum retains its existing round-up calculation.
A manually chosen werewolf/form numeric package is supported; anatomy, token changes and ability changes remain manual.

### Direct-reference skill basis confirmed

The user rejected a stored/explicit fallback basis. Inspect only the skill's own formula for direct references to
defined characteristics: if it contains the characteristic reference, it qualifies; otherwise it does not. No recursive
or transitive inference, no inference from names, and no remembered/explicit basis for fixed-value formulas.
The remaining clarification is whether the literal rule automatically applies both Strength and Coordination to
Athletics (which references STR and DEX), subject to GM override, or whether those particular bonuses remain manual.

### Conditional selection confirmed

The user chose conditional effects in the test roll dialog: list only conditional effects matching the current test,
and let the person rolling check whether each applies. Formula-based matching determines eligibility, not situational
truth. Strength and Coordination's Athletics benefits use this workflow. Selecting an effect does not consume it.

## Answer

Resolved with the user through the question rounds above. This establishes the release's mechanics and coverage
boundary; it does not implement them or settle the other open decisions.

### Coverage and treatment

Cover the local SRD's three spell traditions and creatures/spirits, including the animal appendix. Other bestiaries
and class/rank ability libraries are outside the ready-made content commitment. Custom authoring remains useful.

- **Automated:** after explicit human application/parameter selection, the system calculates an unambiguous ongoing
  numeric effect. This does not imply automatic casting, resistance, damage application or expiration.
- **Assisted:** calculate the supported numeric subset, with human selection/adjudication and visible remaining rules.
  Conditional effects selected for a matching test belong here; the user chooses relevance and the system does the math.
- **Manual:** provide the rule, reminder/reference and a concrete workflow through existing rolls, resource edits or
  scene controls. An information spell or instant action need not create a persistent actor effect.

The [spell inventory](../spell-coverage-draft.md) covers 163 actual SRD spells plus the existing pack-only Binding
Spirits procedure. The [bestiary inventory](../bestiary-coverage-draft.md) covers 88 explicit rule families, including
abilities outside Special Rules headings. These inventories identify candidate templates and manual remainders;
content authoring and remaining policy-specific details still need their own review and acceptance tests.

### Numeric mechanic contract

Support actor AP, movement, characteristics and their dependencies, direct HP/MP maximum changes, named/group/all-skill
test modifiers, combat order, general damage contributions, and one selected weapon's hit/damage contributions.
Support addition, multiplication/halving and explicit replacement with rule-specific limits.

- Protection and Mobility are straightforward actor effects. Slow cannot reduce movement below 1m.
- Enhance/Diminish characteristic effects recalculate dependent skills, damage modifier and derived maxima. Diminish
  cannot reduce its characteristic below 1. Other effects retain their own stated limits rather than inheriting that
  floor universally.
- Enhance/Diminish POW specifically change neither MP maximum nor current MP.
- Direct MP-max effects and direct/CON/SIZ-derived HP-max effects increase current by the same maximum delta; removal
  reverses that delta. HP 6/10 becomes 10/14 under +4 maximum and returns to 6/10 on removal with no intervening changes.
  Apply the adjustment on a lifecycle change, never repeatedly during data preparation. Negative effects, intervening
  spending, lower bounds and temporary pools remain with the resource decision.
- Coordination directly changes combat order and Dodge test modifiers; it does not increase DEX. Strength contributes
  nonmagical damage without increasing STR. Their Athletics contributions are conditional selections.
- Weapon Enhance affects only its selected weapon's hit chance and added magical damage. Fireblade adds its fire
  dice. True Weapon doubles only normal weapon damage dice, preserving the wielder's Damage Modifier and other added
  contributions. Retain those distinctions for human adjudication without building automatic immunity resolution.
- Mixed effects such as Demoralise calculate their numeric subset and display behavioral restrictions. A chosen
  form/werewolf numeric package can change the agreed values; anatomy, token appearance and ability changes stay manual.
- Integer skill/characteristic results round down unless a particular rule says otherwise: 65 halved is 32; INT 13
  halved is 6. HP maximum retains its round-up calculation. Do not invent a universal floor or rounding rule for
  unrelated damage formulas and fractional movement.

Persistent source values, training and item ownership are not rewritten by ordinary ongoing effects. One-time HP/MP
damage/healing, permanent characteristic drain, death, summoning and item destruction remain explicit human actions.
Maximum/current coupling is the specific lifecycle resource adjustment above, not a general recurring mutation engine.

### Skills, matching and conditional use

Temporary effects preserve learned skill and Master eligibility, including when characteristics change the effective
skill calculation. Skill 95 with temporary +10 still rolls and does not become a Master. Existing Rule Options still
govern caps, difficulty and roll outcomes.

Support selected skills, existing groups such as combat skills, all skill tests, and characteristic-based selectors.
Characteristic matching inspects only direct references to defined characteristics in the skill's own base formula.
Recognize actual reference tokens, not name fragments: `@int+@pow` matches INT and POW; `70` and
`@skills.some-skill.value` do not establish either basis. Equivalent supported braced references are direct references
as well. There is no recursive/transitive inference, remembered/manual basis metadata, name inference, or symbolic
algebra. A formula directly containing a characteristic reference qualifies even if arithmetic cancels its contribution.

A conditional effect has a mechanical target and a human-readable condition. The test roll dialog lists only conditional
effects matching the current test. The person rolling checks the relevant entries; only selected entries contribute
to that roll. Matching does not automatically activate the situational bonus, and a choice is not a permanent toggle.
Unconditional effects follow the normal automatic calculation path and are not listed as optional conditional choices.

For Athletics with `@str+@dex`, both Strength and Coordination's Athletics contributions can match, but the person
rolling chooses which conditions apply. Befuddle automatically matches skills with direct INT references; it does not
classify a fixed-number skill as INT-based merely from its name. No missing skill is created by a selector.

After selecting applicable flat magic modifiers, use the strongest independently of difficulty. Skill 60, difficulty
+20 and competing selected magic +20/-30 yields Modified skill 50. Equal opposing modifiers and ambiguous combinations
such as halving plus another spell remain GM choices; do not silently cancel or invent a universal stacking policy.

Selection does not consume an effect or discover its next relevant use. Conditional next-test bonuses may use the same
matching/selection mechanism when their numeric target is supported, with manual clearing afterward. Special attack
sequences, burning, immunity, event triggers and damage adjudication remain manual. The separate reminder/application
decisions must specify quick-roll behavior and how any selected conditional contribution reaches follow-up roll cards.

### Source/content work exposed

- Add SRD Earth Scream and Venom during content work; neither currently has a spell pack item.
- Preserve the distinction between the Binding Spirits procedure and actual spell entries. Its existing item is not
  evidence of an extra SRD spell, and its stable identity must not be casually removed.
- Reusable bestiary special-ability items need authoring; the current bestiary is journal content. Animal appendix
  rules are included even though they are absent from that journal.
- Record source ambiguities (for example werewolf statistics, certain venom delivery types and Healing Spirit wording)
  and keep their unresolved interpretation human-controlled. Do not silently repair rule text or invent mechanics.

### Remaining decisions

[Define excess HP/MP and temporary magical resource behavior](02-resource-semantics.md) owns the resource edge cases
and Vigour/Tap. [Choose duration, duplicate, and conflicting-effect handling](03-lifetime-and-duplicates.md) owns
expiration and duplicate/conflict management. [Specify Apply effect on spell and ability result cards](04-chat-card-application.md)
owns recipients, permissions, snapshots and repeated application. [Separate item-local effects, passive transfer, and
applied templates](05-item-ownership-and-transfer.md) owns source/target representation and activation.
[Choose OpenQuest conditions and useful manual reminder workflows](06-conditions-and-reminders.md) owns condition
presentation and the detailed conditional-selection/quick-roll experience. [Bound magic point stores and stored-spell
casting for v0.9](07-enchanted-items.md) owns enchanted-item workflows. These tickets remain open.
