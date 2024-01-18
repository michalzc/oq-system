export class OQBaseItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 640,
      height: 480,
      classes: ['oq', 'sheet', 'item'],
    });
  }

  async getData(options) {
    const data = super.getData(options);
    const system = this.item.system;
    const enrichedDescription = await TextEditor.enrichHTML(system.description, { async: true });
    return mergeObject(data, {
      system,
      enrichedDescription,
    });
  }
}
