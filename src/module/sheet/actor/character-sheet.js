import { OQActorBaseSheet } from './actor-base-sheet.js';
import { CharacteristicsDialog } from '../../application/characteristics-dialog.js';
import _ from 'lodash-es';

export class OQCharacterSheet extends OQActorBaseSheet {
  static DEFAULT_OPTIONS = {
    actions: {
      modifyCharacteristics: OQCharacterSheet.onModifyCharacteristics,
      consolidateMoney: OQCharacterSheet.onConsolidateMoney,
    },
  };

  static PARTS = {
    sheet: {
      template: 'systems/oq/templates/actor/character-sheet.hbs',
      scrollable: ['.sheet-content .tab.active'],
    },
  };

  static TABS = {
    primary: {
      tabs: [
        { id: 'skills', label: 'OQ.Nav.Skills' },
        { id: 'combat', label: 'OQ.Nav.Combat' },
        { id: 'equipment', label: 'OQ.Nav.Equipment' },
        { id: 'magic', label: 'OQ.Nav.Magic' },
        { id: 'notes', label: 'OQ.Nav.Notes' },
      ],
      initial: 'skills',
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const enrichedNotes = await this.enrichHTML(this.actor.system.personal.notes);
    const spellsPerType = this.getSpellsPerType();
    const spellTypes = CONFIG.OQ.ItemConfig.spellsTypes;
    const skillsTabContent = this.splitSkills(context.groupedItems.groupedSkills);
    return Object.assign(context, {
      enrichedNotes,
      isCharacter: true,
      spellTypes,
      money: this.prepareMoney(),
      groupedItems: {
        ...context.groupedItems,
        spellsPerType,
        skillsTabContent,
      },
    });
  }

  prepareMoney() {
    const money = this.actor.system.personal.money ?? {};
    const fields = game.oq.moneyService?.fields ?? [];
    return fields.map((field) => ({ ...field, amount: money[field.name] ?? 0 }));
  }

  getSpellsPerType() {
    const itemTypes = CONFIG.OQ.ItemConfig.itemTypes;
    const allSpells = this.actor.items.filter((item) => item.type === itemTypes.spell);
    return _.groupBy(allSpells, (spell) => spell.system.type);
  }

  static onModifyCharacteristics(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const characteristicsDialog = new CharacteristicsDialog(this.actor);
    characteristicsDialog.render(true);
  }

  static async onConsolidateMoney(event) {
    event.preventDefault();
    if (!this.isEditable) return;

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
      totalAdvancements: elements.map((skill) => skill.system.advancement ?? 0).reduce((l, r) => l + r, 0),
    });

    const skillGroups = CONFIG.OQ.ItemConfig.skillTypes;
    const leftKeys = [skillGroups.resistance, skillGroups.combat, skillGroups.knowledge, skillGroups.magic];
    const left = leftKeys.map((key) => [key, groupedSkills[key] ?? []]).map(makeGroup);

    const customSkills = _.map(
      _.groupBy(groupedSkills.custom, (skill) => skill.system.customTypeName),
      (skills, label) => ({
        type: skillGroups.custom,
        label: label,
        customTypeName: label,
        skills: skills,
      }),
    );
    const right = [makeGroup([skillGroups.practical, groupedSkills.practical ?? []])].concat(customSkills);

    return {
      left,
      right,
    };
  }
}
