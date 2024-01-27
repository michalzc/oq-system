import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQArmourSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);

    const itemConfig = CONFIG.OQ.ItemConfig;
    const itemStates = _.mapValues(itemConfig.armourStates, (value, key) => `OQ.Labels.ItemStates.${key}`);

    return _.merge(context, {
      itemStates,
    });
  }
}
