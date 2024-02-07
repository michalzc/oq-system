import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQEquipment extends OQBaseItem {
  prepareBaseData() {
    super.prepareBaseData();

    const quantity = this.system.consumable && !this.system.quantity ? 1 : this.system.quantity;
    const totalEncumbrance = this.system.consumable ? this.system.encumbrance * quantity : this.system.encumbrance;

    _.merge(this.system, {
      quantity,
      totalEncumbrance,
    });
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    const { cost, encumbrance, consumable, quantity } = this.system;
    const fields = [
      consumable && { label: `OQ.Labels.Consumable`, value: '' },
      cost && { label: `OQ.Labels.Cost`, value: cost },
      encumbrance && { label: `OQ.Labels.Encumbrance`, value: encumbrance },
      quantity && { label: `OQ.Labels.Quantity`, value: quantity },
    ];

    return _.merge(context, {
      fields,
    });
  }
}
