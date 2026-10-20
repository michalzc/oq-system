# OpenQuest system

Foundry VTT implementation of the OpenQuest SRD rules, with optional deviations a GM can switch on per world.

## Rules

**Skill**:
A percentile value a character tests by rolling D100 equal to or under it.

**Modified skill**:
A skill after difficulty and any situational modifiers are applied; the value a test is actually rolled against.
_Avoid_: total value, final skill

**Master**:
A character whose unmodified skill is 100% or more; under the SRD their tests are automatic criticals and are not rolled.
A skill only modified up to 100% does not make a Master.

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
