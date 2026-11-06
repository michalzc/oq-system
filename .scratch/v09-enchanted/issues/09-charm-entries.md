# 09: Charm entries: drop a Personal Magic spell onto an item

**What to build:** A Referee drags the SRD Protection spell onto an amulet's new **Charm** section. The amulet gains a
charm entry "Protection" with stored magnitude, rules text, traits, variable kind, casting skill reference and the
spell's effect templates, listed under the entry rather than with the amulet's own effects. They mark it single-use,
then drop Mobility and mark it reusable. Editing or deleting the original Protection spell later changes neither entry.
Dropping a Sorcery spell is refused with an explanation. Deleting an entry asks for confirmation and removes its
templates. First slice of chunk **Ench4**; see [the spec](../spec.md), sections "Data ownership" (Charm entries, Charm
entry templates) and "Charms (Ench4)" (Authoring), and user stories 76–81, 99 (template key), 104–105.

Charm entries are an ordered list in the physical item's system data. Each entry has a stable local identity, name,
rules text, traits, stored magnitude (at least one), variable or fixed kind, casting skill reference, single-use or
reusable kind, expended flag, the template key source it was copied from, and the id of the operation that expended it.
The entry's templates are item-embedded effects with App1's "apply to recipient" role, tagged with the entry's identity,
so they stay out of every live calculation, reuse App1's template editor and travel with item copies. The copy takes
the spell's current data and never runs the spell's creation adjustments (such as the Sorcery magnitude adjustment).
Before writing code, check in the v14 sources how to accept a spell document dropped onto an item sheet (read the v14
notes doc first). Authoring needs nothing from Ench2; casting comes in ticket 10.

**Blocked by:** [application 01 (Dormant effect templates on spells)](../../v09-application/issues/01-dormant-spell-templates.md)

**Status:** ready-for-agent

- [ ] Equipment, weapon and armour sheets show a Charm section to users who can edit the item; dropping a Personal
      Magic spell from a compendium, the sidebar or an actor creates an entry; other spell types and other documents
      are refused with an explanation.
- [ ] The entry copies name, rules text, traits, magnitude, variable or fixed kind, casting skill reference and effect
      templates, and keeps the source template key origin for each template.
- [ ] Name, stored magnitude (at least one), variable or fixed kind, single-use or reusable kind and templates are
      editable in place; an item can hold several entries and a store at once.
- [ ] Entry templates are listed under their entry, never with the item's item-local effects and owner passives, and
      never change the owner's values.
- [ ] Deleting an entry needs confirmation and deletes its templates.
- [ ] Dragging an item with entries to another actor copies entries, templates and expended flags; entry identities
      don't collide.
- [ ] Holding a charm item learns no spell and casts or applies nothing.
- [ ] Magic-store module tests: entry creation from Personal Magic spell data, refusal of other spell types, stored
      magnitude validation.
- [ ] Manual: create the representative amulet in the test world (Protection single-use, Mobility reusable, plus a
      store), edit and delete the source spell, drag the amulet to another actor, reload.
- [ ] The Items documentation page explains charm entries and authoring (edit the HTML source, regenerate the journal
      sources).
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
