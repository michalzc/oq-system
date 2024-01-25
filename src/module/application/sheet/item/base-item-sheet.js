import _ from 'lodash-es';

export class OQBaseItemSheet extends ItemSheet {
  static get defaultOptions() {
    return _.merge(super.defaultOptions, {
      width: 640,
      height: 640,
      classes: ['oq', 'sheet', 'item'],
      template: 'systems/oq/templates/item/item-sheet.hbs',
    });
  }

  async getData(options) {
    const data = super.getData(options);
    const system = this.item.system;
    const enrichedDescription = await TextEditor.enrichHTML(system.description, { async: true });
    return _.merge(data, {
      system,
      enrichedDescription,
    });
  }
}
