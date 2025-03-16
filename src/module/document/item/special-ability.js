import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { minMaxValue } from '../../utils/utils.js';

export class OQSpecialAbility extends OQBaseItem {
  calculateDamageRollValues() {
    const finalDamageFormula = this.makeRollString(this.system.damageFormula);

    return {
      damageFormula: finalDamageFormula,
      finalDamageFormula,
    };
  }

  calculateRollValues() {
    if (this.parent && this.system.formula) {
      const roll = new Roll(this.system.formula, this.parent.getRollData());
      if (roll.isDeterministic) {
        const value = minMaxValue(roll.evaluateSync().total);

        return {
          value,
        };
      }
    }

    return {};
  }

  getTestRollData() {
    const context = super.getTestRollData();
    return _.merge(context, {
      rollType: 'specialAbility',
    });
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return _.merge(context, {
      itemSubtypeLabel: `OQ.Labels.SpecialAbilityTypes.${this.system.type}`,
    });
  }
}
