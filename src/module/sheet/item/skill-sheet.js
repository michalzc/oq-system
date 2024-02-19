import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSkillSheet extends OQBaseItemSheet {
  async getData(options) {
    const baseData = await super.getData(options);
    return mergeObject(baseData, {
      skillTypes: this.getSkillTypes(),
      customType: this.item.system.type === 'custom',
      assigned: Boolean(this.item.parent),
    });
  }

  getSkillTypes() {
    const groups = _.keys(CONFIG.OQ.ItemConfig.skillTypes);
    return Object.fromEntries(groups.map((key) => [key, `OQ.SkillTypes.${key}`]));
  }
}
