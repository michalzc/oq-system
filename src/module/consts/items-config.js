import { OQSkill } from '../document/item/skill.js';
import { OQWeapon } from '../document/item/weapon.js';
import { OQArmour } from '../document/item/armor.js';
import { OQEquipment } from '../document/item/equipment.js';
import { OQSpell } from '../document/item/spell.js';
import { OQSpecialAbility } from '../document/item/special-ability.js';
import { OQSkillSheet } from '../sheet/item/skill-sheet.js';
import { OQWeaponSheet } from '../sheet/item/weapon-sheet.js';
import { OQArmourSheet } from '../sheet/item/armour-sheet.js';
import { OQEquipmentSheet } from '../sheet/item/equipment-sheet.js';
import { OQSpellSheet } from '../sheet/item/spell-sheet.js';
import { OQSpecialAbilitySheet } from '../sheet/item/special-ability-sheet.js';

const allItemsStates = {
  stored: {
    key: 'stored',
    icon: '<i class="fas fa-archive"></i>',
  },
  carried: {
    key: 'carried',
    icon: '<i class="fas fa-suitcase"></i>',
  },
  readied: {
    key: 'readied',
    icon: '<i class="fas fa-hand-paper"></i>',
  },
  worn: {
    key: 'worn',
    icon: '<i class="fas fa-t-shirt"></i>',
  },
  natural: {
    key: 'natural',
    icon: '<i class="fas fa-paw-claws"></i>',
  },
};
export const ItemConfig = {
  bagIcon: 'icons/svg/item-bag.svg',
  itemTypes: {
    skill: 'skill',
    weapon: 'weapon',
    armour: 'armour',
    equipment: 'equipment',
    spell: 'spell',
    specialAbility: 'specialAbility',
  },
  documentClasses: {
    skill: OQSkill,
    weapon: OQWeapon,
    armour: OQArmour,
    equipment: OQEquipment,
    spell: OQSpell,
    specialAbility: OQSpecialAbility,
  },
  sheetClasses: {
    skill: OQSkillSheet,
    weapon: OQWeaponSheet,
    armour: OQArmourSheet,
    equipment: OQEquipmentSheet,
    spell: OQSpellSheet,
    specialAbility: OQSpecialAbilitySheet,
  },
  defaultIcons: {
    skill: 'systems/oq/assets/icons/themed/skills.svg',
    weapon: 'systems/oq/assets/icons/themed/two-handed-sword.svg',
    armour: 'systems/oq/assets/icons/themed/armor-vest.svg',
    equipment: 'systems/oq/assets/icons/themed/jigsaw-box.svg',
    spell: 'systems/oq/assets/icons/themed/magic-swirl.svg',
    specialAbility: 'systems/oq/assets/icons/themed/embrassed-energy.svg',
  },
  weaponIcons: {
    melee: 'systems/oq/assets/icons/themed/two-handed-sword.svg',
    ranged: 'systems/oq/assets/icons/themed/crossbow.svg',
    shield: 'systems/oq/assets/icons/themed/checked-shield.svg',
  },
  equipmentIcons: {
    single: 'systems/oq/assets/icons/themed/jigsaw-box.svg',
    consumable: 'systems/oq/assets/icons/themed/swap-bag.svg',
    ammunition: 'systems/oq/assets/icons/themed/quiver.svg',
    unused: 'systems/oq/assets/icons/themed/toolbox.svg',
  },
  spellIcons: {
    personal: 'systems/oq/assets/icons/themed/magic-swirl.svg',
    divine: 'systems/oq/assets/icons/themed/divided-spiral.svg',
    sorcery: 'systems/oq/assets/icons/themed/ink-swirl.svg',
  },
  skillTypes: {
    resistance: 'resistance',
    combat: 'combat',
    knowledge: 'knowledge',
    practical: 'practical',
    magic: 'magic',
    custom: 'custom',
  },
  weaponHands: {
    one: 'one',
    two: 'two',
    oneAndTwo: 'oneAndTwo',
  },
  allItemsStates,
  weaponStates: {
    readied: allItemsStates.readied,
    carried: allItemsStates.carried,
    stored: allItemsStates.stored,
    natural: allItemsStates.natural,
  },
  armourStates: {
    worn: allItemsStates.worn,
    carried: allItemsStates.carried,
    stored: allItemsStates.stored,
    natural: allItemsStates.natural,
  },
  equipmentStates: {
    readied: allItemsStates.readied,
    carried: allItemsStates.carried,
    stored: allItemsStates.stored,
  },
  weaponType: {
    melee: 'melee',
    ranged: 'ranged',
    shield: 'shield',
  },
  itemSheetPartials: {
    skill: 'systems/oq/templates/item/parts/skill-sheet-details.hbs',
    weapon: 'systems/oq/templates/item/parts/weapon-sheet-details.hbs',
    armour: 'systems/oq/templates/item/parts/armour-sheet-details.hbs',
    equipment: 'systems/oq/templates/item/parts/equipment-sheet-details.hbs',
    spell: 'systems/oq/templates/item/parts/spell-sheet-details.hbs',
    specialAbility: 'systems/oq/templates/item/parts/special-ability-details.hbs',
  },
  spellsTypes: {
    personal: 'personal',
    divine: 'divine',
    sorcery: 'sorcery',
    custom: 'custom',
  },

  spellTraits: {
    personal: ['area', 'concentration', 'instant', 'magnitude', 'nonVariable', 'permanent', 'resist', 'touch'],
    divine: [
      'area',
      'common',
      'concentration',
      'duration',
      'instant',
      'magnitude',
      'nonVariable',
      'permanent',
      'progressive',
      'ranged',
      'resist',
      'touch',
      'variable',
    ],
    sorcery: ['concentration', 'instant', 'permanent', 'resist', 'touch'],
  },
  specialAbilityType: {
    general: 'general',
    magic: 'magic',
    combat: 'combat',
  },
  equipmentTypes: {
    ammunition: 'ammunition',
    consumable: 'consumable',
    single: 'single',
  },
};
