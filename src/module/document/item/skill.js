import { OQBaseItem } from './base-item.js';
import { testRoll } from '../../roll.js';
import _ from 'lodash-es';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';

export class OQSkill extends OQBaseItem {
  prepareDerivedData() {
    super.prepareDerivedData();

    let skillTotal = this.getValue();
    const extendedData = {
      slug: this.name.slugify().replace(/\(/g, '').replace(/\)/g, ''),
      groupName: this.getGroupLabel(),
      value: skillTotal,
      mastered: skillTotal >= 100,
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
      const formula = `${this.system.formula} + ${this.system.mod}`;
      const total = new Roll(formula, rollData).roll({ async: false }).total;

      return Math.min(100, Math.max(0, total));
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
    });

    if (skipDialog) {
      await testRoll(rollData);
    } else {
      const dialog = new OQTestRollDialog(rollData);
      await dialog.render(true);
      // await skillRollDialog(rollData);
    }
  }
}
