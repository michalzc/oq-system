import { OQActorDialog } from './actor-dialog.js';

export class AttributesDialog extends OQActorDialog {
  static DEFAULT_OPTIONS = {
    classes: ['attributes'],
    position: { width: 300 },
  };

  static PARTS = {
    form: {
      template: 'systems/oq/templates/applications/attributes-dialog.hbs',
    },
  };

  get title() {
    return `${game.i18n.localize('OQ.Labels.EditAttributes')}: ${this.actor.name}`;
  }
}
