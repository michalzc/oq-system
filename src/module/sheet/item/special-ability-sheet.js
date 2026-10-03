import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSpecialAbilitySheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const specialAbilityTypes = _.mapValues(
      CONFIG.OQ.ItemConfig.specialAbilityType,
      (value, key) => `OQ.Labels.SpecialAbilityTypes.${key}`,
    );

    return Object.assign(context, {
      specialAbilityTypes,
    });
  }
}
