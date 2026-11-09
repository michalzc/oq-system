# 27: Ref: applying the refresh, revalidation and documentation

**What to build:** A GM confirms the preview. Selected copies gain the pack's description, traits, image and effect
templates while keeping learned magnitude, Divine remaining magnitude, casting skill and name, so a spent Divine spell
stays spent. Hand-made effects are replaced only if the GM picks Replace; Keep text only leaves them. A row that changed
since the preview is skipped, a failing actor doesn't stop the others, a whispered summary reports the result, and running
it again finds everything up to date. Last slice of chunk **Ref**; see [the spec](../spec.md), section "SRD spell refresh
(Ref)", [decision 10](../../effects-release/issues/10-srd-spell-refresh.md), and user stories 110–112, 114, 117, 119, 120.

The pure module gains its other two operations. **Payload** builds, for a selected row and its choice (refresh, Replace,
Keep text only), the item update and the effect deletions and creations, reading retained fields from the current item
and keeping the pack template ids. **Revalidation** compares a previewed row with a fresh candidate and reports "changed
since preview".

**Blocked by:** 26 (Ref: SRD spell refresh preview)

**Status:** ready-for-agent

- [ ] Rows with hand-made effects need an explicit Replace or Keep text only.
- [ ] Refresh replaces description, traits, image and effect templates, and keeps learned magnitude, Divine remaining
      magnitude, casting skill, name, embedded ids, sorting, folders, ownership and source links.
- [ ] Spell type, variability and MP cost are never changed.
- [ ] Rows that changed since the preview are skipped, a failing actor doesn't stop the others, and a whispered summary
      reports refreshed, skipped and failed rows.
- [ ] The refresh never casts, charges MP, applies effects or touches compendia, charms, cards or temporary pools.
- [ ] Refresh-plan module tests: retained fields; rules shape unchanged; Replace and Keep text only payloads; the
      no-template case; idempotence (a payload then a new plan gives up to date with no duplicated template); revalidation
      of a row whose item, link or effect set changed.
- [ ] The Magic documentation page has a section with the macro body, what is kept and replaced, and the manual re-add
      steps for unlinked copies.
- [ ] Manual: decision 10's acceptance workflow, steps 1–6, passes on linked and unlinked tokens with a reload.
- [ ] `yarn build:docs` output is included, and `yarn test`, `yarn lint` and `yarn build` pass.
