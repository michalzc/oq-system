import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { makeSlug, minMaxValue } from '../../utils/utils.js';

export class OQSkill extends OQBaseItem {
  static getDefaultArtwork() {
    return {
      img: CONFIG.OQ.ItemConfig.defaultIcons.skill,
    };
  }
  prepareDerivedData() {
    super.prepareDerivedData();

    const extendedData = {
      slug: makeSlug(this.name),
      typeName: this.getTypeLabel(),
    };

    this.system = _.merge(this.system, extendedData);
  }

  getTypeLabel() {
    const group = this.system.type;
    if (group === 'custom') {
      return this.system.customTypeName;
    } else {
      return `OQ.SkillTypes.${group}`;
    }
  }

  calculateRollValues() {
    if (this.parent) {
      const { formula, advancement, mod } = this.system;
      const finalMod = mod ?? 0;
      const rollData = this.parent.getRollData();
      const baseValue = new Roll(formula, rollData).evaluateSync().total;
      const total = baseValue + advancement;
      const value = minMaxValue(total);
      const valueWithMod = mod && minMaxValue(value + mod);
      const mastered = value >= 100;

      return {
        value,
        baseValue,
        mod: finalMod,
        valueWithMod,
        mastered,
      };
    } else {
      return {};
    }
  }

  getTestRollData() {
    const context = super.getTestRollData();

    return _.merge(context, {
      rollType: 'skill',
    });
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    const { type, customTypeName } = this.system;
    const typeLabel = type === CONFIG.OQ.ItemConfig.skillTypes.custom ? customTypeName ?? '' : `OQ.SkillTypes.${type}`;

    return _.merge(context, {
      itemSubtypeLabel: typeLabel,
    });
  }
}
