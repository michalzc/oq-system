import { OQActorDialog } from './actor-dialog.js';

export class OQNPCShortDescriptionEdit extends OQActorDialog {
  static DEFAULT_OPTIONS = {
    classes: ['short-description'],
    position: { width: 600, height: 400 },
    window: { resizable: true },
  };

  static PARTS = {
    form: {
      template: 'systems/oq/templates/applications/short-description-dialog.hbs',
    },
  };

  get title() {
    return `${game.i18n.localize('OQ.Dialog.ShortDescription.title')} ${this.actor.name}`;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    // Saving the editor submits the form. The editor also saves when it's removed, which must not submit a closing
    // dialog.
    this.element.querySelector('prose-mirror').addEventListener('save', () => {
      if (this.rendered) this.form.requestSubmit();
    });
  }
}
