import { OQBaseActor } from './base-actor.js';
import _ from 'lodash-es';
import { getDefaultItemsForCharacter } from '../../compendium-utils.js';

export class OQCharacterActor extends OQBaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    _.merge(this.system, this.prepareSkills(), this.prepareEncumbrance());
  }

  async _preCreate(source, options, userId) {
    await super._preCreate(source, options, userId);

    if (!source.items) {
      const defaultItems = await getDefaultItemsForCharacter();
      if (defaultItems) {
        this.updateSource({
          items: defaultItems,
        });
      }
    }
  }

  prepareSkills() {
    const skills = this.system.groupedItems.skills;
    const groupedSkillByGroupName = _.groupBy(skills, (skill) => skill.system.groupName);
    return {
      groupedItems: {
        groupedSkillByGroupName,
      },
    };
  }
  prepareEncumbrance() {
    const maxEncumbrance = this.system.characteristics.str.value + this.system.characteristics.siz.value;
    const itemStates = CONFIG.OQ.ItemConfig.allItemsStates;
    const encItems = ['weapon', 'armour', 'equipment'];
    const encStates = [itemStates.worn, itemStates.readied, itemStates.carried].map((is) => is.key);
    const totalEncumbrance = this.items
      .filter((item) => encItems.includes(item.type))
      .filter((item) => encStates.includes(item.system.state))
      .map((item) => item.system.totalEncumbrance ?? item.system.encumbrance ?? 0)
      .reduce((l, r) => l + r, 0);
    return {
      enc: {
        maxEncumbrance,
        totalEncumbrance,
      },
    };
  }
}
