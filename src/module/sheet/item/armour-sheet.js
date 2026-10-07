import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQArmourSheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const itemConfig = CONFIG.OQ.ItemConfig;
    const itemStates = _.mapValues(itemConfig.armourStates, (value, key) => `OQ.Labels.ItemStates.${key}`);

    return Object.assign(context, {
      itemStates,
    });
  }
}
