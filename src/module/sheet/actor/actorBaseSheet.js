import { log } from '../../utils.js';

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

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-to-chat').on('click', this._onItemToChat.bind(this));
    html.find('.item-roll').on('click', this._onItemRoll.bind(this));
  }

  async _onItemRoll(event) {
    event.preventDefault();
    log('Item roll', event);

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    item.makeRoll(!event.shiftKey);
  }

  async _onItemToChat(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    item.sendToChat();
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
