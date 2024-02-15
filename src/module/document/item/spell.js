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
      traits: this.getTraits(),
      itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}`,
    });
  }

  async rollItemTest() {
    await this.sendItemToChat();
  }

  async getTooltipWithTraits() {
    const description = this.system.description;
    const traits = this.getTraits().join(', ');
    return await renderTemplate('systems/oq/templates/tooltip.hbs', { description, traits });
  }

  getTraits() {
    const constTraits = [
      this.system.magnitude && `${game.i18n.localize('OQ.Labels.Magnitude')}(${this.system.magnitude})`,
      this.system.nonVariant && game.i18n.localize('OQ.Labels.NonVariable'),
    ].filter((trait) => !!trait);
    return _.concat(constTraits, this.system.traits ?? []);
  }
}
