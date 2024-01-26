import { log } from '../../utils.js';
import { damageRoll } from '../../roll.js';
import { OQDamageRollDialog } from '../../application/dialog/damage-roll-dialog.js';
import _ from 'lodash-es';

export class OQBaseItem extends Item {
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);

    const newIcon = CONFIG.OQ.ItemConfig.defaultIcons[data.type];
    if (data.img === CONFIG.OQ.ItemConfig.bagIcon && newIcon && !options.fromCompendium) {
      await this.update({
        img: newIcon,
      });
    }
  }

  /**
   * Makes a roll with the given rollData.
   *
   * @param {boolean} skipDialog - The data for the roll.
   */
  async itemTestRoll(skipDialog) {
    log(`Making roll for ${this.id}`, skipDialog);
  }

  async sendToChat() {
    log(`Sending to chat element ${this.id}`);
  }

  async makeDamageRoll(skipDialog = true) {
    const actorRollData = this.parent.getRollData();
    const damageFormula = this.system.damage.damageFormula;
    const includeDM = !!this.system.damage.includeDamageMod;
    const rollData = _.merge(this.makeBaseTestRollData(), {
      actorRollData,
      damageFormula,
      includeDM,
    });

    if (skipDialog) await damageRoll(rollData);
    else {
      const rollDialog = new OQDamageRollDialog(rollData);
      rollDialog.render(true);
    }
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
  makeBaseTestRollData() {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
    return {
      img: this.img,
      speaker,
      entityName: this.name,
      type: this.actor.type,
    };
  }
}
