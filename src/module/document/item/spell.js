import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQSpell extends OQBaseItem {
  static getDefaultArtwork() {
    return {
      img: CONFIG.OQ.ItemConfig.defaultIcons.spell,
    };
  }

  async _preUpdate(changed, options, user) {
    //FIXME: refactor to common utility
    await super._preUpdate(changed, options, user);

    const changedSpellType = changed.system?.type;
    const currentImage = this.img;
    const spellIcons = CONFIG.OQ.ItemConfig.spellIcons;
    const newImage = spellIcons[changedSpellType];

    if (
      changedSpellType &&
      changedSpellType !== this.system.type &&
      _.includes(_.values(spellIcons), currentImage) &&
      newImage
    ) {
      _.merge(changed, {
        img: spellIcons[changedSpellType],
      });
    }
  }

  async prepareDerivedData() {
    super.prepareDerivedData();
    this.system.tooltip = await this.getTooltipWithTraits();
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    return { ...context, traits: [...this.getTraits()], itemSubtypeLabel: `OQ.Labels.SpellTypes.${this.system.type}` };
  }

  async rollItemTest() {
    await this.sendItemToChat();
  }

  async getTooltipWithTraits() {
    const description = await TextEditor.enrichHTML(this.system.description, { async: true });
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
