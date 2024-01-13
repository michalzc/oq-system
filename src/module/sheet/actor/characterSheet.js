import { OQActorBaseSheet } from './actorBaseSheet.js';
import { AttributesDialog } from '../../application/attributesDialog.js';
import { CharacteristicsDialog } from '../../application/characteristicsDialog.js';

export class OQCharacterSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/characterSheet.hbs';
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('a.modify-characteristics').on('click', this.modifyCharacteristics.bind(this));
    html.find('a.modify-attributes').on('click', this.modifyAttributes.bind(this));

    html.find('.item-edit').on('click', this.modifyItem.bind(this));
    html.find('.item-delete').on('click', this.deleteItem.bind(this));

    html.find('.skill-mod').on('change', this.updateSkillValue.bind(this));
  }

  async updateSkillValue(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    const value = event.currentTarget.value;
    await item.update({ 'system.mod': value });
  }

  modifyItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.sheet.render(true);
  }

  deleteItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.delete();
  }

  modifyCharacteristics() {
    const characteristicsDialog = new CharacteristicsDialog(this.actor);
    characteristicsDialog.render(true);
  }

  modifyAttributes() {
    const attributesDialog = new AttributesDialog(this.actor);
    attributesDialog.render(true);
  }
}
