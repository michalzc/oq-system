export class OQActorBaseSheet extends ActorSheet {
  static get defaultOptions() {
    const baseOptions = super.defaultOptions;

    return mergeObject(baseOptions, {
      classes: ['sheet', 'oq', 'actor'],
      width: 800,
      height: 1000,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-content',
          initial: 'skills',
        },
      ],
    });
  }

  async getData(options) {
    const data = super.getData(options);
    const system = this.actor.system;
    const enrichedNotes = await TextEditor.enrichHTML(system.personal.notes, { async: true });
    return mergeObject(data, {
      system,
      enrichedNotes,
    });
  }
}
