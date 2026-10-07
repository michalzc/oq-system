import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQEquipmentSheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const itemConfig = CONFIG.OQ.ItemConfig;
    const itemStates = _.mapValues(itemConfig.equipmentStates, (value, key) => `OQ.Labels.ItemStates.${key}`);
    const itemTypes = _.mapValues(itemConfig.equipmentTypes, (value, key) => `OQ.Labels.EquipmentTypes.${key}`);

    return Object.assign(context, {
      itemStates,
      itemTypes,
    });
  }
}
