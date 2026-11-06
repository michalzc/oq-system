# 01: Dormant effect templates on spells

**What to build:** A Referee opens the Protection spell and finds an Effects section. They add an effect, give it the
"apply to recipient" role (the default for new spell definitions), a +1 AP change marked **per magnitude**, rules text,
an icon and a duration of ten minutes of world time. The section shows it as "apply to recipient", distinct from the
other roles. A character who knows Protection gains no AP from it, now or after reload: the template is dormant until a
cast is applied (tickets 02 onwards). First slice of chunk **App1**; see [the spec](../spec.md), sections "Effect
templates" and "Pure applied-effects module (the main seam)", and user stories 1–6.

The role field from the actor-effects track gains its third value, "apply to recipient": transfer off, explicitly
excluded from all live calculation and never suppressed into or out of activity. Templates reuse the curated change
vocabulary. The duration lives in the template's system data (clock: none, rounds or world time with a unit; base
amount; optional increase per magnitude), never in core duration fields, so core never tracks or expires a template.
Every template has a **template key**: the originating item's compendium source plus the template id, or the item's
identity plus the template id when it didn't come from a compendium. This slice also creates the new pure
applied-effects module (free of Foundry calls at import time) with its first operation, snapshot resolution.

**Blocked by:** [actor-effects 13 (Item-local weapon damage; item Effects section and
role)](../../v09-actor-effects/issues/13-item-local-weapon-damage.md), which adds the role field and the item Effects
section this ticket extends, and comes after actor-effects 02 (closes Fx1)

**Status:** ready-for-agent

- [ ] The role field gains "apply to recipient" (transfer off). The spell sheet has an Effects section listing
      definitions with their role; new spell definitions default to "apply to recipient".
- [ ] Templates are excluded from every live calculation of the owning actor and of the spell, enabled or not.
- [ ] Template changes offer the curated actor change vocabulary; on spell templates each change value can be marked
      per magnitude.
- [ ] The editor shows template duration fields (clock, unit, base amount, increase per magnitude) stored in system
      data; core duration fields stay empty.
- [ ] The template key is derivable for compendium-sourced and world spells; copies of the same SRD spell share it.
- [ ] Applied-effects module tests (new test file): snapshot resolution of a template at a cast magnitude (Protection
      magnitude 3 → +3 AP; fixed values unchanged; base duration plus per-magnitude increase); template key derivation.
- [ ] The Magic documentation page explains effect templates, their role, per-magnitude values and durations (edit the
      HTML source and regenerate the journal sources).
- [ ] Manual: a character with Protection (template +1 AP per magnitude) keeps its AP unchanged on the sheet, with the
      template enabled and disabled, after reload; the spell sheet labels the template "apply to recipient".
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
