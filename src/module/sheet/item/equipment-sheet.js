import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQEquipmentSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);

    const itemConfig = CONFIG.OQ.ItemConfig;
    const itemStates = _.mapValues(itemConfig.equipmentStates, (value, key) => `OQ.Labels.ItemStates.${key}`);
    const itemTypes = _.mapValues(itemConfig.equipmentTypes, (value, key) => `OQ.Labels.EquipmentTypes.${key}`);

    return _.merge(context, {
      itemStates,
      itemTypes,
    });
  }
}
