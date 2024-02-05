import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSpecialAbilitySheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);
    const specialAbilityTypes = _.mapValues(
      CONFIG.OQ.ItemConfig.specialAbilityType,
      (value, key) => `OQ.Labels.SpecialAbilityTypes.${key}`,
    );

    return _.merge(context, {
      specialAbilityTypes,
    });
  }
}
