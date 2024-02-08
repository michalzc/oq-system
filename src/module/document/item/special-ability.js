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
    const damageRollValue = this.getDamageRollValue();

    this.system = _.merge(this.system, {
      tooltip,
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
        const rollValue = minMaxValue(roll.roll({ async: false }).total);

        return {
          rollValue,
        };
      }
    }

    return {};
  }

  async makeDamageRoll(skipDialog = true) {
    const actorRollData = this.parent.getRollData();
    const damageFormula = this.system.damageRollValue;
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
      value: this.system.rollValue,
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
