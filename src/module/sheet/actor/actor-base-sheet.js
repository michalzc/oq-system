import _ from 'lodash-es';
import { AttributesDialog } from '../../application/attributes-dialog.js';
import { OQBaseActor } from '../../document/actor/base-actor.js';
import {
  asyncFlattenItemsFromFolder,
  inRangeValue,
  withAttributeLabels,
  withCharacteristicLabels,
} from '../../utils/utils.js';

const mergeObject = foundry.utils.mergeObject;

export class OQActorBaseSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    const baseOptions = super.defaultOptions;

    return mergeObject(baseOptions, {
      classes: ['sheet', 'oq', 'actor'],
      width: 900,
      height: 1024,
      dragDrop: [{ dragSelector: '.item-to-drag', dropSelector: null }],
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
    const context = super.getData(options);
    const system = this.actor.system;
    const initiativeOptions = this.getInitiativeOptions();
    const groupedItems = this.prepareGroupedItems();
    const itemTooltips = await this.prepareItemTooltips();
    return _.merge(context, {
      system,
      characteristics: withCharacteristicLabels(system.characteristics),
      attributes: withAttributeLabels(system.attributes),
      initiativeOptions,
      groupedItems,
      itemTooltips,
    });
  }

  async prepareItemTooltips() {
    const tooltips = await Promise.all(
      this.actor.items.map(async (item) => [item.id, await item.getTooltipWithTraits()]),
    );
    return _.fromPairs(tooltips);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('a.item-to-chat').on('click', this.onItemToChat.bind(this));
    html.find('a.item-roll').on('click', this.onItemTestRoll.bind(this));
    html.find('a.damage-roll').on('click', this.onDamageRoll.bind(this));

    if (!this.isEditable) return;

    // this.weaponStatesMenu(html);
    this.statusMenu(html, CONFIG.OQ.ItemConfig.weaponStates, '.item-state-weapon');
    this.statusMenu(html, CONFIG.OQ.ItemConfig.armourStates, '.item-state-armour');
    this.statusMenu(html, CONFIG.OQ.ItemConfig.equipmentStates, '.item-state-equipment');

    html.find('.modify-attributes').on('click', this.onModifyAttributes.bind(this));

    html.find('a.item-edit').on('click', this.onModifyItem.bind(this));
    html.find('a.item-delete').on('click', this.onDeleteItem.bind(this));

    html.find('.item-adv').on('change', this.onUpdateItemAdv.bind(this));

    html.find('.item-quantity-value').on('change', this.onItemUpdateQuantity.bind(this));
    html.find('.item-quantity-update').on('click', this.onItemQuantityIncreaseDecrease.bind(this));

    html.find('.resource-update').on('click contextmenu', this.onUpdateResource.bind(this));

    html.find('.add-new-item').on('click', this.onAddNewItem.bind(this));
  }

  statusMenu(element, statuses, selector) {
    const elems = _.values(
      _.mapValues(statuses, (elem, key) => ({
        icon: elem.icon,
        callback: this.onItemUpdateState.bind(this, key),
        name: game.i18n.localize(`OQ.Labels.ItemStates.${key}`),
      })),
    );

    // appv1 sheets hand activateListeners a jQuery object, ContextMenu wants the raw element.
    const container = element instanceof HTMLElement ? element : element[0];

    new foundry.applications.ux.ContextMenu.implementation(container, selector, elems, {
      eventName: 'click',
      jQuery: false,
    });
  }

  async _onDropFolder(event, data) {
    if (data.type === 'Folder' && data.uuid) {
      const folder = await fromUuid(data.uuid);
      if (folder.type === 'Item') {
        const content = await asyncFlattenItemsFromFolder(folder);
        if (content) {
          await this.actor.createEmbeddedDocuments('Item', content);
        }
      }
    } else {
      return super._onDropFolder(event, data);
    }
  }

  async onAddNewItem(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const dataset = currentTarget.dataset;
    const type = dataset.type;
    const systemType = dataset.systemType;
    const customTypeName = systemType === CONFIG.OQ.ItemConfig.skillTypes.custom && dataset.customTypeName;
    const typeLabel = `TYPES.Item.${type}`;
    const name = `${game.i18n.localize('OQ.Labels.New')} ${game.i18n.localize(typeLabel)}`;
    const itemData = {
      name,
      type,
      system: {
        customTypeName,
        type: systemType,
      },
    };
    await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
  }

  async onItemUpdateQuantity(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const itemId = $(currentTarget).closest('.item').data().itemId;
    const item = this.actor.items.get(itemId);
    const value = currentTarget.value;
    await item.update({ 'system.quantity': value });
    this.render(true);
  }

  async onItemQuantityIncreaseDecrease(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const itemId = $(currentTarget).closest('.item').data().itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      const currentValue = item.system.quantity ?? 0;
      const updateValue = parseInt(currentTarget.dataset.value);
      const update = { 'system.quantity': currentValue + updateValue };
      await item.update(update);
      this.render(true);
    }
  }

  async onItemUpdateState(state, elem) {
    const itemId = elem.closest('.item')?.dataset?.itemId;
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

  async onUpdateItemAdv(event) {
    event.preventDefault();

    const targetElem = event.currentTarget;
    const itemContainer = targetElem.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      const value = parseInt(targetElem.value) ?? 0;
      if (!isNaN(value)) {
        if (value < 0) {
          const rollData = item.getTestRollData();
          const advancement = -value - (rollData.baseValue ?? 0);
          await item.update({ 'system.advancement': advancement });
        } else {
          await item.update({ 'system.advancement': value });
        }
      }
    }
  }

  onModifyItem(event) {
    event.preventDefault();
    const itemContainer = event.currentTarget.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      item.sheet.render(true);
    }
  }

  onDeleteItem(event) {
    event.preventDefault();
    const itemContainer = event.currentTarget.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      item.delete();
    }
  }

  async onItemTestRoll(event) {
    event.preventDefault();

    const itemContainer = event.currentTarget.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      await item.rollItemTest(event.shiftKey);
    }
  }

  async onDamageRoll(event) {
    event.preventDefault();

    const itemContainer = event.currentTarget.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      await item.rollItemDamage(!event.shiftKey);
    }
  }

  async onItemToChat(event) {
    event.preventDefault();

    const itemContainer = event.currentTarget.closest('.item');
    const item = this.actor.items.get(itemContainer?.dataset?.itemId);
    if (item) {
      await item.sendItemToChat();
    }
  }

  async onUpdateResource(event) {
    event.preventDefault();

    // Left click raises the value, right click lowers it.
    const delta = event.type === 'contextmenu' ? -1 : 1;
    const resourceId = event.currentTarget.dataset.resourceId;
    const { value, max } = this.actor.system.attributes[resourceId];
    const newValue = inRangeValue(0, max, value + delta);

    if (newValue !== value) await this.actor.update({ [`system.attributes.${resourceId}.value`]: newValue });
  }

  getInitiativeOptions() {
    const itemTypes = CONFIG.OQ.ItemConfig.itemTypes;
    const initiativeTypes = [itemTypes.skill, itemTypes.specialAbility];
    const items = this.actor.items.filter((item) => initiativeTypes.includes(item.type) && item.system.formula);
    const makeName = (item) => {
      const rollValues = item.getRollValues && item.getRollValues();
      return (rollValues?.value && `${item.name} (${rollValues.value})`) || item.name;
    };

    return _.fromPairs(items.map((item) => [item.id, makeName(item)]));
  }

  prepareGroupedItems() {
    const allItems = _.sortBy([...this.actor.items], (item) => item.name);
    const groupedItems = _.groupBy(allItems, (item) => item.type);
    const skills = groupedItems.skill ?? [];
    const abilities = groupedItems.specialAbility ?? [];
    const groupedSkills = _.groupBy(skills, (skill) => skill.system.type);
    const groupedAbilities = _.groupBy(abilities, (ability) => ability.system.type);

    const otherSkills = _.filter(skills, (skill) => _.includes(OQBaseActor.otherSkillsTypes, skill.system.type));

    const generalAbilities = groupedAbilities.general ?? [];
    const skillsAndAbilities = _.concat(otherSkills, generalAbilities);

    const magicSkills = groupedSkills.magic ?? [];
    const magicAbilities = groupedAbilities.magic ?? [];
    const spells = groupedItems.spell ?? [];
    const magic = _.concat(magicSkills, magicAbilities, spells);

    const resistances = groupedSkills.resistance ?? [];
    const combatAbilities = groupedAbilities.combat ?? [];
    const weapons = groupedItems.weapon ?? [];
    const armours = groupedItems.armour ?? [];

    const equipment = groupedItems.equipment ?? [];
    const equipmentByType = _.fromPairs(
      _.sortBy(_.toPairs(_.groupBy(equipment, (eq) => eq.system.type)), ([key]) => key),
    );
    const weaponsBySkills = this.getWeaponBySkills(weapons, groupedSkills.combat);

    return {
      abilities,
      armours,
      combatAbilities,
      equipment,
      groupedSkills,
      magic,
      magicAbilities,
      resistances,
      skillsAndAbilities,
      weapons,
      weaponsBySkills,
      equipmentByType,
    };
  }

  getWeaponBySkills(weapons, combatSkills) {
    const combatSkillsRefs = (combatSkills ?? []).map((skill) => skill.system.slug);
    const groupedWeapons = _.groupBy(weapons, (weapon) => weapon.system.correspondingSkill.skillReference);
    const buildEntity = (reference) => ({
      skill: this.actor.system.skillsBySlug[reference],
      weapons: groupedWeapons[reference] ?? [],
    });

    return _.map(_.sortedUniq(_.sortBy(_.concat(combatSkillsRefs ?? [], _.keys(groupedWeapons)))), buildEntity).filter(
      (entity) => !!entity.skill,
    );
  }
}
