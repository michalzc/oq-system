import _ from 'lodash-es';
import { AttributesDialog } from '../../dialog/attributes-dialog.js';

const mergeObject = foundry.utils.mergeObject;
export class OQActorBaseSheet extends ActorSheet {
  static get defaultOptions() {
    const baseOptions = super.defaultOptions;

    return mergeObject(baseOptions, {
      classes: ['sheet', 'oq', 'actor'],
      width: 900,
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

    html.find('a.item-to-chat').on('click', this.onItemToChat.bind(this));
    html.find('a.item-roll').on('click', this.onItemRoll.bind(this));
    html.find('a.damage-roll').on('click', this.onDamageRoll.bind(this));

    if (!this.isEditable) return;

    // this.weaponStatesMenu(html);
    this.statusMenu(html, CONFIG.OQ.ItemConfig.weaponStates, '.item-state-weapon');
    this.statusMenu(html, CONFIG.OQ.ItemConfig.armourStates, '.item-state-armour');
    html.find('.modify-attributes').on('click', this.onModifyAttributes.bind(this));

    html.find('a.item-edit').on('click', this.onModifyItem.bind(this));
    html.find('a.item-delete').on('click', this.onDeleteItem.bind(this));

    html.find('.item-mod').on('change', this.onUpdateItemMod.bind(this));

    html.find('.item-quantity-value').on('change', this.onItemUpdateQuantity.bind(this));
    html.find('.item-quantity-update').on('click', this.onItemQuantityIncreaseDecrease.bind(this));
  }

  statusMenu(element, statuses, selector) {
    const elems = _.values(
      _.mapValues(statuses, (elem, key) => ({
        icon: elem.icon,
        callback: this.onItemUpdateState.bind(this, key),
        name: game.i18n.localize(`OQ.Labels.ItemStates.${key}`),
      })),
    );

    new ContextMenu(element, selector, elems, { eventName: 'click' });
  }

  async onItemUpdateQuantity(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const itemId = $(currentTarget).closest('.item-quantity').data().itemId;
    const item = this.actor.items.get(itemId);
    const value = currentTarget.value;
    await item.update({ 'system.quantity': value });
    this.render(true);
  }

  async onItemQuantityIncreaseDecrease(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const itemId = $(currentTarget).closest('.item-quantity').data().itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      const currentValue = item.system.quantity ?? 0;
      const update = parseInt(currentTarget.dataset.value);
      await item.update({ 'system.quantity': currentValue + update });
      this.render(true);
    }
  }

  async onItemUpdateState(state, elem) {
    const itemId = elem.data().itemId;
    const item = itemId && this.actor.items.get(itemId);
    if (item) {
      await item.update({ 'system.state': state });
      this.render(true);
    }
  }

  onModifyAttributes() {
    const attributesDialog = new AttributesDialog(this.actor);
    attributesDialog.render(true);
  }

  async onUpdateItemMod(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    const value = event.currentTarget.value;
    await item.update({ 'system.advancement': value });
  }

  onModifyItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.sheet.render(true);
  }

  onDeleteItem(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const item = this.actor.items.get(dataset.itemId);
    item.delete();
  }

  async onItemRoll(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    await item.itemTestRoll(event.shiftKey);
  }

  async onDamageRoll(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    await item.makeDamageRoll(!event.shiftKey);
  }

  async onItemToChat(event) {
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
