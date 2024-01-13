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
