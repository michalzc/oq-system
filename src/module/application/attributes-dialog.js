import _ from 'lodash-es';

const mergeObject = foundry.utils.mergeObject;

export class AttributesDialog extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    return mergeObject(options, {
      classes: ['oq', 'dialog', 'attributes'],
      width: 300,
      id: 'attributes-dialog',
    });
  }

  constructor(object) {
    super(object);
  }

  getData(options) {
    const context = super.getData(options);
    const actor = this.object;
    return _.merge(context, {
      name: actor.name,
      type: actor.type,
      system: actor.system,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  get template() {
    return 'systems/oq/templates/applications/attributes-dialog.hbs';
  }

  async _updateObject(event, formData) {
    await this.object.update({ system: formData });
    this.object.sheet?.render(true);
  }
}
