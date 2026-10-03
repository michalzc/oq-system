import { OQBaseItem } from './base-item.js';

export class OQArmour extends OQBaseItem {
  getItemDataForChat() {
    const context = super.getItemDataForChat();

    const { ap, cost, encumbrance } = this.system;
    const fields = [
      ap && { label: `OQ.Labels.ArmourPoints`, value: ap },
      cost && { label: `OQ.Labels.Cost`, value: cost },
      encumbrance && { label: `OQ.Labels.Encumbrance`, value: encumbrance },
    ].filter((field) => !!field);

    return {
      ...context,
      fields,
    };
  }
}
