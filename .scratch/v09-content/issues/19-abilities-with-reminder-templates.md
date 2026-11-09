# 19: Abilities that leave a state: reminder templates

**What to build:** A giant spider hits a character with its web. The Referee clicks **Use ability** on Webbed and applies
it, and the victim's token shows Entangled with the escape target and web HP in its rules. Petrified, Burning Body, Holy
Symbol Repulsion, Corrosive Blood and Nauseating Scream work the same way, so the target's state stays visible until
someone ends it. Last slice of chunks **Ab5a and Ab5b**; see [the spec](../spec.md), section "Ab5a, Ab5b Manual creature
abilities", and user stories 75, 76, 78–81, 98.

These six items are created here whole, with their rules text and templates. All of them stay Manual because the templates
are reminders. Use the palette marker where one exists.

**Blocked by:** 03 (Template invariants and worked-example harness), 17 (SRD Creature Abilities compendium and rules-text
items, Basilisk to Mummy),
[application 07 (Ability templates, Use ability and Apply on rolled abilities)](../../v09-application/issues/07-ability-templates-use-ability.md),
[conditions 04 (Icon visibility for marked effects and reminders; tracker tooltips)](../../v09-conditions/issues/04-icon-visibility-and-tracker-tooltips.md),
[conditions 05 (Markers on effect templates and applied effects)](../../v09-conditions/issues/05-markers-on-templates.md)

**Status:** ready-for-agent

- [ ] Webbed (Giant Spider) carries Entangled, with the escape target and web HP, and quotes the Animal List rule in full
      because the journal has no page for it.
- [ ] Burning Body (Mummy) carries Burning.
- [ ] Petrified (Gorgon), Holy Symbol Repulsion (Vampire), Corrosive Blood (Basilisk, on the struck weapon's wielder) and
      Nauseating Scream (Pentaghast) carry reminders.
- [ ] Each item has a Source link or SRD citation, and rolled durations are stated in the rules text with no clock.
- [ ] Use ability posts no roll and charges no MP.
- [ ] Every template carries no numeric change, and the coverage rows link their items and stay Manual.
- [ ] Worked example: one reminder ability changes no value.
- [ ] Manual: use and apply each of the six abilities on fresh copies; the marker or reminder shows on the token and
      tracker with its rules, with a reload.
- [ ] `yarn test`, `yarn lint` and `yarn build` pass.
