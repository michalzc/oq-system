import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQWeaponSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);
    const itemConfig = CONFIG.OQ.ItemConfig;
    const weaponHandsList = _.mapValues(itemConfig.weaponHands, (value, key) => `OQ.Labels.WeaponHands.${key}`);
    const weaponTypeList = _.mapValues(itemConfig.weaponType, (value, key) => `OQ.Labels.WeaponTypes.${key}`);
    const itemStates = _.mapValues(itemConfig.weaponStates, (value, key) => `OQ.Labels.ItemStates.${key}`);

    return _.merge(context, {
      weaponHandsList,
      weaponTypeList,
      itemStates,
    });
  }
}
