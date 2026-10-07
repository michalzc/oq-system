import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQSpellSheet extends OQBaseItemSheet {
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const itemConfig = CONFIG.OQ.ItemConfig;

    const spellTypes = _.mapValues(itemConfig.spellsTypes, (value, key) => `OQ.Labels.SpellTypes.${key}`);
    const parentSkills = _(this.item.parent?.system.skillsBySlug ?? {})
      .toPairs()
      .filter(([, skill]) => skill.system.type === CONFIG.OQ.ItemConfig.skillTypes.magic)
      .map(([slug, skill]) => [slug, skill.name])
      .fromPairs()
      .value();

    return Object.assign(context, {
      spellTypes,
      parentSkills,
      hasSplitDivineCasting: this.item.hasSplitDivineCasting,
      expended: this.item.expended,
    });
  }

  _onChangeForm(formConfig, event) {
    if (event.target.matches('.expended-spell')) {
      if (this.isEditable) return this.onChangeCastedSpell(event);
      return;
    }
    return super._onChangeForm(formConfig, event);
  }

  async onChangeCastedSpell(event) {
    if (!this.isEditable) return;
    const target = event.target;
    const checked = target.checked;
    if (checked) return this.item.castDivineSpell();
    return this.item.regainDivineSpell();
  }
}
