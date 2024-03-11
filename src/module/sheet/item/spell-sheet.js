import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSpellSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);
    const itemConfig = CONFIG.OQ.ItemConfig;

    const spellTypes = _.mapValues(itemConfig.spellsTypes, (value, key) => `OQ.Labels.SpellTypes.${key}`);

    return _.merge(context, {
      spellTypes,
      hasSplitDivineCasting: this.item.hasSplitDivineCasting,
      expended: this.item.expended,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.expended-spell').on('click', this.onChangeCastedSpell.bind(this));
  }

  async onChangeCastedSpell(event) {
    const target = event.currentTarget;
    const checked = target.checked;
    if (checked) this.item.castDivineSpell();
    else this.item.regainDivineSpell();
  }
}
