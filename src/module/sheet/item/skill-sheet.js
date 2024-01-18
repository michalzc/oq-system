import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSkillSheet extends OQBaseItemSheet {
  get template() {
    return 'systems/oq/templates/item/skill.hbs';
  }

  async getData(options) {
    const baseData = await super.getData(options);
    return mergeObject(baseData, {
      skillGroups: this.getSkillGroups(),
      customGroup: this.item.system.group === 'custom',
      assigned: Boolean(this.item.parent),
    });
  }

  getSkillGroups() {
    const groups = _.keys(CONFIG.OQ.SkillGroups);
    return Object.fromEntries(groups.map((key) => [key, `OQ.SkillGroups.${key}`]));
  }
}
