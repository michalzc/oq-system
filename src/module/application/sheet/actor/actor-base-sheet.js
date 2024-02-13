import _ from 'lodash-es';
import { AttributesDialog } from '../../dialog/attributes-dialog.js';
import { OQBaseActor } from '../../../document/actor/base-actor.js';

const mergeObject = foundry.utils.mergeObject;

export class OQActorBaseSheet extends ActorSheet {
  static get defaultOptions() {
    const baseOptions = super.defaultOptions;

    return mergeObject(baseOptions, {
      classes: ['sheet', 'oq', 'actor'],
      width: 900,
      height: 1024,
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
    const initiativeOptions = this.getInitiativeOptions();
    const groupedItems = this.prepareGroupedItems();
    return _.merge(context, {
      system: _.merge(system, {
        characteristics: characteristics,
        attributes: attributes,
      }),
      initiativeOptions,
      groupedItems,
    });
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

    html.find('.item-mod').on('change', this.onUpdateItemMod.bind(this));

    html.find('.item-quantity-value').on('change', this.onItemUpdateQuantity.bind(this));
    html.find('.item-quantity-update').on('click', this.onItemQuantityIncreaseDecrease.bind(this));

    html.find('.resource-update').on('mouseup', this.onUpdateResource.bind(this));

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

    new ContextMenu(element, selector, elems, { eventName: 'click' });
  }

  async onAddNewItem(event) {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    const dataset = currentTarget.dataset;
    const type = dataset.type;
    const group = type === CONFIG.OQ.ItemConfig.itemTypes.skill && dataset.group;
    const customGroupName = group && group === CONFIG.OQ.ItemConfig.skillGroups.custom && dataset.customGroupName;
    const systemType = dataset.systemType;
    const typeLabel = `TYPES.Item.${type}`;
    const name = `${game.i18n.localize('OQ.Labels.New')} ${game.i18n.localize(typeLabel)}`;
    const itemData = {
      name,
      type,
      system: {
        group,
        customGroupName,
        type: systemType,
      },
    };
    await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
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

  async onItemTestRoll(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    await item.rollItemTest(event.shiftKey);
  }

  async onDamageRoll(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    await item.rollItemDamage(!event.shiftKey);
  }

  async onItemToChat(event) {
    event.preventDefault();

    const dataSet = event.currentTarget.dataset;
    const item = this.actor.items.get(dataSet?.itemId);
    await item.sendItemToChat();
  }

  async onUpdateResource(event) {
    const update = event.which === 1 ? 1 : -1;
    const dataSet = event.currentTarget.dataset;
    const resourceId = dataSet.resourceId;
    const path = `system.attributes.${resourceId}.value`;
    const value = _.get(this.actor, path);

    await this.actor.update({ [path]: value + update });
  }

  getInitiativeOptions() {
    const itemTypes = CONFIG.OQ.ItemConfig.itemTypes;
    const initiativeTypes = [itemTypes.skill, itemTypes.specialAbility, itemTypes.weapon];
    const items = this.actor.items.filter((item) => initiativeTypes.includes(item.type));
    return _.fromPairs(items.map((item) => [item.id, item.name]));
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

  prepareGroupedItems() {
    //FIXME: Move to sheet
    const allItems = _.sortBy([...this.actor.items], (item) => item.name);
    const groupedItems = _.groupBy(allItems, (item) => item.type);
    const skills = groupedItems.skill ?? [];
    const abilities = groupedItems.specialAbility ?? [];
    const groupedSkills = _.groupBy(skills, (skill) => skill.system.group);
    const groupedAbilities = _.groupBy(abilities, (ability) => ability.system.type);

    const otherSkills = _.filter(skills, (skill) => _.includes(OQBaseActor.otherSkillsGroups, skill.system.group));
    const groupedSkillBySlug = _.fromPairs(skills.map((skill) => [skill.system.slug, skill.name]));

    const generalAbilities = groupedAbilities.general ?? [];
    const skillsAndAbilities = _.concat(otherSkills, generalAbilities);

    const magicSkills = groupedSkills.magic ?? [];
    const magicAbilities = groupedAbilities.magic ?? [];
    const spells = groupedItems.spell ?? [];
    const magic = _.concat(magicSkills, magicAbilities, spells);

    const combatSkills = groupedSkills.combat ?? [];
    const resistances = groupedSkills.resistance ?? [];
    const combatAbilities = groupedAbilities.combat ?? [];
    const weapons = groupedItems.weapon ?? [];
    const armours = groupedItems.armour ?? [];
    const combat = _.concat(combatSkills, resistances, combatAbilities, weapons, armours);

    const customSkillsByGroup = _.groupBy(groupedSkills.custom ?? [], (skill) => skill.system.customGroupName);

    const equipment = groupedItems.equipment ?? [];

    return {
      abilities,
      armours,
      combat,
      combatAbilities,
      combatSkills,
      equipment,
      groupedItems,
      groupedSkillBySlug,
      groupedSkills,
      magic,
      magicAbilities,
      resistances,
      skills,
      skillsAndAbilities,
      weapons,
      customSkillsByGroup,
    };
  }
}
