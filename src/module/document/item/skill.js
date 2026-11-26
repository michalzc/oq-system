import { OQBaseItem } from './base-item.js';
import { makeSlug, minMaxValue } from '../../utils/utils.js';
import { skillValues } from '../../utils/effect-contributions.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    Object.assign(this.system, { slug: makeSlug(this.name), typeName: this.getTypeLabel() });
  }

  getTypeLabel() {
    const group = this.system.type;
    if (group === 'custom') {
      return this.system.customTypeName;
    } else {
      return `OQ.SkillTypes.${group}`;
    }
  }

  evalRollSafe(formula, rollData) {
    try {
      return new Roll(formula, rollData).evaluateSync().total;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  /**
   * The effective value, from effective characteristics, and the learned value, from unmodified ones; see
   * `skillValues`.
   */
  calculateRollValues() {
    if (this.parent) {
      const { formula, advancement, mod } = this.system;
      const finalMod = mod ?? 0;
      const values = skillValues(
        {
          base: this.evalRollSafe(formula, this.parent.getDataForItems()),
          learnedBase: this.evalRollSafe(formula, this.parent.getDataForItems({ learned: true })),
          advancement,
        },
        CONFIG.OQ.Rules,
      );
      const valueWithMod = mod && minMaxValue(values.value + mod);

      return {
        ...values,
        mod: finalMod,
        valueWithMod,
      };
    } else {
      return {};
    }
  }

  getTestRollData() {
    const context = super.getTestRollData();

    return {
      ...context,
      rollType: 'skill',
    };
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    const { type, customTypeName } = this.system;
    const typeLabel = type === CONFIG.OQ.ItemConfig.skillTypes.custom ? customTypeName ?? '' : `OQ.SkillTypes.${type}`;

    return {
      ...context,
      itemSubtypeLabel: typeLabel,
    };
  }
}
