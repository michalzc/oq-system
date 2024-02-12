import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { makeSlug, minMaxValue } from '../../utils.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    const extendedData = {
      slug: makeSlug(this.name),
      groupName: this.getGroupLabel(),
    };

    this.system = _.merge(this.system, extendedData);
  }

  getGroupLabel() {
    const group = this.system.group;
    if (group === 'custom') {
      return this.system.customGroupName;
    } else {
      return `OQ.SkillGroups.${group}`;
    }
  }

  calculateRollValues() {
    if (this.parent) {
      const { formula, advancement, mod } = this.system;
      const finalMod = mod ?? 0;
      const rollData = this.parent.getRollData();
      const rollFormula = `${formula} + ${advancement}`;
      const total = new Roll(rollFormula, rollData).roll({ async: false }).total;
      const value = minMaxValue(total);
      const valueWithMod = mod && minMaxValue(value + mod);
      const mastered = value >= 100;

      return {
        value,
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
    const { group, customGroupName } = this.system;
    const groupLabel =
      group === CONFIG.OQ.ItemConfig.skillGroups.custom ? customGroupName ?? '' : `OQ.SkillGroups.${group}`;

    return _.merge(context, {
      itemSubtypeLabel: groupLabel,
    });
  }
}
