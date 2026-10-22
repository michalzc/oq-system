# OpenQuest system

Foundry VTT implementation of the OpenQuest SRD rules, with optional deviations a GM can switch on per world.

## Rules

**Skill**:
A percentile value a character tests by rolling D100 equal to or under it.

**Modified skill**:
A skill after temporary effects, difficulty and any situational modifiers are applied; the value a test is actually
rolled against. Temporary effects do not change the character's learned skill.
_Avoid_: total value, final skill

**Test modifier**:
A bonus or penalty applied when resolving a skill test without changing the character's learned skill.

**Characteristic-based skill**:
A skill whose own base formula directly references a given characteristic; one formula may qualify for several
characteristics. Fixed percentages and references through another skill do not establish that basis.

**Conditional effect**:
An effect whose relevance to a particular test is decided by the person making the roll. Matching the skill makes
the effect eligible; its numeric contribution applies only when that person chooses to use it for the test.

**Temporary points**:
HP or MP granted in addition to ordinary points and spent before them. Ordinary healing and regeneration do not
restore these points; they require an explicit temporary-point grant.

**Normal maximum**:
The capacity for ordinary HP or MP, including effects that change that capacity. Temporary points are separate and
do not increase this maximum.

**Master**:
A character whose unmodified skill is 100% or more; under the SRD their tests are automatic criticals and are not rolled.
A skill only modified up to 100%, including through temporary effects, does not make a Master.

**Critical success**:
The best result of a successful test.
_Avoid_: crit (in UI text)

**Fumble**:
The worst result of a failed test.

**Difficulty level**:
A named modifier to a skill (Easy, Simple, Normal, Difficult, Hard) chosen by the Referee for a test.

## Rules customization

**Rule Option**:
A single world-wide switch or value that changes a core rule away from (or back to) the SRD, e.g. whether skills are
capped at 100%.
_Avoid_: house rule, variant, customization, setting

**Rules Preset**:
A named bundle of Rule Option values; "OpenQuest SRD" is the default, "Custom" is any combination that matches no
named preset.
_Avoid_: ruleset, rules mode
