import { OQBaseItem } from './base-item.js';
import _ from 'lodash-es';

export class OQEquipment extends OQBaseItem {
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    const changedEquipmentType = changed.system?.type;
    const currentImage = this.img;
    const equipmentImages = CONFIG.OQ.ItemConfig.equipmentIcons;
    const newImage = equipmentImages[changedEquipmentType];

    if (
      changedEquipmentType &&
      changedEquipmentType !== this.system.type &&
      _.includes(_.values(equipmentImages), currentImage) &&
      newImage
    ) {
      _.merge(changed, {
        img: newImage,
      });
    }
  }

  getNewImage(source) {
    const imageByType = CONFIG.OQ.ItemConfig.equipmentIcons[source.system?.type];
    return imageByType ?? CONFIG.OQ.ItemConfig.equipmentIcons.single;
  }

  prepareBaseData() {
    super.prepareBaseData();
    const countTypes = [CONFIG.OQ.ItemConfig.equipmentTypes.ammunition, CONFIG.OQ.ItemConfig.equipmentTypes.consumable];

    const quantity = countTypes.includes(this.system.type) && !this.system.quantity ? 0 : this.system.quantity;
    const totalEncumbrance = countTypes.includes(this.system.type)
      ? this.system.encumbrance * quantity
      : this.system.encumbrance;

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
      itemSubtypeLabel: `OQ.Labels.EquipmentTypes.${this.system.type}`,
      fields,
    });
  }
}
