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
}
