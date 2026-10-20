# Rules customization

A user asked to run OpenQuest with a few rules that differ from the SRD (uncapped skills, criticals at 1/10 of the
skill, fumbles only on 100, ±25% difficulty steps). The GM gets a settings menu with **Rule Options** and a **Rules
Preset** combo box; the default preset is the OpenQuest SRD, so existing worlds behave exactly as before.

Terms (Rule Option, Rules Preset, Master, Modified skill) are defined in `GLOSSARY.md`.

## Rule Options

| Rule Option           | OpenQuest SRD                    | Alternative                      |
| --------------------- | -------------------------------- | -------------------------------- |
| Skill cap             | capped at 100%                   | uncapped                         |
| Critical rule         | successful doubles               | roll ≤ ceil(Modified skill / 10) |
| Fumble rule           | failed doubles, or a roll of 100 | a roll of 100 only               |
| Mastery               | on                               | off                              |
| Difficulty: Easy      | +50                              | any integer 0..100               |
| Difficulty: Simple    | +20                              | any integer 0..100               |
| Difficulty: Difficult | −20                              | any integer −100..0              |
| Difficulty: Hard      | −50                              | any integer −100..0              |

The requester's combination: uncapped, 1/10 criticals, fumble on 100 only, Mastery off, +50/+25/−25/−50.

## Decisions

- **Scope and access.** World-scoped, edited in one GM-only settings menu (`registerMenu`, `restricted: true`) that
  opens an ApplicationV2 form. Players never see it; as with every restricted Foundry menu, it is shown to users with
  the Modify Settings permission, by default the GM and Assistant GMs. Applies to every actor type and every test
  (skills, special abilities, weapons, spells).
- **Rules Preset is derived, not stored.** Only Rule Option values are saved. The combo shows "OpenQuest SRD" when every
  option equals its SRD value, otherwise "Custom". Choosing "OpenQuest SRD" resets all options to SRD values; editing
  any option makes the combo show "Custom". Further presets are just further named bundles to compare against.
- **Options are independent.** Any combination of critical rule, fumble rule, Mastery and skill cap is valid.
- **Critical at 1/10** uses the Modified skill (after difficulty and modifiers), rounded up: 5% crits on 01, 27% on
  01–03. A Modified skill of 0 or less has no critical range. When this rule is active, doubles mean nothing on
  successes.
- **Fumble on 100 only**: a failed double is a plain failure.
- **A roll of 100 always fumbles**, whatever the critical rule and however high the Modified skill, except for a
  Master while Mastery is on.
- **Mastery** (SRD "Skills at 100%"): when on, a character whose unmodified skill is ≥100% and whose Modified skill is
  still ≥100% gets an automatic critical, as today. When off, nobody is a Master; skills at or above 100% roll
  normally (automatic success, criticals by the active rule, 100 fumbles) and the sheet and chat show no Mastery mark.
- **Uncapped skills** remove only the upper clamp at 100%, everywhere it applies: skill value, modified skill, weapon
  value, rolled special-ability values and the test's Modified skill. The floor at 0 stays (a Modified skill of 0 or
  less still automatically fails and can still fumble). The excess over 100% has no further mechanical effect; the
  system does not automate opposed tests.
- **Difficulty modifiers** are four integer Rule Options; Easy and Simple are 0..100, Difficult and Hard are −100..0.
  Their mutual order is not enforced. Normal is always 0. The form edits them with Foundry's range sliders, which keep
  a typed value inside its range and round it to a whole number as it is entered (150 becomes 100), so the GM never
  meets a rejection; the save handler still rejects anything invalid with a notification and keeps the form open.
- **Applying changes requires a reload** (`requiresReload: true`). Derived values (`rollValues`, Mastery) are computed
  during data preparation; a reload is the only way to guarantee nothing stale. Rule changes are rare and between
  sessions. Chat cards already posted stay as rolled.
- **Code reads rules from a snapshot.** At `init` the saved options are resolved once into a plain
  `CONFIG.OQ.Rules` object. Pure roll/utility functions read only that object, never `game.settings`, so tests can stub
  it like `CONFIG.OQ.RollConfig`. SRD values are defined once in `consts/` and serve both as setting defaults and as
  the "OpenQuest SRD" preset.
- **User documentation**: the Rolls journal page gains a short "Rule Options" section.

## Out of scope

- Showing the critical range (e.g. "crit ≤ 5") on sheets or in roll dialogs. Possible follow-up.
- Any mechanical effect of skill values above 100% (e.g. reducing an opponent's skill in opposed tests).
- Other SRD deviations not listed above.

## Issues

1. [01 — Rules config and settings storage](issues/01-rules-config.md)
2. [02 — Critical, fumble and Mastery rules](issues/02-critical-fumble-mastery.md) — blocked by 01
3. [03 — Skill cap](issues/03-skill-cap.md) — blocked by 01
4. [04 — Difficulty modifiers](issues/04-difficulty-modifiers.md) — blocked by 01
5. [05 — Rules settings menu and preset combo](issues/05-rules-settings-menu.md) — blocked by 01
6. [06 — User documentation](issues/06-documentation.md) — blocked by 02, 03, 04, 05
