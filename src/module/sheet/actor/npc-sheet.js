import { OQActorBaseSheet } from './actor-base-sheet.js';
import { logObject } from '../../utils.js';
import _ from 'lodash-es';

export class OQNpcSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/npc-sheet.hbs';
  }

  async getData(options) {
    const context = await super.getData(options);
    const personal = this.actor.system.personal;
    const enrichedDescription = await TextEditor.enrichHTML(personal.description, { async: true });
    const enrichedShortDescription = await TextEditor.enrichHTML(personal.shortDescription, { async: true });
    const groupedItems = this.groupItems();
    return logObject(
      'SheetContext',
      _.merge(context, {
        enrichedDescription,
        enrichedShortDescription,
        groupedItems,
      }),
    );
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.roll-characteristics').on('click', this.onRollCharacteristics.bind(this));
  }

  static otherSkillsGroups = ['knowledge', 'practical', 'custom'];
  static combatItems = ['weapon', 'armour'];

  groupItems() {
    const groupedItems = _.groupBy([...this.actor.items], (item) => item.type);
    const skills = groupedItems.skill ?? [];
    const groupedSkills = _.groupBy(skills, (skill) => skill.system.group);
    const otherSkills = _.filter(skills, (skill) => _.includes(OQNpcSheet.otherSkillsGroups, skill.system.group));

    const abilities = groupedItems.specialAbility ?? [];
    const skillsAndAbilities = _.concat(otherSkills, abilities);

    const magicSkills = groupedSkills.magic ?? [];
    const spells = groupedItems.spell ?? [];
    const magic = _.concat(magicSkills, spells);

    const combatSkills = groupedSkills.combat ?? [];
    const resistances = groupedSkills.resistance ?? [];
    const weapons = groupedItems.weapon ?? [];
    const armour = groupedItems.armour ?? [];
    const combat = _.concat(combatSkills, resistances, weapons, armour);

    const equipment = groupedItems.equipment ?? [];

    return {
      skillsAndAbilities,
      magic,
      combat,
      equipment,
    };
  }

  async onRollCharacteristics(event) {
    event.preventDefault();
    const characteristics = this.actor.system.characteristics;
    const rollsWithKey = _.toPairs(characteristics)
      .map(([key, characteristic]) => [
        key,
        characteristic.roll ? new Roll(characteristic.roll).roll({ async: false }) : null,
      ])
      .filter(([, roll]) => !!roll);
    const characteristicsToUpdate = {
      system: {
        characteristics: _.fromPairs(rollsWithKey.map(([key, roll]) => [key, { base: roll.total }])),
      },
    };
    await this.actor.update(characteristicsToUpdate);
    this.actor.sheet.render(true);
  }
}
