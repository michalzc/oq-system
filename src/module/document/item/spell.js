import { OQBaseItem } from './base-item.js';

export class OQSpell extends OQBaseItem {
  async prepareDerivedData() {
    super.prepareDerivedData();
    this.tooltip = await this.tooltipWithTraits();
  }
}
