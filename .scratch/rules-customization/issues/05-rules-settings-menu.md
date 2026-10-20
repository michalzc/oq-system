# 05 — Rules settings menu and preset combo

Status: resolved

Blocked by: 01

Spec: [../spec.md](../spec.md)

A GM-only menu in the system settings that edits the Rule Options, with a Rules Preset combo box.

## Where

- `src/module/init/register-settings.js` — `game.settings.registerMenu` (`restricted: true`).
- `src/module/application/` — new ApplicationV2 form (`HandlebarsApplicationMixin`), e.g. `rules-config.js`.
- `src/public/templates/` — form template, added to `init/preload-templates.js`.
- `src/styles/` — form styles if needed (light parchment theme like other dialogs).
- `src/lang/en.yaml` — menu name, hint, labels, preset names "OpenQuest SRD" and "Custom".

## Work

- Fields: Rules Preset combo (OpenQuest SRD, Custom), Skill cap (checkbox), Critical rule (select: doubles / 1/10 of
  skill), Fumble rule (select: doubles or 100 / 100 only), Mastery (checkbox), four difficulty numbers with the ranges
  from the spec.
- The combo is derived with `isSrdRules` from 01: shows "OpenQuest SRD" when all values match, "Custom" otherwise.
  Choosing "OpenQuest SRD" fills the form with SRD values; editing any field switches the combo to "Custom" (live,
  before saving). Choosing "Custom" changes nothing.
- Submitting saves the single rules setting; Foundry's `requiresReload` prompt follows.
- Invalid numbers are rejected by the setting's field validation; surface the error as a notification without closing
  the form.

## Tests

- Unit-test any pure form-to-rules conversion (e.g. parsing form data into the rules object) in
  `test/test-rules-config.js`.

## Done

- In a running world: a player does not see the menu; the GM sees it, choosing SRD resets the fields, changing a field
  shows "Custom", saving prompts a reload and the new values take effect afterwards; reopening shows "OpenQuest SRD"
  again if the saved values equal SRD.
- `yarn test`, `yarn lint`, `yarn build` pass.

## Comments

- 2026-10-20: Implemented in 0a93a45, merged into `feature/rules-customization`; code-review fixes in a61bc6c. Unit tests, lint and `build:code` pass. Not yet verified in a running Foundry world.
