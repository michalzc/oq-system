import { OQActorBaseSheet } from './actorBaseSheet.js';
import { AttributesDialog } from '../../application/attributesDialog.js';
import { CharacteristicsDialog } from '../../application/characteristicsDialog.js';

export class OQCharacterSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/characterSheet.hbs';
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    html.find('.modify-characteristics').on('click', this._onModifyCharacteristics.bind(this));
    html.find('.modify-attributes').on('click', this._onModifyAttributes.bind(this));

    html.find('.item-edit').on('click', this._onModifyItem.bind(this));
    html.find('.item-delete').on('click', this._onDeleteItem.bind(this));

    html.find('.skill-mod').on('change', this._onUpdateSkillMod.bind(this));
  }

  async _onUpdateSkillMod(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    const value = event.currentTarget.value;
    await item.update({ 'system.mod': value });
  }

  _onModifyItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.sheet.render(true);
  }

  _onDeleteItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.delete();
  }

  _onModifyCharacteristics() {
    const characteristicsDialog = new CharacteristicsDialog(this.actor);
    characteristicsDialog.render(true);
  }

  _onModifyAttributes() {
    const attributesDialog = new AttributesDialog(this.actor);
    attributesDialog.render(true);
  }
}
