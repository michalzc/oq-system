# Evaluation and candidate delivery chunks for v0.9

This is a planning draft supporting [Plan v0.9 effects as reviewable, playable increments](map.md).
It evaluates the original [release outline](../../temp/effects.md); it does not replace it with a settled spec.

> **Superseded sequence.** [Finalize reviewable chunks and release acceptance criteria](issues/08-release-chunks.md)
> owns the agreed chunks, dependencies and release cut. The candidate table below is history; the
> [Definition of a reviewable chunk](#definition-of-a-reviewable-chunk) remains the agreed acceptance bar.

## Evaluation

The four original bullets are reasonable release themes, but are too broad for individual review/test units.
Active Effects combines calculation order, field semantics, actor/item editing, passive benefits, applying spells,
expiration, and compendium authoring. Enchanted items combine a resource store with several different casting rules.
Split by a visible end-to-end behavior rather than by technical layer: a preparation refactor alone provides no useful
manual acceptance test; a reversible Protection effect with sheet controls does.

The release should support straightforward recurring calculations and make remaining rules easy to adjudicate.
“Supported manually” must identify a usable workflow: show the rule, enter a modifier or update a resource, and clear
the reminder when appropriate. It must not silently apply a broader or different mechanical benefit.

Confirmed planning constraints:

- Ready-to-use spell and bestiary ability templates are part of the release, alongside a list of manual cases.
- Conditional effects appear only when matching the current test; the person rolling checks which conditions apply.
  Next-use consumption/removal remains manual.
- A successful spell/ability chat card offers **Apply effect**. The human chooses when to apply it; opposed-roll
  automation is not a prerequisite. Details remain in the application decision ticket.
- “Manageable” means a cohesive diff and a player/GM workflow that can be reviewed and exercised in one sitting.

The [resolved mechanics decision](issues/01-supported-mechanics.md) now owns the numeric operations, direct-reference
skill matching, conditional-selection and maximum/current policies. This document remains a provisional delivery
sequence. The [spell inventory](spell-coverage-draft.md) covers 163 SRD spells plus the existing Binding Spirits
procedure; the [bestiary inventory](bestiary-coverage-draft.md) covers 88 explicit rule families. Spell content work
must account for Earth Scream and Venom, which are missing from the current packs.

The [resolved resource decision](issues/02-resource-semantics.md) selects separate temporary HP/MP buffers, ordinary-only
recovery, signed maximum/current transitions and Vigour's grant cap. Tap's gains/drain/decay remain manual. The initial
proposal for a single above-max ordinary value has been superseded; the resource chunks below reflect that choice.

The [resolved lifetime and conflict decision](issues/03-lifetime-and-duplicates.md) owns core clock support,
declaration/expiry timing, reload catch-up, human duplicate/conflict choices, and the source-specific pool refinement.
The candidate resource workflows below now include that refinement; the final sequencing decision remains open.

### What the current code already provides

- [Actor preparation](../../src/module/document/actor/base-actor.js) computes HP/MP maxima, movement, and damage modifier
  before preparing items; it prepares skills before dependent weapons/spells, then applies the initial effects phase.
  [Characteristic values](../../src/module/dataModel/data-models-actor.js) are also calculated before that phase.
  Changing a characteristic/modifier late can therefore leave dependent values stale. Reordering must preserve the
  skill-before-weapon dependency and avoid applying the same effect twice.
- [Foundry v14 migration notes](../../docs/migration-issues.md) document initial/final phases and the v14 effect model.
  The installed core sources were checked: actor phases run once per cycle, item effects can target the item or
  transfer to its owner, and expiration can suppress effects. Design against that model rather than older tutorials.
- [Spell casting](../../src/module/document/item/spell.js) handles casting/resource costs and posts results. It does
  not apply a resolved spell to a target. Successful chat-card application is a new workflow.
- [Test dialogs](../../src/module/application/test-roll-dialog.js) already accept situational modifiers;
  [damage dialogs](../../src/module/application/damage-roll-dialog.js) accept an edited damage formula. These are useful
  manual fallbacks, but affected rules need to be visible where the person makes the choice.
- [Skill modifiers](../../src/module/document/item/skill.js), [weapon modifiers](../../src/module/document/item/weapon.js),
  and [roll resolution](../../src/module/utils/roll.js) distinguish unmodified skill from modifiers. Effects must not
  accidentally grant Master status or change declaration order through a situational test bonus.
- [The bestiary pack](../../src/packs/bestiary/Bestiary_MMv6Yudtc0CCb7OU.yml) is a journal. There are no special-ability
  item sources in the current packs. Reusable ability content is additional authoring work, not a consequence of
  supporting effects on the existing `specialAbility` item type.

### Rules that determine the boundaries

The references below are the repository's SRD copy. These are representative examples; the linked inventories provide
the full investigated corpus.

| Rule family | Concrete cases | Planning treatment |
| --- | --- | --- |
| Persistent attributes | Protection adds AP; Mobility increases movement; Slow has a minimum movement rate. Personal Magic, lines 782, 824, 902. | Good initial templates; define operation and limits rather than permit arbitrary derived-field edits. |
| Characteristics | Sorcery Enhance changes characteristics, but Enhance POW explicitly does not raise MP. Sorcery, line 577. Basilisk venom combines HP damage and a temporary CON penalty. Creatures, line 105. | Recalculate dependencies with explicit exceptions. An immediate HP loss is a resource update, not a repeatedly applied effect. |
| Skill/test modifiers | Enhance Skill; Coordination applies to Dodge and DEX-based Athletics; Strength applies to STR-based Athletics and damage without increasing STR. Personal Magic, lines 306, 550, 926. | Automate unconditional modifiers; offer matching conditional Athletics entries for per-test selection. Preserve Master eligibility and infer characteristic basis only from direct formula references. |
| Selected weapon | Weapon Enhance changes one weapon's hit chance and damage. True Weapon doubles normal weapon dice only. Personal Magic, line 1004; Divine Magic, line 1515. | A specific weapon target is necessary. A general actor-wide attack/damage bonus would give the wrong result. |
| Conditions and behavior | Demoralise combines numeric changes with restrictions. Ghoul paralysis can end after healing. Personal Magic, line 475; Creatures, line 643. | Combine status/reminder text with only the agreed numeric consequences; retain manual removal. |
| Next applicable use | Hinder, Truth Seeker, Healing Spirit. Personal Magic, lines 695, 949; Creatures, line 1858. | Offer supported numeric contributions as matching conditional choices. Purpose/disease relevance and clearing remain human decisions; no automatic next-use consumption. |
| Temporary resources | Vigour's separate magical HP absorb damage first and vanish with the spell. Tap permits excess MP with limits/decay. Personal Magic, line 966; Sorcery, line 1031. | Use separate temporary HP/MP buffers spent first. Healing/regeneration restore ordinary points only. Vigour uses the agreed grant cap; Tap's distribution and decay are manual. |
| Defense exceptions | Werewolf immunity distinguishes normal damage, Damage Modifier, and magical bonus damage. Creatures, line 2228. | Preserve the rules text and manual adjudication; do not promise automatic damage application/resistance. |
| Magic items | Charms use wielder skill/MP; matrices can use enchanter skill and wielder MP; point stores have their own balance/refill. Personal Magic, lines 334, 363; Sorcery, line 713. | Separate stored casting, continuous transferred effects, and MP storage. Avoid a universal enchanted-item behavior. |

Sources: [Personal Magic](../../docs/OpenQuest3-SRD/OQ3-SRD-Personal-Magic.adoc),
[Sorcery](../../docs/OpenQuest3-SRD/OQ3-SRD-Sorcery.adoc),
[Divine Magic](../../docs/OpenQuest3-SRD/OQ3-SRD-Divine-Magic.adoc),
[Creatures](../../docs/OpenQuest3-SRD/OQ3-SRD-Creatures.adoc),
[Loot](../../docs/OpenQuest3-SRD/OQ3-SRD-Loot.adoc).

Stacking follows the resolved human conflict workflow. Divine spells explicitly do not add duplicate magnitudes (Divine Magic,
lines 528–531), while Shield combines with some other defenses and excludes named spells (lines 1390–1400). Skill
tests select the strongest modifier rather than simply adding every bonus (Skills, lines 59–62 and 284). Do not
assume a single additive or highest-magnitude rule covers all effects. A human can choose which duplicate is active
without building a general conflict engine.

## Candidate delivery sequence

These are **candidate implementation chunks**, not wayfinder decision tickets and not approved build instructions.
The dependencies refer to rows in this table. Each row includes the smallest representative content needed to test
its behavior. Avoid one final PR containing all compendium effects or all documentation.

| Order / candidate chunk | Review boundary and useful behavior | Manual acceptance scenario | Depends on |
| --- | --- | --- | --- |
| A1. Temporary HP pools | A complete workflow for manual grants and source-pool corrections, aggregate display, FIFO damage allocation before ordinary HP, ordinary-only healing, consistent sheet/chat/token updates and preservation of legacy excess. Independent of effects. | HP 6/10 with pools A=4 then B=3 takes 5 damage -> ordinary 6, A=0, B=2. Heal 4 -> ordinary 10, B=2. Correct B without reordering it; a new grant goes last. Reload and token updates preserve values/order. | Resource and lifetime decisions resolved; compatibility review |
| A2. Temporary MP pools | Extend source-pool editing/display and FIFO spending to MP, including affordability/payment, ordinary-only recovery and preservation of legacy excess. | Ordinary MP 8/10 with pools A=2 then B=4 funds a 5-MP cost -> ordinary 8, A=0, B=1. Temporary MP alone can fund a spell; cancelling changes no pool. Recovery leaves temporary points unchanged; reload preserves grant order. | A1 |
| B. Actor effects with Protection | Actor effect create/edit/enable/disable/delete, visible source/rules text, and the minimal numeric pipeline for AP. Include one Protection template and a reminder with no changes. | Add Protection, check AP including worn armour, disable/re-enable it, remove it, reload. No permanent source-field changes or repeated bonuses. Open the reminder and remove it manually. | Supported-mechanics decision |
| C. Movement effects | Extend the same pipeline with movement operations and limits, using Mobility and Slow. | Enable each independently, check the displayed movement and floor, disable it, reload; verify the original movement returns. | B |
| D1. Non-resource characteristic effects | Characteristic operations through effective skills and damage modifier while preserving learned skill/Master eligibility. Start with Enhance STR and avoid hiding resource lifecycle updates inside this slice. | Change STR across a damage-modifier threshold; check effective skill and linked weapon damage, remove and reload. The effect never grants learned Master eligibility. | B |
| D2. Maximum/current effect transitions | Direct HP/MP maxima and CON/SIZ-derived HP changes adjust ordinary current by the actual signed maximum delta once. Leave temporary buffers alone; implement the POW spell exception. | HP 6/10 plus temporary 4 under +4 maximum becomes 10/14 plus temporary 4; removing it returns 6/10 plus temporary 4. Exercise edit/disable/re-enable/expiry and reload without duplicate adjustment. Test zero-floor removal and unchanged MP under Enhance/Diminish POW. | A1, A2, D1; application/lifetime decisions where relevant |
| E. A named skill modifier | Target a specific skill and preserve strongest-modifier, caps, and Master rules. Include Enhance Skill. | Start below Master threshold; apply a test bonus reaching 100%; verify it does not confer Master status. Roll the skill and a linked weapon; compare sheet/dialog/chat; toggle and reload. Test a competing penalty. | B; modifier-combination decision |
| E2. Skill matching and conditional test choices | Add group/characteristic selectors and a test-dialog list containing only matching conditional effects. The person rolling selects relevance. Include Strength/Coordination Athletics and Ironmind. | Athletics with STR+DEX lists both relevant conditional entries; Ironmind is absent from that test. Select one, verify its contribution, then roll without selecting it and verify no bonus. Unconditional effects are automatic and absent from the optional list. A fixed-value or indirect formula does not acquire a characteristic basis. | E; condition/roll-UX decision |
| F. A selected weapon enhancement | Target one weapon's hit/damage, retaining its underlying skill and actor damage modifier. Include Weapon Enhance. | Equip two weapons; enhance one; roll each and their shared skill. Only the selected weapon gains the enhancement. Remove it and confirm the original formulas return. Immunity adjudication remains manual. | E; target-reference decision |
| G. Item-authored passive effects | Item effect authoring plus transfer to its owner, state gating, and visible origin. Exercise equipment and a passive special ability. Do not activate known spell templates merely because the actor owns the spell. | Add/remove an item; change readied/worn/stored state; toggle a passive ability. Check the actor benefit appears exactly once and disappears with its source. Test an unlinked NPC token. | B; transfer/state decision |
| H. Apply a spell from its result card | Successful card **Apply effect** action, explicit recipient, cast-magnitude snapshot, agreed permissions and repeat-click behavior. Use Protection to keep the mechanic familiar. | Successfully cast at a chosen magnitude and apply to an ally. The ally receives that magnitude even after editing the caster's spell. Failure has no successful-application action. Verify rejected/cancelled application does not spend casting resources again. | B; application and duplicate decisions |
| I. Conditions and manual reminders | Agree the OpenQuest condition list and show rules on actor/token/tracker and at the relevant roll workflow. Include a next-test case and a narrative restriction. | Apply Demoralise or a reminder-only restriction; view it as GM and actor owner. Select a matching next-test modifier, roll, then clear its reminder manually. An unrelated roll does not consume it. | B; E2 for conditional numeric choices; condition/reminder decision |
| J. Core duration expiration | Configure five-second rounds, world-time and round expiry, plus active-GM catch-up of already-elapsed deadlines. Keep concentration, next-use and special cancellation manual. | One-round effect survives declaration and expires at next-round execution. Elapsed-time effect expires without waiting for a turn. Catch up an elapsed deadline on reload once, including maximum/current adjustment; reloading again changes nothing. Manually end another early; check transferred effects and unlinked tokens. | B; D2 for maximum/current integration; lifetime decision resolved; coordinate with H |
| K. Vigour grant and ending | Link an applied effect to a source-specific HP pool using the agreed grant cap. Disable suspends its remainder without pausing the clock; enable restores only that remainder/order. Ending discards only its remainder. | HP 6/10 plus Vigour 4 takes 3 damage; ending leaves ordinary 6/10. An unrelated pool survives. Disable/re-enable preserves the remainder; expiry while disabled discards it once. A fresh explicit grant goes last in FIFO. Magnitude 6 grants temporary 10; healing does not refill it. | A1; H for card application; lifetime/pool decision resolved; J for automatic clock expiry |
| L. Magic point stores | Item capacity/balance and explicit manual spend/refill. A useful ledger can ship before casting integration. | Store MP in an item, spend/refill it, enforce capacity, transfer the item to another actor and reload. Actor MP remains separately tracked. | Enchanted-item decision; independent of B |
| M. Casting paid from a store | Add explicit selection of one eligible store to existing casting, preserving failure/fumble/critical costs. Avoid automatic multi-store splitting. | Cast using a selected store; check actual outcome cost, insufficient balance, cancellation and a balance changed while the dialog is open. Check caster MP is charged only according to the chosen policy. | L; enchanted-item decision |
| N. One stored-spell kind | One concrete reusable charm workflow with its spell, casting skill and payment rule; preserve its identity when the item moves. Matrices, potions and scrolls are separate follow-ups/batches if included. | Give a charm to another actor, invoke its spell, check whose skill/MP are used, apply its effect through the card and invoke it again. Owning the charm alone must not activate the spell. | H; enchanted-item decision; M only if store-funded casting is included |
| O. Small content batches | Repeatable separate PRs, grouped by already supported mechanics and a small set of examples, rather than a single “all SRD content” chunk. Include standalone bestiary ability items linked to their journal entries. | Import fresh copies of each changed item; perform its documented cast/use/application/removal workflow. Each spell/ability is listed as automated, assisted, manual, or outside the agreed release corpus. | Relevant mechanic chunks; coverage inventory |

The order is a starting point, not a forced serial queue. The A1/A2 pool track and L are independent of actor-effect
authoring; condition reminders may
precede weapon automation. The final sequencing ticket must choose which rows combine safely and which need further
splits after the design decisions. If D1/D2 or H requires a broad rewrite, split it again with a working representative
case in every increment. K's grant and pool-lifecycle policies are settled. H still needs the application decision,
and the exact effect-to-pool representation remains subject to the ownership/compatibility work. J may need a further
split between basic core-clock behavior and resource catch-up integration; final sequencing must assess review size.

### Definition of a reviewable chunk

- One coherent user behavior; the authoring, calculation, minimal content, and UI needed for that behavior travel together.
- A short diff description and explicit manual steps with expected values. No prerequisite “infrastructure only” PR
  unless the user can independently inspect and exercise its behavior.
- Source-aware, reversible changes; disabling/removing effects restores ordinary calculated values. Resource mutations
  are explicit updates, not work repeated on every preparation.
- At least character and NPC checks where relevant; linked versus unlinked tokens for ownership/targeting changes;
  reload, duplicate activation, removal, and existing-world behavior where those risks apply.
- Update user documentation and the coverage inventory alongside the behavior. Identify manual adjudication precisely.
- Implementation runs the repository's required `yarn test`, `yarn lint`, and `yarn build` checks. Add meaningful tests
  for calculation/lifecycle/migration risks, not assertions that merely repeat UI markup.

## Route to an approved plan

Use the open decision tickets under `issues/`, following their blocking relationships. The final sequencing decision
turns the relevant candidate rows into actual implementation issues, with fixed acceptance values and content lists.
No release-wide implementation ticket should be marked ready while its supporting decisions are still open.
