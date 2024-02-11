import { OQBaseActor } from './base-actor.js';
import _ from 'lodash-es';
import { getDefaultItemsForCharacter } from '../../compendium-utils.js';

export class OQCharacterActor extends OQBaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();
    const enc = this.prepareEncumbrance();

    _.merge(this.system, {
      enc,
    });
  }

  async _preCreate(source, options, userId) {
    await super._preCreate(source, options, userId);

    if (!source.items) {
      const defaultItems = await getDefaultItemsForCharacter();
      if (defaultItems) {
        this.updateSource({
          items: defaultItems,
        });
      }
    }
  }

  prepareEncumbrance() {
    const characteristics = this.system.characteristics;
    const maxEncumbrance = characteristics.str.value + characteristics.siz.value;
    const itemStates = CONFIG.OQ.ItemConfig.allItemsStates;
    const encItems = ['weapon', 'armour', 'equipment'];
    const encStates = [itemStates.worn, itemStates.readied, itemStates.carried].map((is) => is.key);
    const totalEncumbrance = this.items
      .filter((item) => encItems.includes(item.type))
      .filter((item) => encStates.includes(item.system.state))
      .map((item) => item.system.totalEncumbrance ?? item.system.encumbrance ?? 0)
      .reduce((l, r) => l + r, 0);
    return {
      maxEncumbrance,
      totalEncumbrance,
    };
  }
}
