import { log } from '../../utils.js';
import { displayItem } from '../../chat.js';
import _ from 'lodash-es';
import { testRoll } from '../../roll.js';
import { OQTestRollDialog } from '../../application/dialog/test-roll-dialog.js';

/**
 * @typedef {object} ItemRollValue
 * @property {number|undefined} rollValue
 * @property {number|undefined} rollMod
 * @property {number|undefined} rollValueWithMod
 */
export class OQBaseItem extends Item {
  async _preCreate(source, options, user) {
    await super._preCreate(source, options, user);
    const newImage = CONFIG.OQ.ItemConfig.defaultIcons[source.type];
    if (!source.img && newImage) {
      this.updateSource({
        img: newImage,
      });
    }
  }

  async prepareDerivedData() {
    super.prepareDerivedData();
    const tooltip = await this.getTooltipWithTraits();
    const rollValue = this.getRollValues();

    _.merge(this, {
      system: {
        ...rollValue,
        tooltip,
      },
    });
  }

  /**
   * Makes a roll with the given rollData.
   *
   * @param {boolean} skipDialog - The data for the roll.
   */
  async rollItemTest(skipDialog) {
    // const rollData = _.merge(this.getTestRollData(), {
    //   mastered: this.system.mastered,
    //   rollType: 'skill',
    //   value: this.system.rollValue,
    //   modifier: this.system.rollMod,
    // });
    const rollData = this.getTestRollData();

    if (skipDialog) {
      await testRoll(rollData);
    } else {
      const dialog = new OQTestRollDialog(rollData);
      await dialog.render(true);
    }
  }

  async rollItemDamage(skipDialog = true) {
    log(`Makeing damage for ${this.id}`, skipDialog);
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
  getTestRollData() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
    return {
      img: this.img,
      speaker,
      entityName: this.name,
      type: this.actor.type,
    };
  }

  async getTooltipWithTraits() {
    if (this.system.traits && this.system.traits.length) {
      const description = this.system.description;
      const traits = (this.system.traits ?? []).join(' | ');
      return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
    } else {
      return this.system.description;
    }
  }

  getItemDataForChat() {
    const traits = this.system.traits && this.system.traits.join(', ');
    return {
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token }),
      name: this.name,
      itemTypeLabel: `TYPES.Item.${this.type}`,
      img: this.img,
      description: this.system.description,
      traits: traits,
    };
  }

  /**
   * returns {undefined|ItemRollValue}
   */
  getRollValues() {
    return {};
  }
}
