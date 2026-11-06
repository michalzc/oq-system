# 03: Conditions field in the effect editor

**What to build:** A Referee edits a hand-made "Ghoul venom" effect, picks Paralysed in its new **Conditions** field,
and the effect now shows the Paralysed marker on its row, in the condition summary and on the token. Demoralise can
carry its own marker alongside its numbers. Markers never add numbers: an effect carrying Prone with a +3 AP change,
plus a standalone Prone marker on top, still gives +3 AP, not +6. A pre-v0.9 effect with a Stunned status shows it as
"other stored statuses", preserved on save and removable one by one. Third slice of chunk **Cnd1**; see
[the spec](../spec.md), sections "Markers and standalone markers" and "Representative content", and user stories
8–12, 45.

Markers are the core `statuses` set on an effect. The editor's Conditions field is a multi-select of palette
conditions; statuses not in the palette are handled like unmanaged changes. The effect-contributions module from the
actor-effects track reads only curated changes, and marker presence is never an input to any calculation. A custom
reminder stays an ordinary actor effect with no changes; this slice adds no new reminder type. Markers on spell and
ability templates come in ticket 05.

**Blocked by:** 02 (Condition sources, removal notification and sheet condition summary),
[actor-effects 02 (Protection: AP changes and contribution tooltips)](../../v09-actor-effects/issues/02-protection-ap-changes.md),
which adds curated changes and the editor's change rows

**Status:** ready-for-agent

- [ ] The system effect editor shows a Conditions multi-select of the palette conditions in table order, with icons
      and labels, and saves the selection as the effect's statuses.
- [ ] Statuses outside the palette are listed as "other stored statuses", preserved on save and removable one by one.
- [ ] Marker presence contributes nothing to any value; two effects supplying the same condition stack nothing by
      virtue of the marker.
- [ ] Effect-contributions module tests: an effect's statuses do not change its contributions; the same changes with
      and without markers give the same result.
- [ ] The Conditions documentation page explains markers versus sources and gives recipes for the Hinder, Truth
      Seeker, Demoralise and ghoul paralysis workflows and for standalone condition effects such as Fatigued with its
      penalties. The Actors page mentions the Conditions field.
- [ ] Manual: the spec's Cnd1 row "Actor with a hand-made Ghoul venom effect carrying Paralysed" passes with the venom
      effect built in the editor. The "Demoralise ... roll Close Combat 65" row (32, not 16) passes if
      [actor-effects 07](../../v09-actor-effects/issues/07-group-selectors-multipliers-combat-order.md) has merged;
      otherwise the +3 AP effect with Prone plus a standalone Prone gives 5 AP over 2 AP armour, not 8. A Stunned
      effect from a v0.8 world keeps its status after an editor save.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
