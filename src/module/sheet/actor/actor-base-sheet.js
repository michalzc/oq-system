import _ from 'lodash-es';
import { AttributesDialog } from '../../application/attributes-dialog.js';
import { TemporaryPointsDialog } from '../../application/temporary-points-dialog.js';
import { OQBaseActor } from '../../document/actor/base-actor.js';
import { OQActiveEffect } from '../../document/active-effect.js';
import { OQSpell } from '../../document/item/spell.js';
import { formatContribution } from '../../utils/effect-contributions.js';
import { getInitiativeOptions } from '../../utils/initiative.js';
import { customSpellGroups } from '../../utils/magic.js';
import {
  asyncFlattenItemsFromFolder,
  inRangeValue,
  renderTemplate,
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
      regainSpell: OQActorBaseSheet.onRegainSpell,
      regainAllSpells: OQActorBaseSheet.onRegainAllSpells,
      rollDamage: OQActorBaseSheet.onDamageRoll,
      itemToChat: OQActorBaseSheet.onItemToChat,
      changeQuantity: OQActorBaseSheet.onItemQuantityIncreaseDecrease,
      modifyAttributes: OQActorBaseSheet.onModifyAttributes,
      editTemporaryPoints: OQActorBaseSheet.onEditTemporaryPoints,
      addEffect: OQActorBaseSheet.onAddEffect,
      editEffect: OQActorBaseSheet.onEditEffect,
      deleteEffect: OQActorBaseSheet.onDeleteEffect,
      toggleEffect: OQActorBaseSheet.onToggleEffect,
      toggleEffectRulesText: OQActorBaseSheet.onToggleEffectRulesText,
      // Left click raises the value, right click lowers it.
      adjustResource: { handler: OQActorBaseSheet.onUpdateResource, buttons: [0, 2] },
    },
  };

  /** IDs of effects whose rules text is expanded in the effects list; kept across re-renders. */
  #expandedEffects = new Set();

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
      effects: await this.prepareEffects(),
      effectTooltips: await this.prepareEffectTooltips(),
      ...this.prepareSpentSpells(),
    });
  }

  /**
   * The spell types with spent spells that can be regained, and whether there are any.
   * @returns {{spentSpellTypes: Object<string, boolean>, hasSpentSpells: boolean}}
   */
  prepareSpentSpells() {
    const spentSpells = this.actor.items.filter((item) => item.type === 'spell' && item.spent);
    return {
      spentSpellTypes: _.fromPairs(spentSpells.map((spell) => [spell.system.type, true])),
      hasSpentSpells: spentSpells.length > 0,
    };
  }

  async enrichHTML(content) {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(content, {
      secrets: this.actor.isOwner,
      relativeTo: this.actor,
    });
  }

  /**
   * The actor's own effects for the effects list, enabled or not. On an unlinked token's sheet these are the token's.
   * @returns {Promise<object[]>}
   */
  async prepareEffects() {
    const effects = _.sortBy(this.actor.effects.contents, (effect) => effect.name);
    return Promise.all(
      effects.map(async (effect) => {
        const entry = effect.listEntry;
        const expanded = this.#expandedEffects.has(effect.id);
        return {
          ...entry,
          id: effect.id,
          expanded,
          enrichedRulesText: expanded && entry.rulesText ? await this.enrichHTML(entry.rulesText) : '',
        };
      }),
    );
  }

  /**
   * Tooltips listing the effects that changed an attribute and by how much, keyed by attribute. An attribute without
   * a tooltip is not changed by effects.
   * @returns {Promise<Object<string, string>>}
   */
  async prepareEffectTooltips() {
    const attributes = withAttributeLabels(this.actor.system.attributes);
    const tooltips = await Promise.all(
      ['mr', 'ap']
        .filter((key) => attributes[key].effects)
        .map(async (key) => {
          const { effects, label } = attributes[key];
          const html = await renderTemplate('systems/oq/templates/actor/parts/effect-contributions-tooltip.hbs', {
            ...effects,
            label,
            contributions: effects.contributions.map((contribution) => ({
              ...contribution,
              amount: formatContribution(contribution),
              minimumLabel:
                contribution.minimum === undefined
                  ? ''
                  : game.i18n.format('OQ.Effects.MinimumOf', { minimum: contribution.minimum }),
            })),
          });
          return [key, html];
        }),
    );
    return Object.fromEntries(tooltips);
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

    // Fixed menus open in the document body, so they aren't clipped by the scrolling tab or stretch its content.
    new foundry.applications.ux.ContextMenu.implementation(this.element, selector, elems, {
      eventName: 'click',
      fixed: true,
      relative: 'target',
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
    // Ordinary HP has no name either: typing sets it through the actor, clamped, without touching temporary HP.
    if (event.target.matches('.ordinary-hp')) {
      if (this.isEditable) return this.onSetOrdinaryHp(event);
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
    const { skillTypes, spellsTypes } = CONFIG.OQ.ItemConfig;
    const isCustomType = systemType === skillTypes.custom || systemType === spellsTypes.custom;
    const customTypeName = (isCustomType && dataset.customTypeName) || '';
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

  async onSetOrdinaryHp(event) {
    const typed = Number(event.target.value);
    if (event.target.value.trim() !== '' && Number.isFinite(typed)) await this.actor.setOrdinaryHp(Math.trunc(typed));
    // A value clamped to the stored one changes nothing, so nothing re-renders the field: show the stored value.
    if (Number(event.target.value) !== this.actor.system.attributes.hp.value) this.render();
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

  static onEditTemporaryPoints(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    return TemporaryPointsDialog.open(this.actor, { resource: target.dataset.resourceId });
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

  getEffectFromElement(element) {
    const effectId = element.closest('[data-effect-id]')?.dataset.effectId;
    return effectId ? this.actor.effects.get(effectId) : undefined;
  }

  static async onAddEffect(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    await OQActiveEffect.createOnActor(this.actor);
  }

  static onEditEffect(event, target) {
    event.preventDefault();
    // Viewers get the effect editor in read-only mode.
    this.getEffectFromElement(target)?.sheet.render(true);
  }

  static async onDeleteEffect(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const effect = this.getEffectFromElement(target);
    if (effect) await effect.delete();
  }

  static async onToggleEffect(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const effect = this.getEffectFromElement(target);
    if (effect) await effect.update({ disabled: !effect.disabled });
  }

  static onToggleEffectRulesText(event, target) {
    event.preventDefault();
    const effect = this.getEffectFromElement(target);
    if (!effect) return;
    if (this.#expandedEffects.has(effect.id)) this.#expandedEffects.delete(effect.id);
    else this.#expandedEffects.add(effect.id);
    return this.render();
  }

  static async onItemTestRoll(event, target) {
    event.preventDefault();
    if (!this.actor.isOwner) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.rollItemTest(event.shiftKey);
    }
  }

  static async onRegainSpell(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const item = this.getItemFromElement(target);
    if (item) {
      await item.regainDivineSpell();
    }
  }

  static async onRegainAllSpells(event, target) {
    event.preventDefault();
    if (!this.isEditable) return;
    const { spellType, customTypeName } = target.dataset;
    await OQSpell.regainAllDivineSpells(this.actor, spellType, customTypeName);
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
    // HP: +1 heals ordinary HP only, -1 is damage and takes temporary HP first.
    if (resourceId === 'hp') return delta > 0 ? this.actor.healHp(1) : this.actor.damageHp(1);
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
    // Custom type spells are listed in their own groups, after the other spells.
    const [customSpells, spells] = _.partition(
      groupedItems.spell ?? [],
      (spell) => spell.system.type === CONFIG.OQ.ItemConfig.spellsTypes.custom,
    );
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
      customSpellGroups: customSpellGroups(customSpells),
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
