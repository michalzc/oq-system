import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQSpell extends OQBaseItem {
  async prepareDerivedData() {
    super.prepareDerivedData();
    this.system.tooltip = await this.getTooltipWithTraits();
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return _.merge(context, {
      itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}`,
    });
  }

  async rollItemTest() {
    await this.sendItemToChat();
  }
}
