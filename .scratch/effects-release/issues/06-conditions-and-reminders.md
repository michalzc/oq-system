# Choose OpenQuest conditions and useful manual reminder workflows

Labels: wayfinder:grilling
Type: grilling
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
