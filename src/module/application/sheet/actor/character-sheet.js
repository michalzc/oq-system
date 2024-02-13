import { OQActorBaseSheet } from './actor-base-sheet.js';
import { CharacteristicsDialog } from '../../dialog/characteristics-dialog.js';
import _ from 'lodash-es';

export class OQCharacterSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/character-sheet.hbs';
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;
    html.find('.modify-characteristics').on('click', this.onModifyCharacteristics.bind(this));
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
      groupedItems: {
        spellsPerType,
        skillsTabContent,
      },
    });
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

  splitSkills(groupedSkills) {
    const makeGroup = ([groupName, elements]) => ({
      group: groupName,
      label: `OQ.SkillGroups.${groupName}`,
      skills: elements,
    });

    const skillGroups = CONFIG.OQ.ItemConfig.skillGroups;
    const leftKeys = [skillGroups.resistance, skillGroups.combat, skillGroups.knowledge, skillGroups.magic];
    const left = _.map(
      _.filter(_.toPairs(groupedSkills), ([key]) => leftKeys.includes(key)),
      makeGroup,
    );

    const customSkills = _.map(
      _.groupBy(groupedSkills.custom, (skill) => skill.system.customGroupName),
      (skills, label) => ({
        group: skillGroups.custom,
        label: label,
        customGroupName: label,
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
