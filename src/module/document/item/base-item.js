import { log } from '../../utils.js';

export class OQBaseItem extends Item {
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);

    const newIcon = CONFIG.OQ.ItemConfig.defaultIcons[data.type];
    if (newIcon && !options.fromCompendium) {
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
  async makeRoll(skipDialog) {
    log(`Making roll for ${this.id}`, skipDialog);
  }

  async sendToChat() {
    log(`Sending to chat element ${this.id}`);
  }
}
