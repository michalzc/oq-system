import _ from 'lodash-es';
export class OQNPCShortDescriptionEdit extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return _.merge(options, {
      classes: ['oq', 'dialog', 'npc'],
      width: 600,
      height: 400,
      id: 'short-description',
      template: 'systems/oq/templates/applications/short-description-dialog.hbs',
      resizable: true,
    });
  }

  get title() {
    return `${game.i18n.localize('OQ.Dialog.ShortDescription.title')} ${this.object.name}`;
  }

  constructor(object, options) {
    super(object, options);
  }

  async _updateObject(event, formData) {
    await this.object.update({
      ...formData,
    });
  }

  async getData() {
    const shortDescription = this.object.system.personal.shortDescription;
    const enrichedDescription = await TextEditor.enrichHTML(shortDescription);

    return {
      enrichedDescription,
      type: 'npc',
    };
  }
}
