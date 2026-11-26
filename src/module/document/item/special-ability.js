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

  /**
   * The effective value, from effective characteristics, and the learned value, from unmodified ones, which Master
   * eligibility reads.
   */
  calculateRollValues() {
    if (this.parent && this.system.formula) {
      try {
        const roll = new Roll(this.system.formula, this.parent.getDataForItems());
        if (roll.isDeterministic) {
          const value = minMaxValue(roll.evaluateSync().total);
          const learned = new Roll(this.system.formula, this.parent.getDataForItems({ learned: true }));
          const learnedValue = minMaxValue(learned.evaluateSync().total);

          return {
            value,
            learnedValue,
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
