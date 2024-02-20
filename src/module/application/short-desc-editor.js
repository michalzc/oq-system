import _ from 'lodash-es';
export class OQNPCShortDescriptionEdit extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return _.merge(options, {
      classes: ['oq', 'dialog', 'npc'],
      width: 300,
      id: 'short-description',
      template: 'systems/oq/templates/applications/short-description-dialog.hbs',
    });
  }

  constructor(object, options) {
    super(object, options);
  }

  async _updateObject(event, formData) {
    const shortDescription = formData.shortDescription;
    await this.object.update({
      'system.personal.shortDescription': shortDescription,
    });
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    const shortDescription = await TextEditor.enrichHTML(this.object.system.personal.shortDescription);

    return _.mergeObject(context, {
      shortDescription,
    });
  }
}
