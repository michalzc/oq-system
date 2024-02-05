import { log } from '../../utils.js';

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

  prepareDerivedData() {
    super.prepareDerivedData();
    this.tooltip = this.system.description;
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
    log(`Makeing damage for ${this.id}`, skipDialog);
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

  async tooltipWithTraits() {
    if (this.system.traits && this.system.traits.length) {
      const description = this.system.description;
      const traits = (this.system.traits ?? []).join(' | ');
      return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
    } else {
      return this.system.description;
    }
  }
}
