import { OQBaseItem } from './base-item.js';

export class OQEquipment extends OQBaseItem {
  prepareBaseData() {
    super.prepareBaseData();
    const countTypes = [CONFIG.OQ.ItemConfig.equipmentTypes.ammunition, CONFIG.OQ.ItemConfig.equipmentTypes.consumable];

    const quantity = countTypes.includes(this.system.type) && !this.system.quantity ? 0 : this.system.quantity;
    const totalEncumbrance = countTypes.includes(this.system.type)
      ? this.system.encumbrance * quantity
      : this.system.encumbrance;

    Object.assign(this.system, { quantity, totalEncumbrance });
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();
    const { cost, encumbrance, quantity } = this.system;
    const fields = [
      cost && { label: `OQ.Labels.Cost`, value: cost },
      encumbrance && { label: `OQ.Labels.Encumbrance`, value: encumbrance },
      quantity && { label: `OQ.Labels.Quantity`, value: quantity },
    ].filter((field) => !!field);

    return {
      ...context,
      itemSubtypeLabel: `OQ.Labels.EquipmentTypes.${this.system.type}`,
      fields,
    };
  }
}
