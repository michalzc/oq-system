import _ from 'lodash-es';
import { AttributesDialog } from '../../application/attributes-dialog.js';
import { OQBaseActor } from '../../document/actor/base-actor.js';
import { getInitiativeOptions } from '../../utils/initiative.js';
import {
  asyncFlattenItemsFromFolder,
  inRangeValue,
  withAttributeLabels,
  withCharacteristicLabels,
} from '../../utils/utils.js';

export class OQActorBaseSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2,
) {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the sheets support both colour schemes.
    classes: ['oq', 'sheet', 'actor', 'themed', 'theme-light'],
    position: { width: 900, height: 1024 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      addItem: OQActorBaseSheet.onAddNewItem,
      editItem: OQActorBaseSheet.onModifyItem,
      deleteItem: OQActorBaseSheet.onDeleteItem,
      rollItem: OQActorBaseSheet.onItemTestRoll,
      rollDamage: OQActorBaseSheet.onDamageRoll,
      itemToChat: OQActorBaseSheet.onItemToChat,
      changeQuantity: OQActorBaseSheet.onItemQuantityIncreaseDecrease,
      modifyAttributes: OQActorBaseSheet.onModifyAttributes,
      // Left click raises the value, right click lowers it.
      adjustResource: { handler: OQActorBaseSheet.onUpdateResource, buttons: [0, 2] },
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;
    return Object.assign(context, {
      actor: this.actor,
      system,
      characteristics: withCharacteristicLabels(system.characteristics),
      attributes: withAttributeLabels(system.attributes),
      initiativeOptions: this.getInitiativeOptions(),
      groupedItems: this.prepareGroupedItems(),
      itemTooltips: await this.prepareItemTooltips(),
    });
  }

  async enrichHTML(content) {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(content, {
      secrets: this.actor.isOwner,
      relativeTo: this.actor,
    });
  }

  async prepareItemTooltips() {
    const tooltips = await Promise.all(
      this.actor.items.map(async (item) => [item.id, await item.getTooltipWithTraits()]),
    );
    return _.fromPairs(tooltips);
  }

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    // Bound once to the application element; the menus find their targets when opened, so they survive re-renders.
    this.statusMenu(CONFIG.OQ.ItemConfig.weaponStates, '.item-state-weapon');
    this.statusMenu(CONFIG.OQ.ItemConfig.armourStates, '.item-state-armour');
    this.statusMenu(CONFIG.OQ.ItemConfig.equipmentStates, '.item-state-equipment');
  }

  statusMenu(statuses, selector) {
    const elems = _.map(statuses, (elem, key) => ({
      label: `OQ.Labels.ItemStates.${key}`,
      icon: elem.icon,
      visible: () => this.isEditable,
      onClick: (event, target) => this.onItemUpdateState(key, target),
    }));

    new foundry.applications.ux.ContextMenu.implementation(this.element, selector, elems, {
      eventName: 'click',
      jQuery: false,
    });
  }

  _onChangeForm(formConfig, event) {
    // Inputs of embedded items have no name, so they are left out of the actor's form data and update the item instead.
    if (event.target.matches('.item-adv')) {
      if (this.isEditable) return this.onUpdateItemAdv(event);
      return;
    }
    if (event.target.matches('.item-quantity-value')) {
      if (this.isEditable) return this.onItemUpdateQuantity(event);
      return;
    }
    return super._onChangeForm(formConfig, event);
  }

  async _onDropFolder(event, folder) {
    if (!this.actor.isOwner || folder.type !== 'Item') return null;
    const content = await asyncFlattenItemsFromFolder(folder);
    if (content.length) await this.actor.createEmbeddedDocuments('Item', content);
    return folder;
  }

  getItemFromElement(element) {
    const itemId = element.closest('[data-item-id]')?.dataset.itemId;
    return itemId ? this.actor.items.get(itemId) : undefined;
  }

  static async onAddNewItem(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const dataset = target.dataset;
    const type = dataset.type;
    const systemType = dataset.systemType;
    const customTypeName = (systemType === CONFIG.OQ.ItemConfig.skillTypes.custom && dataset.customTypeName) || '';
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
    const input = event.target;
    const item = this.getItemFromElement(input);
    if (item) await item.update({ 'system.quantity': input.value });
  }

  static async onItemQuantityIncreaseDecrease(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const item = this.getItemFromElement(target);
    if (item) {
      const currentValue = item.system.quantity ?? 0;
      const updateValue = parseInt(target.dataset.value);
      const newValue = Math.max(0, currentValue + updateValue);
      if (newValue !== currentValue) await item.update({ 'system.quantity': newValue });
    }
  }

  async onItemUpdateState(state, elem) {
    if (!this.isEditable) return;
    const item = this.getItemFromElement(elem);
    if (item) await item.update({ 'system.state': state });
  }

  static onModifyAttributes(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    return AttributesDialog.open(this.actor);
  }

  async onUpdateItemAdv(event) {
    event.preventDefault();

    const targetElem = event.target;
    const item = this.getItemFromElement(targetElem);
    if (item) {
      const value = parseInt(targetElem.value);
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

  static onModifyItem(event, target) {
    event.preventDefault();
    // Viewers get the item sheet in read-only mode.
    const item = this.getItemFromElement(target);
    if (item) {
      item.sheet.render(true);
    }
  }

  static async onDeleteItem(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.delete();
    }
  }

  static async onItemTestRoll(event, target) {
    event.preventDefault();
    if (!this.actor.isOwner) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.rollItemTest(event.shiftKey);
    }
  }

  static async onDamageRoll(event, target) {
    event.preventDefault();
    if (!this.actor.isOwner) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.rollItemDamage(!event.shiftKey);
    }
  }

  static async onItemToChat(event, target) {
    event.preventDefault();
    if (!this.actor.isOwner) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.sendItemToChat();
    }
  }

  static async onUpdateResource(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;

    const delta = event.button === 2 ? -1 : 1;
    const resourceId = target.dataset.resourceId;
    const { value, max } = this.actor.system.attributes[resourceId];
    const newValue = inRangeValue(0, max, value + delta);

    if (newValue !== value) await this.actor.update({ [`system.attributes.${resourceId}.value`]: newValue });
  }

  getInitiativeOptions() {
    return getInitiativeOptions(this.actor);
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
