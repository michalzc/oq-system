# Choose OpenQuest conditions and useful manual reminder workflows

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md

## Question

Which OpenQuest statuses belong in v0.9, and what makes a reminder useful enough to count as supported at the table?

Choose the status list from local combat, spot rules, spells and creatures. Distinguish a condition, a source-specific
effect, and descriptive ability text. Determine what appears on actor sheets, token controls, combat tracker and roll
dialogs, including a reminder with no numeric changes. Avoid duplicate bonuses from both a status and its source effect.

Design a short manual workflow for Hinder/Truth Seeker and for a condition with behavioral restrictions such as
Demoralise. The human applies and clears next-use modifiers; no roll silently consumes them. Specify how the relevant
rule is visible during that workflow, including when a quick roll skips its dialog.

Decide which numeric consequences, if any, each status owns. Leave the supported-mechanics contract to the corresponding
decision; this ticket defines the user-facing condition/reminder behavior and minimal useful coverage.

## Comments

### Settled conditional-effect boundary

[Choose effect mechanics and the spell/ability coverage boundary](01-supported-mechanics.md) establishes that the test
roll dialog lists only matching conditional effects and lets the person rolling check which apply. Eligibility is
determined by mechanical selectors; relevance remains a human choice. Strength/Coordination Athletics bonuses use
this workflow. Unconditional effects are automatic; selection neither persists as an effect activation change nor
consumes the source. Next-use clearing remains manual.

Specify presentation, sensible checkbox defaults, explanation of conditions and competing modifiers, quick rolls that
skip the dialog, and consistency with casting/ability roll flows. A quick roll must not silently assume a conditional
effect applies without a selection. This is a UX/application decision, not a reason to add an event/predicate engine.

[Specify Apply effect on spell and ability result cards](04-chat-card-application.md) now fixes selected conditional
contributions and the complete original damage basis for follow-up damage from a test card. Presentation, checkbox
defaults and quick-roll handling remain here; do not recompute that historical test from later selections/current effects.

### Evidence and first question round pending

[Conditions and reminder evidence](../conditions-evidence.md) records local SRD statuses and named-source workflows,
current core defaults/vision/dead behavior, HUD deletion pitfalls and the separate generic/casting quick-roll paths.

The first round is awaiting human choices; all recommendations below remain unapproved:

- Q1: Start matching conditional checkboxes unchecked on every test, showing condition/source/numeric contribution.
  Never remember another test's selection or automatically consume the effect.
- Q2: When a quick-roll request has matching conditional choices, open its appropriate test/casting dialog. Otherwise
  retain normal quick behavior. A non-rolled use/cast has no test choices to select.
- Q3: Generic palette markers are numeric-free reminders. A source or standalone condition effect owns any supported
  numeric consequences once and can carry its marker; adding a marker cannot apply those numbers again.
- Q4: Use a focused SRD-grounded palette: Dead, Unconscious, Asleep, Prone, Surprised, Fatigued, Heavily fatigued,
  Blinded, Deafened, Paralysed, Held, Entangled, Stuck, Burning, Poisoned, Diseased, Invisible. Named spells/abilities
  remain source effects; other cases use custom reminders. No uniform mechanics are implied by shared labels.
- Q5: Keep Blinded/Invisible as reminders without automatic token vision/hiding changes. Keep Dead's existing
  defeated-combat behavior. Marking Dead remains manual, not inferred automatically from HP; other statuses do not
  prohibit actions or choose token settings automatically.
- Q6: A marker shows its active sources. Removing an independent marker does not remove source effects. A source-backed
  marker leads to source inspection/explicit ending rather than bulk-deleting independently sourced effects.
- Q7: Show active conditions/reminders on actor sheets and as token/tracker icons, with rules/source access. Roll
  dialogs separate matching numeric choices from reminder text; quick result cards retain visible reminder context.
  A no-change reminder can carry source-specific rules/notes and an optional clock, with explicit manual ending.

The status list, numeric ownership, defaults and controls are proposals, not a resolved release-plan contract.

### First question round confirmed

The user answered “Yes to all” to Q1–Q7, accepting the entire proposed palette, numeric ownership, conditional
defaults, quick-roll handling, token/combat behavior, source-aware marker controls and reminder surfaces.
The representative workflows below instantiate those choices and the prior resolved contracts; no further product
choice is needed for this ticket. No implementation or content authoring is performed in this planning map.

## Answer

Resolved with the user through Q1–Q7. This is the authoritative condition/reminder contract for v0.9. Earlier
pending/proposed comments are discussion history. The [local evidence](../conditions-evidence.md) records source
rules and current-code gaps; the glossary now distinguishes Condition, Status marker and Reminder.

### Conditions, sources and numbers

A condition is a named state; its source determines its exact rules and ending. A status marker makes that state
visible and supplies no numeric modifiers by itself. A source-specific spell/ability/condition effect owns its
supported numeric consequences once and can also supply a marker. Descriptive ability text need not create any
persistent effect when no ongoing reminder or contribution is useful.

Use this generic palette, with source-specific rules rather than universal numeric consequences:

| Marker | Reminder scope |
| --- | --- |
| Dead | Human-declared death; retains Foundry's defeated-combat behavior. Zero HP does not automatically apply it. |
| Unconscious | Source-specific loss of consciousness and waking condition, including distinct HP/MP/fatigue causes. |
| Asleep | Source-specific sleep/waking rule or duration. |
| Prone | Context-specific attack/defense modifiers; close and ranged contexts differ. |
| Surprised | Source-specific first-round restrictions, including the Perception-fumble variant. |
| Fatigued | Fatigue rules and recovery; marker alone does not change characteristics, movement or tests. |
| Heavily fatigued | Severe fatigue rules; retain ambiguity about non-percent penalties for human adjudication. |
| Blinded | Source-specific loss of sight and relevant test consequences; no automatic token vision changes. |
| Deafened | Source-specific loss of hearing; no automatic action prohibition. |
| Paralysed | Source-specific onset, duration and ending, such as ghoul healing or venom thresholds. |
| Held | Grapple/hold escape and restrictions, retaining the actual source's escape procedure. |
| Entangled | Entanglement/web escape rules, recorded target and any separate web HP where relevant. |
| Stuck | Glue or another source's immobilization/escape rule. |
| Burning | Actual source damage and extinguishing instructions; no generic recurring damage number. |
| Poisoned | Actual poison potency, delay, symptoms and recovery instructions. |
| Diseased | Actual disease progression, recovery and treatment instructions. |
| Invisible | Source-specific detection and ending conditions; no automatic token hiding or vision changes. |

Do not add every named spell to the generic palette. Demoralise, Hinder, Truth Seeker and other named sources remain
source effects with their own visible icon/name/rules. Support custom reminders for additional cases rather than
retaining the entire unrelated core palette as the release's curated condition list.

A standalone condition template may bundle a marker with supported numeric changes; its numbers belong to that
particular applied effect. Applying only the generic marker never creates that template or its modifiers. Marker
presence is not a second numeric calculation path. Two sources supplying one condition do not make the marker add
another penalty. Numeric combination remains the supported-mechanics and human-conflict contract, not this palette.

Dead remains the explicit exception to purely informational status behavior: its existing defeated-combat integration
continues to affect combat eligibility when skipDefeated is enabled. Do not infer death from HP or add automatic
status application/removal from resource thresholds. Other markers do not prohibit actions, change token settings,
resolve resistance, trigger recurring damage, or infer their own removal. Blinded/Invisible require deliberate
configuration so core special-status vision behavior does not silently exceed this reminder boundary.

### Presentation, visibility and source-aware controls

- Actor sheets list active conditions/reminders and their sources, with source rules/notes and effect controls.
  Keep inactive/disabled/expired effect records inspectable with their inactive reason, as already agreed.
- Tokens and the combat tracker show active condition/reminder icons, including indefinite effects with no numeric
  changes. Source names and rules must be reachable from the displayed reminder, not just available in a distant
  compendium. Use only this repository's themed icon paths.
- A shared condition indicates its active sources. Include eligible transferred item passives, and exclude disabled,
  suppressed and expired sources from active badges. Ending one source leaves the condition visible if another
  active source still supplies it.
- A standalone palette marker can be explicitly removed without deleting spell/ability effects. Interacting with a
  source-backed marker exposes its sources for inspection and explicit ending rather than bulk-deleting every effect
  containing the status. Owner-passive controls respect their source item and the normal permissions; no mirrored
  actor effect is required merely to display the condition.
- A reminder can have no numeric changes, contain source-specific notes/parameters and have an optional clock.
  Concentration, next-use clearing, healing-triggered removal and other contextual ending remain explicit human
  actions. Timed ending follows the already-resolved lifetime contract; no clock is invented from a generic label.
- Apply the same presentation/controls to characters, NPCs and the actual synthetic actor of an unlinked token.
  Neither source inspection nor ending may mutate a different token or the shared base actor inadvertently.

Core status aggregation can reuse the same effect that owns the source mechanics. The native HUD's current deletion
and highlighting behavior does not implement this contract: provide source-aware handling and active-source display,
not blind calls that delete all matching single-status effects. This is a control/display integration boundary,
not a second condition engine or a new containment framework.

### Conditional choices and quick rolls

List only eligible matching conditional numeric contributions in the test's optional-choice section. Each new test
starts unchecked; show the source, condition text and resolved contribution. Selecting it expresses relevance for
that test only. Never remember another test's checkbox state, turn it into permanent activation, or consume/end the
effect automatically. Unconditional numeric contributions follow the automatic calculation path, not optional checkboxes.

Keep rule reminders in a separate section rather than mixing them with numeric choices. Reminders can state relevant
restrictions or source-specific exclusions without pretending to know situational truth. Show enough source/modifier
context to let a human identify competing effects and follow their rules; retain the existing explicit modifier/edit,
effect-enable/disable and cancel/reopen routes for human adjustment. This does not create a universal conflict engine
or an automatic veto on forbidden actions.

A request to skip the dialog must open the appropriate normal test dialog when matching conditional effects exist.
This applies to skill, weapon, rolled ability and rolled casting paths, including direct quick-call entry points.
If no conditional effects match, preserve normal quick behavior and include active reminder context on the result
card. Reminder-only restrictions do not force a new automated permission/action gate. Non-rolled casts/uses have no
skill test to which these choices apply; retain their previously agreed use/cast/application workflows.

Test cards retain selected conditional contributions and the original damage basis under
[Specify Apply effect on spell and ability result cards](04-chat-card-application.md). Ending the live source after a
test does not rewrite its follow-up damage. A fresh roll has fresh unchecked choices and current effects. Cancelling
a dialog consumes nothing; completing a test also consumes nothing automatically.

### Representative manual workflows

**Hinder (Skill)**

1. Resolve the successful cast, resistance and magnitude/target allocation by the already-agreed human workflow.
   Apply to the recipient with the selected skill and its allocated −10 per magnitude, keeping the next-test rule visible.
2. A matching skill test lists Hinder unchecked with its source and penalty. A quick request opens that test dialog;
   an unrelated skill does not acquire the penalty or its checkbox. The roller chooses applicability.
3. Resolve the selected test and show its recorded contribution. The owner/GM explicitly ends Hinder after the
   applicable use; a roll, retry, cancellation or reload never consumes it. Any actual clock is source-specific.

**Truth Seeker**

1. Use the explicit cast/application workflow to retain the +10 per magnitude and next discovery-test reminder.
   Its Instant casting trait is not a reason to erase a future-use reminder immediately or invent an expiry clock.
2. The mechanically matching test lists it unchecked. The person rolling judges whether this test discovers lies,
   secrets or hidden objects and reads the exclusion of other spell-effect bonuses. Quick requests with that choice
   open the dialog as above; matching alone never decides the purpose.
3. Human adjudication resolves exclusions/competing bonuses. If an automatic source contribution must be omitted,
   use the existing explicit effect/modifier controls, cancelling/reopening as necessary; do not silently stack it.
   Select Truth Seeker, resolve the test and explicitly clear the source after the applicable use.

**Demoralise**

1. Following successful application and human conflict handling, create one applied source effect containing its
   supported combat-skill halving and its behavioral reminder. Do not create another numeric status effect.
2. Combat tests use that unconditional numeric contribution automatically. Show the prohibition on offensive spells
   and the pre-combat avoidance/run/surrender instruction where the human can read them. Humans enforce those rules;
   the system does not automatically classify offensive magic or reject actions.
3. A normal test dialog shows the reminder separately from conditional choices. A quick test without matching
   conditional choices remains quick and retains the source reminder on its card. Explicitly end/cancel effects when
   Fanaticism, another applicable rule or the source's ending requires it, using the earlier conflict policy.

A no-change example is ghoul paralysis: after human adjudication, retain its specific delay/duration and actual-healing
ending rule as a reminder with the Paralysed marker. The human starts/ends it and applies any relevant clock; ordinary
healing does not automatically detect and clear paralysis. A plain palette marker does not manufacture venom rules.

### Acceptance requirements for later implementation

| Setup/action | Expected result |
| --- | --- |
| Add a standalone Prone marker and inspect all surfaces | Visible on actor/token/tracker with rules access; no unconditional test penalty is added. Close/ranged target and attacker contexts remain human choices. |
| Apply Demoralise, then add/remove a generic marker or inspect its source icon | Combat halving occurs only from the applied source. Marker actions do not duplicate numbers or silently delete the source effect. |
| Two independently sourced paralysis effects supply Paralysed; end one through the controls | The other remains intact and the marker remains active. Explicitly ending both clears it; inactive records do not keep its active badge. |
| A passive item supplies a marker; make it ineligible or disable it | Badge follows active eligibility, including transferred effects. No stale active icon or actor-owned copy remains. |
| Add a no-change reminder with no duration, reload, and inspect the tracker | Reminder remains visible and inspectable until explicitly ended; lack of numeric changes/clock does not hide it. |
| Match a conditional +20 effect to skill 60, difficulty normal, with no other modifiers | Dialog starts unchecked at 60; selecting it gives 80. A new test starts unchecked again; neither selection nor rolling consumes the source or grants Master status. |
| Add a conditional effect matching another skill or an indirect/fixed characteristic formula | It does not appear as eligible solely by name or inferred/transitive characteristic basis. Previously resolved direct-reference matching still governs. |
| Quick-roll a matching skill, weapon, ability or casting test | Open that path's normal dialog and show unchecked matching choices. Cancelling changes neither the effect nor its consumption state. |
| Quick-roll with only unconditional numbers or reminder-only restrictions | Preserve quick behavior and show the active reminder context on the result card; no new automatic action prohibition. |
| Use a non-rolled Divine cast or non-rolled ability | No invented skill test or conditional-test checkbox. Preserve established casting cost, card and explicit application behavior. |
| Truth Seeker +20 and an incompatible automatic spell bonus are present | Show the exclusion/source context. Human omits the incompatible contribution explicitly; selecting Truth Seeker does not silently include both or invent a global precedence rule. |
| Select Hinder for its matching next test, then roll again without manually ending it | Hinder still exists and is unchecked on the second test. Explicit manual ending removes it; unrelated tests and cancellation do not consume it. |
| Finish a test, end its selected effect, and roll damage from that card | Follow-up damage retains the original full basis and recorded contribution. A new test uses current effects and new choices. |
| Apply Blinded or Invisible, then remove it | Token hiding/vision settings do not change automatically; the source rule remains visible for manual scene adjudication. |
| Mark Dead manually during combat; separately reduce another actor to zero HP | Dead participates in existing defeated/skipDefeated behavior. Zero HP alone does not automatically add Dead. |
| Set Fatigued/Heavily fatigued, Burning, Poisoned or Diseased as generic markers | No automatic characteristic, movement, damage or recovery mutation. Source-specific supported numeric templates are distinct effects; ambiguous rules remain human-controlled. |
| Two unlinked NPC tokens share a base actor; apply/end a reminder on one | Only that synthetic actor changes; its token/tracker/sheet remain consistent after reload. The other token and base actor are unchanged. |

### Consequences for the remaining map

No further condition/reminder decision ticket is needed. The final sequencing decision must size the source-aware
palette/control work, reminder visibility and all conditional/quick-roll paths as observable, reviewable increments.
Ready-made source content and manual coverage workflows must use this contract without promising generic automation
for marker labels. Keep the heavy-fatigue non-percent ambiguity and Vigour/fatigue source inconsistency visible to
humans; do not silently expand the already-approved Vigour resource behavior.

Compatibility must account for the change from inherited core statuses to a curated palette, legacy marker IDs and
special-status behavior, and source-linked status effects. This belongs in the existing compatibility decision:
retain stored data and do not silently delete effects or guess a new source's numeric intent.
