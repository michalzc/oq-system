import { log } from '../../utils.js';
import _ from 'lodash-es';

const mergeObject = foundry.utils.mergeObject;
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

  getData(options) {
    const context = super.getData(options);
    const system = this.actor.system;
    const characteristics = this.updateCharacteristicsLabels(system.characteristics);
    const attributes = this.updateAttributesLabels(system.attributes);
    const updatedSystem = _.merge(system, {
      characteristics: characteristics,
      attributes: attributes,
    });
    return _.merge(context, {
      system: updatedSystem,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-to-chat').on('click', this._onItemToChat.bind(this));
    html.find('.item-roll').on('click', this._onItemRoll.bind(this));

    html.find('.item-edit').on('click', this._onModifyItem.bind(this));
    html.find('.item-delete').on('click', this._onDeleteItem.bind(this));

    html.find('.item-mod').on('change', this._onUpdateItemMod.bind(this));
  }

  async _onUpdateItemMod(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    const value = event.currentTarget.value;
    await item.update({ 'system.mod': value });
  }

  _onModifyItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.sheet.render(true);
  }

  _onDeleteItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.delete();
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
    await item.sendToChat();
  }

  updateCharacteristicsLabels(characteristics) {
    const localizationPrefix = 'OQ.Labels.CharacteristicsNames';
    return _.mapValues(characteristics, (characteristic, key) => {
      const label = `${localizationPrefix}.${key}.label`;
      const abbr = `${localizationPrefix}.${key}.abbr`;
      return {
        ...characteristic,
        label,
        abbr,
      };
    });
  }

  updateAttributesLabels(attributes) {
    log('Attributes to update', attributes);
    const localizationPrefix = 'OQ.Labels.AttributesNames';
    return _.mapValues(attributes, (attribute, key) => {
      const label = `${localizationPrefix}.${key}.label`;
      const abbr = `${localizationPrefix}.${key}.abbr`;
      return {
        ...attribute,
        label,
        abbr,
      };
    });
  }
}
