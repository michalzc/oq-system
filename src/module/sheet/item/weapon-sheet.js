import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQWeaponSheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const itemConfig = CONFIG.OQ.ItemConfig;
    const weaponHandsList = _.mapValues(itemConfig.weaponHands, (value, key) => `OQ.Labels.WeaponHands.${key}`);
    const weaponTypeList = _.mapValues(itemConfig.weaponType, (value, key) => `OQ.Labels.WeaponTypes.${key}`);
    const itemStates = _.mapValues(itemConfig.weaponStates, (value, key) => `OQ.Labels.ItemStates.${key}`);
    const parentSkills = _.mapValues(this.item.parent?.system.skillsBySlug ?? [], (skill) => skill.name);

    return Object.assign(context, {
      weaponHandsList,
      weaponTypeList,
      itemStates,
      parentSkills,
    });
  }
}
