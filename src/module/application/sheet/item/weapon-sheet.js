import { OQBaseItemSheet } from './base-item-sheet.js';
import _ from 'lodash-es';

export class OQWeaponSheet extends OQBaseItemSheet {
  async getData(options) {
    const context = await super.getData(options);
    const itemConfig = CONFIG.OQ.ItemConfig;
    const weaponHandsList = _.mapValues(itemConfig.weaponHands, (value, key) => `OQ.Labels.WeaponHands.${key}`);
    const weaponTypeList = _.mapValues(itemConfig.weaponType, (value, key) => `OQ.Labels.WeaponTypes.${key}`);
    const itemStates = _.mapValues(itemConfig.weaponArmourStates, (value, key) => `OQ.Labels.ItemStates.${key}`);

    return _.merge(context, {
      weaponHandsList,
      weaponTypeList,
      itemStates,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.traits, .tag-input').on('change', this.onTagAdd.bind(this));
    html.find('.traits .tag-delete').on('click', this.onTagDelete.bind(this));
  }

  async onTagDelete(event) {
    event.preventDefault();
    const traitToDelete = event.currentTarget.dataset.tag;
    if (traitToDelete) {
      const traitList = this.item.system.traits;
      const newTraitList = _.without(traitList, traitToDelete);
      await this.item.update({
        'system.traits': newTraitList,
      });
      this.render(true);
    }
  }

  async onTagAdd(event) {
    event.preventDefault();
    const input = event.currentTarget;
    const newTrait = input.value;
    const traitList = this.item.system.traits;
    if (newTrait && !_.includes(traitList, newTrait)) {
      traitList.push(newTrait);
      await this.item.update({
        'system.traits': traitList,
      });

      const result = this.render(true);
      setTimeout(() => {
        $(result.form).find('.tag-input').focus();
      }, 50);
    }
  }
}
