# 04: Icon visibility for marked effects and reminders; tracker tooltips

**What to build:** A Referee adds a no-change reminder "May not cast offensive spells" with no duration. After a reload
it shows on the token and in the combat tracker, and hovering over its tracker icon shows its name, source and rules
text. A Protection +3 AP effect without a duration or marker stays off the token; setting its icon visibility to
"always" makes it appear. Every tracker effect icon has its own tooltip instead of the shared names-only one. Fourth
and last slice of chunk **Cnd1**; see [the spec](../spec.md), sections "Icon visibility" and "Display surfaces" (token
and combat tracker), and user stories 19–23.

Core draws an icon when an effect's show-icon setting is "always", or "conditional" and the effect is temporary. The
system widens "conditional": an effect also shows when it carries any status or is a **reminder** (no curated changes).
The decision is a pure predicate in the condition-sources module; the effect document applies it during its own
preparation, so core's token and tracker drawing honour it without overriding temporariness or expiry. Before writing
code, check in the v14 sources that a prepared show-icon value is read by token and tracker drawing (read the v14 notes
doc first). This ticket can be worked in parallel with 03.

**Blocked by:** 02 (Condition sources, removal notification and sheet condition summary),
[actor-effects 02 (Protection: AP changes and contribution tooltips)](../../v09-actor-effects/issues/02-protection-ap-changes.md),
which defines curated changes (the reminder test)

**Status:** ready-for-agent

- [ ] Effects with any status, and reminders, show on the token and tracker under the default setting even without a
      duration. Numeric effects without a duration or marker stay off.
- [ ] The effect editor exposes the show-icon setting with the labels: always; when temporary, marked or a reminder
      (the default); never.
- [ ] Disabled and suppressed effects show no icon regardless of the setting.
- [ ] OpenQuest's combat tracker gives each effect icon its own tooltip with name, source name, markers and rules text,
      using the module's summary data. Dead still shows as defeated, not as an icon. Existing refresh hooks keep the
      tracker current.
- [ ] Condition-sources module tests: icon visibility for each show-icon setting against temporary, marked, reminder
      and plain numeric effects, and for inactive effects.
- [ ] The Actors documentation page explains icon visibility; the Combat page explains the tracker tooltips and Dead
      as defeated.
- [ ] Manual: the spec's Cnd1 rows "Any actor: add a no-change reminder without duration; reload; view tracker" and
      "Actor with Protection +3 AP, no duration" pass, on linked and unlinked tokens.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
