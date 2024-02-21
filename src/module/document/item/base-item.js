import { displayItem } from '../../chat.js';
import _ from 'lodash-es';
import { damageRoll, testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/test-roll-dialog.js';
import { OQDamageRollDialog } from '../../application/damage-roll-dialog.js';

/**
 * @typedef {object} ItemRollValue
 * @property {number|undefined} rollValue
 * @property {number|undefined} rollMod
 * @property {number|undefined} rollValueWithMod
 */
export class OQBaseItem extends Item {
  async prepareDerivedData() {
    super.prepareDerivedData();
    const tooltip = await this.getTooltipWithTraits();
    const rollValues = this.calculateRollValues();
    const damageRollValues = this.calculateDamageRollValues();

    _.merge(this, {
      system: {
        rollValues,
        tooltip,
        damageRollValues,
      },
    });
  }

  /**
   * Makes a roll with the given rollData.
   *
   * @param {boolean} skipDialog - The data for the roll.
   */
  async rollItemTest(skipDialog) {
    const rollData = this.getTestRollData();

    if (skipDialog) {
      await testRoll(rollData);
    } else {
      const dialog = new OQTestRollDialog(rollData);
      await dialog.render(true);
    }
  }

  async rollItemDamage(skipDialog = true) {
    const rollData = this.getDamageRollData();

    if (skipDialog) await damageRoll(rollData);
    else {
      const rollDialog = new OQDamageRollDialog(rollData);
      rollDialog.render(true);
    }
  }

  async sendItemToChat() {
    const chatData = this.getItemDataForChat();
    await displayItem(chatData);
  }

  makeRollString(rollFormula) {
    if (this.parent && rollFormula) {
      const roll = new Roll(rollFormula, this.parent.getRollData());
      if (roll.isDeterministic) {
        return roll.roll({ async: false }).total;
      } else {
        return roll.formula;
      }
    } else return '';
  }

  /**
   *
   * @returns {{img: string, entityName: string, speaker: (object|undefined)}}
   */
  getBaseRollData() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
    return {
      img: this.img,
      speaker,
      entityName: this.name,
      type: this.actor.type,
    };
  }

  getTestRollData() {
    return {
      ...this.getBaseRollData(),
      ...this.getRollValues(),
      hasDamage: this.hasDamage,
    };
  }

  get hasDamage() {
    return !!this.system.damageRollValues?.finalDamageFormula;
  }

  getDamageRollData() {
    return {
      ...this.getBaseRollData(),
      ...this.getDamageRollValues(),
      actorRollData: this.parent.getRollData(),
    };
  }

  async getTooltipWithTraits() {
    if (this.system.traits && this.system.traits.length) {
      const description = this.system.description;
      const traits = (this.system.traits ?? []).join(', ');
      return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
    } else {
      return this.system.description;
    }
  }

  getItemDataForChat() {
    return {
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token }),
      name: this.name,
      itemTypeLabel: `TYPES.Item.${this.type}`,
      img: this.img,
      description: this.system.description,
      traits: this.system.traits,
    };
  }

  /**
   * returns {undefined|ItemRollValue}
   */
  getRollValues(forceCalculation = false) {
    if (forceCalculation || !this.system.rollValues) return this.calculateRollValues();
    else return this.system.rollValues;
  }

  getDamageRollValues(forceCalculation = false) {
    if (forceCalculation || !this.system.damageRollValues) return this.calculateDamageRollValues();
    else return this.system.damageRollValues;
  }

  calculateRollValues() {}

  calculateDamageRollValues() {}
}
