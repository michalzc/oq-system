# Define the optional SRD spell refresh macro

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Parent: ../map.md
Blocked by: 09

## Question

What should a manually invoked macro do when adopting refreshed official SRD spell content on existing world actors,
and what does "replace" mean for identity, actor-specific casting state and user edits?

The user accepted leaving existing spells untouched on upgrade, and suggested a macro to replace SRD spells on world
actors, explicitly never automatically. Define reliable SRD-source identification, actor scope and authority, preview
and confirmation, overwritten versus retained fields, repeat execution and partial failure behavior. Decide whether
existing embedded IDs are kept through in-place refresh and how custom edits or unrecognized effects are skipped or
explicitly replaced without claiming to migrate those effects. Missing or ambiguous provenance must not silently
identify a spell by its name. Decide handling of duplicates, renamed source-linked spells, world-item intermediates,
unlinked synthetic actors and absent/changed compendium definitions.

Preserve or explicitly adjudicate learned magnitude, casting skill reference and Divine remaining magnitude: refresh
must not unexpectedly refill a spent spell, reset magnitude to pack defaults or break existing item references. The
macro must not cast, charge MP, apply recipient effects or migrate old user/module effects. Define a small complete
manual acceptance workflow and meaningful checks for the later implementation; do not implement the macro here.

## Comments

Newly surfaced while resolving compatibility. Core source provenance and current resource/spell-state observations
are captured in [Migration and compatibility evidence](../compatibility-evidence.md). Exact matching, replacement and
preview policies are not yet approved. This ticket exists to settle the proposed optional tool without widening the
compatibility answer into an unreviewed bulk replacement specification.

[Choose v0.9 migration and compatibility policy](09-migration-and-compatibility.md) now settles the manual-only adoption
boundary, excludes unsupported pre-v0.9 effect migration, and documents the confirmed source-overflow behavior.
[Finalize reviewable chunks and release acceptance criteria](08-release-chunks.md) waits for this macro decision.

Factual follow-up: normally imported official spells point to `Compendium.oq.oq-system-spells...` through
`_stats.compendiumSource`; lineage survives ordinary edits and does not mean the copy is unmodified. Older custom-drop
imports may lack provenance (`docs/migration-issues.md:95–109`), so an exact-source-only default would need a manual
fallback for some real SRD copies. Whether to offer that fallback, how to approve it, and whether edited spells are
skipped or overwritten are live choices here. Native drop/import is not selective refresh. Broad delete/recreate can
reset Sorcery magnitude or Divine remaining expenditure; exact retained fields and embedded identity must be decided.

## Answer

Resolved with the user in three question rounds; every recommendation was accepted except unlinked spells, which are
excluded entirely rather than offered as opt-in name matches. This is a contract for a later implementation slice; no
macro was implemented and no world data was touched.

### Identification

- A spell is an SRD copy only when `_stats.compendiumSource` is `Compendium.oq.oq-system-spells.Item.<id>`. Names never
  identify a spell: a renamed but linked spell is matched, and a same-named but unlinked one is not.
- Core writes `compendiumSource` only on compendium drops and never overwrites it, so a world Items-directory copy of
  an SRD spell carries the pack link into actors it is dropped on. No world-item chain resolution is needed.
- A link to an id absent from the current pack is shown as **source no longer in SRD** and never changed.
- Unlinked spells are **never refreshed**. The preview has an informational, non-selectable section
  **Not linked to the SRD pack (not refreshed)** listing only unlinked spells whose name exactly matches a pack spell,
  pointing to the documented manual re-add steps (drag the pack spell, set magnitude/remaining/skill, delete the old
  copy). Nothing is identified or written by name. Custom unlinked spells are not listed.

### Scope and authority

- Targets: world actors (character/NPC), spells in the world Items directory, and each unlinked token's synthetic actor
  (listed under scene and token name, written to its own delta). A linked token is covered by its base actor.
- Excluded: all compendia (world and module), charm entries, chat cards, applied recipient effects and temporary
  pools. A GM can import/refresh/re-export world pack content manually.
- GM-only; players get a refusal notification. Delivered as `game.oq.refreshSrdSpells()` with the macro body documented
  in the system documentation journal; no macro pack, no setting. Never invoked from hooks, migrations, `ready`, or a
  pack rebuild.
- The refresh never casts, charges MP, posts a cast, applies recipient effects, or migrates pre-v0.9 effects.

### Refresh semantics

In-place update of the embedded item; never delete/recreate. Keep `_id`/UUID, `sort`, `folder`, `ownership`, `_stats`
(including the link) and other modules' flags, so hotbar/UUID references and old card buttons still resolve.

| Field group | Behavior |
| --- | --- |
| `description`, `traits`, `img`, new v0.9 spell content fields, effect templates | Overwritten from the pack. |
| `name`, `magnitude`, `remainingMagnitude`, `skillReference` | Retained, read from the item at write time. No refill, no pack-default or Sorcery-skill magnitude reset. |
| `type`, `nonVariant`, `noMagicPoints`, `customTypeName` | Never auto-changed. A difference flags **rules shape differs** with both values; the GM fixes it on the sheet. |

Installed templates keep the pack template's `_id`, so repeated runs compare by id and never add a second copy.
Comparison uses template definition fields, not timestamps/`_stats`.

### Existing effects on a copy

Any existing effect on a copy is user/module-made (all pre-v0.9 pack spells had no effects).

- Pack spell carries templates and the copy has custom effects: row shows **has N custom effects: <names>**, unchecked
  by default. When ticked, the GM chooses per row **Replace** (delete those effects, install official templates) or
  **Keep text only** (refresh description/traits/img; effects untouched, no templates added). Never merge/append.
- Pack spell carries no templates (Manual spells): no effect choice is offered; the row refreshes text fields only and
  existing effects stay. Such a row follows ordinary default selection, since nothing is deleted.

### Preview and defaults

One GM dialog grouped by actor (plus world items and unlinked tokens). Each row shows its status and which overwritten
fields differ from the new pack definition; no full text diff in v0.9. Edits cannot be classified as user-made versus
older-pack, so no attempt is made.

| Row | Default |
| --- | --- |
| Linked, some overwritten field differs | Checked |
| Linked, nothing differs | **Up to date**, unchecked, skipped |
| Has custom effects and pack has templates | Unchecked; needs explicit Replace / Keep text only |
| Rules shape differs | Flag only; does not change selection or the shape fields |
| Duplicate (two copies of one pack spell on an actor) | Both listed, marked duplicate, refreshed independently; no merge/deletion |
| Source no longer in SRD | Listed, not selectable |
| Unlinked with exact pack name | Informational section only |

### Execution, failures and repeats

- At confirmation each selected row is re-read. It is skipped as **changed since preview** if the item is gone, its
  link changed, or its effect set differs from the previewed one. Retained values come from current data, never the
  preview snapshot.
- Writes go actor by actor: one batched item update plus effect replacement for Replace rows. A failing actor is logged
  and reported; others continue; no rollback.
- A GM-whispered chat summary lists refreshed/skipped/failed spells per actor.
- Re-running converges: refreshed rows are up to date; a row left half-written (item updated, effect step failed)
  shows its remaining difference and can be retried.
- In-place updates do not change `magnitude`/`noMagicPoints`, so existing `spellUpdateChanges` adjustment of
  `remainingMagnitude` is not triggered.

### Manual acceptance workflow

1. Set up a character with: linked Protection learned at magnitude 3 with an edited description; a linked Divine spell
   magnitude 2 spent to remaining 0; a renamed linked Sorcery spell whose `skillReference` points to a custom casting
   skill; an unlinked "Bless" from a raw JSON drop; a linked spell with a hand-made effect; two linked copies of one
   spell; a spell linked to a fabricated missing pack id. Add an SRD spell to the world Items directory and place an
   unlinked NPC token whose delta has spells.
2. Run the macro as a player: refused.
3. Run as GM: check row statuses (refreshable, up to date, rules shape differs, has custom effects, duplicate, source
   missing), Bless only in the informational section, and the agreed default selections.
4. Delete one previewed spell from another client, then confirm: that row reports changed since preview.
5. Verify: magnitude 3, Divine remaining 0, custom skill reference and renamed name kept; description/traits/img/
   templates match the pack; embedded IDs unchanged and an existing hotbar/UUID reference resolves; the hand-made effect
   is gone only where Replace was chosen; the unlinked token's delta changed and its base actor did not; no MP charged,
   no cast posted, no recipient effects, old cards and charms unchanged; whispered summary matches.
6. Run again: everything up to date or skipped; no duplicated template.

### Automation boundary

Keep planning and diffing free of Foundry I/O so they run in Mocha: a pure function from pack definitions plus
collected candidate spells to rows with statuses/default selection, and a pure function building each row's update
payload. Test link-only matching (no name-only refresh), retained `magnitude`/`remainingMagnitude`/`skillReference`/
`name`, rules-shape flagging, custom-effect default and Replace/Keep text only payloads, the no-template case,
duplicates, missing source, idempotence (applying a payload yields up to date) and stale-row revalidation. Collection
from actors/tokens/directory, the dialog, the GM gate and writes are manual acceptance only.

### Delivery consequences

The refresh slice depends on the official spell templates being authored in `src/packs/spells/` (and the effect
template schema they use); it is useful only after at least the first templated spells exist and can ship late in the
release. It adds a documentation journal page (macro body and manual re-add steps for unlinked copies) via
`docs/packs/`. Non-goals: name-based identification, compendium refresh, a text diff viewer, merging effects, and
any automatic invocation.
