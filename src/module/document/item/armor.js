import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQArmour extends OQBaseItem {
  static getDefaultArtwork() {
    return {
      img: CONFIG.OQ.ItemConfig.defaultIcons.armour,
    };
  }

  getItemDataForChat() {
    const context = super.getItemDataForChat();

    const { ap, cost, encumbrance } = this.system;
    const fields = [
      ap && { label: `OQ.Labels.ArmourPoints`, value: ap },
      cost && { label: `OQ.Labels.Cost`, value: cost },
      encumbrance && { label: `OQ.Labels.Encumbrance`, value: encumbrance },
    ];

    return _.merge(context, {
      fields,
    });
  }
}
