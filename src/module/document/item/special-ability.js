import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { damageRoll, testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';
import { OQDamageRollDialog } from '../../application/dialog/damage-roll-dialog.js';
import { minMaxValue } from '../../utils.js';

export class OQSpecialAbility extends OQBaseItem {
  async prepareDerivedData() {
    super.prepareDerivedData();
    const tooltip = await this.tooltipWithTraits();
    const rollValue = this.getRollValue();
    const damageRollValue = this.getDamageRollValue();

    _.merge(this, {
      tooltip,
      rollValue,
      damageRollValue,
    });
  }

  getDamageRollValue() {
    const damage = this.system.damageFormula;
    return damage ? this.makeRollString(damage) : '';
  }

  getRollValue() {
    if (this.parent && this.system.formula) {
      const roll = new Roll(this.system.formula, this.parent.getRollData());
      if (roll.isDeterministic) {
        const value = roll.roll({ async: false }).total;
        return minMaxValue(value);
      }
    }

    return null;
  }

  async makeDamageRoll(skipDialog = true) {
    const actorRollData = this.parent.getRollData();
    const damageFormula = this.damageRollValue;
    const rollData = _.merge(this.makeBaseTestRollData(), {
      actorRollData,
      damageFormula,
    });

    if (skipDialog) await damageRoll(rollData);
    else {
      const rollDialog = new OQDamageRollDialog(rollData);
      rollDialog.render(true);
    }
  }

  async itemTestRoll(skipDialog) {
    const rollData = _.merge(this.makeBaseTestRollData(), {
      rollType: 'specialAbility',
      value: this.rollValue,
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
    return _.merge(context, {
      itemSubtypeLabel: `OQ.Labels.SpecialAbilityTypes.${this.system.type}`,
    });
  }
}
