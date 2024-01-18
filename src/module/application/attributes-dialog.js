import { log } from '../utils.js';

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
    const data = super.getData(options);
    const actorData = this.object.toObject(false);
    return mergeObject(data, {
      actorData: actorData,
      system: actorData.system,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  get template() {
    return 'systems/oq/templates/applications/attributes-dialog.hbs';
  }

  async _updateObject(event, formData) {
    log('Got data', formData);
    await this.object.update({ data: formData });
    this.object.sheet?.render(true);
  }
}
