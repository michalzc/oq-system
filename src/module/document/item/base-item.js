import { displayItem } from '../../utils/chat.js';
import { damageRoll, testRoll } from '../../utils/roll.js';
import { OQTestRollDialog } from '../../application/test-roll-dialog.js';
import { OQDamageRollDialog } from '../../application/damage-roll-dialog.js';
import { renderTemplate } from '../../utils/utils.js';

/**
 * @typedef {object} ItemRollValue
 * @property {number|undefined} rollValue
 * @property {number|undefined} rollMod
 * @property {number|undefined} rollValueWithMod
 */
export class OQBaseItem extends Item {
  static getDefaultArtwork(itemData) {
    const itemConfig = CONFIG.OQ.ItemConfig;
    const img = itemConfig.defaultIcons[itemData.type];

    if (img) {
      return {
        img,
      };
    } else {
      return super.getDefaultArtwork(itemData);
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.system.rollValues = this.calculateRollValues();
    this.system.damageRollValues = this.calculateDamageRollValues();
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
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(chatData.description, {
      relativeTo: this,
    });
    await displayItem({ ...chatData, description });
  }

  makeRollString(rollFormula) {
    if (this.parent && rollFormula) {
      try {
        const roll = new Roll(rollFormula, this.parent.getDataForItems());
        if (roll.isDeterministic) {
          return roll.evaluateSync().total;
        } else {
          return roll.formula;
        }
      } catch (e) {
        console.error(e);
        return '';
      }
    } else return '';
  }

  /**
   *
   * @returns {{img: string, entityName: string, speaker: (object|undefined)}}
   */
  getBaseRollData() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor?.token });
    return {
      img: this.img,
      speaker,
      entityName: this.name,
      type: this.actor?.type,
    };
  }

  getTestRollData() {
    return {
      ...this.getBaseRollData(),
      ...this.getRollValues(),
      hasDamage: this.hasDamage,
      uuid: this.uuid,
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

  /**
   * Async, so call it while building a sheet context, never from data preparation.
   */
  async getTooltipWithTraits() {
    const description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.system.description, {
      relativeTo: this,
    });
    const traits = this.getTraits().join(', ');
    if (!description && !traits) return '';
    return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
  }

  getTraits() {
    return this.system.traits ?? [];
  }

  getItemDataForChat() {
    return {
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor?.token }),
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
