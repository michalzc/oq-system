import { OQBaseItem } from './base-item.js';
import { testRoll } from '../../roll.js';
import _ from 'lodash-es';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';
import { minMaxValue } from '../../utils.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    const value = this.getValue();
    const valueWithMod = this.system.mod && minMaxValue(value + this.system.mod);
    const extendedData = {
      slug: this.name.slugify().replace(/\(/g, '').replace(/\)/g, ''),
      groupName: this.getGroupLabel(),
      value,
      valueWithMod,
      mastered: value >= 100,
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

  getValue() {
    if (this.parent) {
      const rollData = this.parent.getRollData();
      const formula = `${this.system.formula} + ${this.system.advancement}`;
      const total = new Roll(formula, rollData).roll({ async: false }).total;

      return minMaxValue(total);
    } else {
      return 0;
    }
  }

  /**
   * @param {boolean} skipDialog
   * @returns {Promise<void>}
   */
  async itemTestRoll(skipDialog) {
    const rollData = _.merge(this.makeBaseTestRollData(), {
      mastered: this.system.mastered,
      rollType: 'skill',
      value: this.system.value,
      modifier: this.system.mod,
    });

    if (skipDialog) {
      await testRoll(rollData);
    } else {
      const dialog = new OQTestRollDialog(rollData);
      await dialog.render(true);
    }
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
