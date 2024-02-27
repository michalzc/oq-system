import { OQActorBaseSheet } from './actor-base-sheet.js';
import { CharacteristicsDialog } from '../../application/characteristics-dialog.js';
import _ from 'lodash-es';

export class OQCharacterSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/character-sheet.hbs';
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;
    html.find('.modify-characteristics').on('click', this.onModifyCharacteristics.bind(this));
    html.find('.consolidate-money').on('click', this.onConsolidateMoney.bind(this));
  }

  async getData(options) {
    const context = await super.getData(options);
    const enrichedNotes = await TextEditor.enrichHTML(this.actor.system.personal.notes, { async: true });
    const spellsPerType = this.getSpellsPerType();
    const spellTypes = CONFIG.OQ.ItemConfig.spellsTypes;
    const skillsTabContent = this.splitSkills(context.groupedItems.groupedSkills, context.groupedItems.abilities);
    return _.merge(context, {
      enrichedNotes,
      isCharacter: true,
      spellTypes,
      money: this.prepareMoney(),
      groupedItems: {
        spellsPerType,
        skillsTabContent,
      },
    });
  }

  prepareMoney() {
    const money = this.actor.system.personal.money ?? {};
    const fields = game.oq.moneyService?.fields ?? [];
    if (fields) {
      return _(fields)
        .map((field) => ({
          ...field,
          amount: money[field.name] ?? 0,
        }))
        .value();
    } else {
      ui.notifications.warning('Invalid money configuration!');
    }
  }

  getSpellsPerType() {
    const itemTypes = CONFIG.OQ.ItemConfig.itemTypes;
    const allSpells = this.actor.items.filter((item) => item.type === itemTypes.spell);
    return _.groupBy(allSpells, (spell) => spell.system.type);
  }

  onModifyCharacteristics() {
    const characteristicsDialog = new CharacteristicsDialog(this.actor);
    characteristicsDialog.render(true);
  }

  async onConsolidateMoney(event) {
    event.preventDefault();

    const money = this.actor.system.personal.money;
    if (money && game.oq.moneyService) {
      const consolidated = _(game.oq.moneyService.consolidate(money))
        .map((elem) => [elem.name, elem.amount])
        .fromPairs()
        .value();

      if (consolidated) {
        await this.actor.update({
          'system.personal.money': consolidated,
        });
      }
    }
  }

  splitSkills(groupedSkills) {
    const makeGroup = ([groupName, elements]) => ({
      type: groupName,
      label: `OQ.SkillTypes.${groupName}`,
      skills: elements,
      totalAdvancements: elements.map((skill) => skill.system.advancement ?? 0).reduce((l, r) => l + r),
    });

    const skillGroups = CONFIG.OQ.ItemConfig.skillTypes;
    const leftKeys = [skillGroups.resistance, skillGroups.combat, skillGroups.knowledge, skillGroups.magic];
    const left = _.map(
      _.filter(_.toPairs(groupedSkills), ([key]) => leftKeys.includes(key)),
      makeGroup,
    );

    const customSkills = _.map(
      _.groupBy(groupedSkills.custom, (skill) => skill.system.customTypeName),
      (skills, label) => ({
        type: skillGroups.custom,
        label: label,
        customTypeName: label,
        skills: skills,
      }),
    );
    const right = _.concat([makeGroup([skillGroups.practical, groupedSkills.practical])], customSkills);

    return {
      left,
      right,
    };
  }
}
