import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';
import { inRangeValue } from '../../utils/utils.js';

export class OQSpell extends OQBaseItem {
  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return { ...context, traits: [...this.getTraits()], itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}` };
  }

  async rollItemTest() {
    await this.sendItemToChat();
  }

  getTraits() {
    const constTraits = [
      this.hasSplitDivineCasting &&
        `${game.i18n.localize('OQ.Labels.RemainingMagnitude')}(${this.system.remainingMagnitude})`,
      this.system.magnitude && `${game.i18n.localize('OQ.Labels.Magnitude')}(${this.system.magnitude})`,
      this.system.expended && game.i18n.localize('OQ.Labels.Expended'),
      this.system.nonVariant && game.i18n.localize('OQ.Labels.NonVariable'),
      this.system.noMagicPoints && game.i18n.localize('OQ.Labels.NoMagicPoints'),
    ].filter((trait) => !!trait);
    return _.concat(constTraits, super.getTraits());
  }

  get hasSplitDivineCasting() {
    return this.system.hasSplitDivineCasting;
  }

  get expended() {
    return this.system.expended;
  }

  get noMagicPoints() {
    return this.system.noMagicPoints;
  }

  async castDivineSpell(magnitude = 0) {
    if (this.noMagicPoints) {
      const update = inRangeValue(0, this.system.magnitude, magnitude);
      return this.update({ 'system.remainingMagnitude': update });
    }
  }

  async regainDivineSpell() {
    if (this.noMagicPoints) {
      return this.update({ 'system.remainingMagnitude': this.system.magnitude });
    }
  }
}
