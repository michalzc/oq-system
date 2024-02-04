import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSpellSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);
    const itemConfig = CONFIG.OQ.ItemConfig;

    const spellTypes = _.mapValues(itemConfig.spellsTypes, (value, key) => `OQ.Labels.SpellTypes.${key}`);

    return _.merge(context, {
      spellTypes,
    });
  }
}
