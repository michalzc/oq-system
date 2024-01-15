import { log } from '../../utils.js';

export class OQBaseItem extends Item {
  async _preCreate(data, option, user) {
    super._preCreate(data, option, user);
  }

  /**
   * Makes a roll with the given rollData.
   *
   * @param {boolean} skipDialog - The data for the roll.
   */
  async makeRoll(skipDialog) {
    log(`Making roll for ${this.id}`, skipDialog);
  }

  async sendToChat() {
    log(`Sending to chat element ${this.id}`);
  }
}
