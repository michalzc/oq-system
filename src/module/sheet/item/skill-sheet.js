import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSkillSheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const baseData = await super._prepareContext(options);
    return Object.assign(baseData, {
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
