import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQSpell extends OQBaseItem {
  async prepareDerivedData() {
    super.prepareDerivedData();
    this.tooltip = await this.tooltipWithTraits();
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return _.merge(context, {
      itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}`,
    });
  }
}
