import { OQActorBaseSheet } from './actor-base-sheet.js';
import { CharacteristicsDialog } from '../../dialog/characteristics-dialog.js';
import _ from 'lodash-es';

export class OQCharacterSheet extends OQActorBaseSheet {
  get template() {
    return 'systems/oq/templates/actor/character-sheet.hbs';
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;
    html.find('.modify-characteristics').on('click', this.onModifyCharacteristics.bind(this));
  }

  async getData(options) {
    const context = await super.getData(options);
    const enrichedNotes = await TextEditor.enrichHTML(this.actor.system.personal.notes, { async: true });
    return _.merge(context, {
      enrichedNotes,
      isCharacter: true,
    });
  }

  onModifyCharacteristics() {
    const characteristicsDialog = new CharacteristicsDialog(this.actor);
    characteristicsDialog.render(true);
  }
}
