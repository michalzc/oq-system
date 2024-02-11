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
    const groupedSkillByGroupName = this.prepareSkills(context.groupedItems.skills);
    return _.merge(context, {
      enrichedNotes,
      isCharacter: true,
      spellTypes,
      groupedItems: {
        groupedSkillByGroupName,
        spellsPerType,
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

  prepareSkills = (skills) =>
    _.sortBy(
      _.map(
        _.groupBy(skills, (skill) => `${skill.system.group}|${skill.system.groupName}`),
        (skills, key) => {
          const [group, label] = key.split('|', 2);
          return {
            group,
            label,
            skills,
          };
        },
      ),
      (elem) => elem.label,
    );

  // prepareSkills(skills) {
  //   // const skills = this.system.groupedItems.skills;
  //   const groupedSkillByGroupName = _.sortBy(
  //     _.map(
  //       _.groupBy(skills, (skill) => `${skill.system.group}|${skill.system.groupName}`),
  //       (skills, key) => {
  //         const [group, label] = key.split('|', 2);
  //         return {
  //           group,
  //           label,
  //           skills,
  //         };
  //       },
  //     ),
  //     (elem) => elem.label,
  //   );
  //
  //   return {
  //     groupedItems: {
  //       groupedSkillByGroupName,
  //     },
  //   };
  // }
}
