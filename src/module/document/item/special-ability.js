import { OQBaseItem } from './base-item.js';
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
      try {
        const roll = new Roll(this.system.formula, this.parent.getDataForItems());
        if (roll.isDeterministic) {
          const value = minMaxValue(roll.evaluateSync().total);

          return {
            value,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {};
  }

  getTestRollData() {
    const context = super.getTestRollData();
    return {
      ...context,
      rollType: 'specialAbility',
    };
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return {
      ...context,
      itemSubtypeLabel: `OQ.Labels.SpecialAbilityTypes.${this.system.type}`,
    };
  }
}
