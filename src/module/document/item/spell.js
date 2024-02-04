import { OQBaseItem } from './base-item.js';

export class OQSpell extends OQBaseItem {
  async prepareDerivedData() {
    super.prepareDerivedData();
    this.tooltip = await this.prepareTooltip();
  }

  async prepareTooltip() {
    const description = this.system.description;
    const traits = (this.system.traits ?? []).join(' | ');
    return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
  }
}
