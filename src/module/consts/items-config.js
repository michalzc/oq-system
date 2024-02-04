import { OQSkill } from '../document/item/skill.js';
import { OQWeapon } from '../document/item/weapon.js';
import { OQArmour } from '../document/item/armor.js';
import { OQEquipment } from '../document/item/equipment.js';
import { OQSpell } from '../document/item/spell.js';
import { OQSpecialAbility } from '../document/item/special-ability.js';
import { OQSkillSheet } from '../application/sheet/item/skill-sheet.js';
import { OQWeaponSheet } from '../application/sheet/item/weapon-sheet.js';
import { OQArmourSheet } from '../application/sheet/item/armour-sheet.js';
import { OQEquipmentSheet } from '../application/sheet/item/equipment-sheet.js';
import { OQSpellSheet } from '../application/sheet/item/spell-sheet.js';

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
  },
  defaultIcons: {
    skill: 'systems/oq/assets/icons/skills.svg',
    weapon: 'systems/oq/assets/icons/two-handed-sword.svg',
    armour: 'systems/oq/assets/icons/armor-vest.svg',
    equipment: 'systems/oq/assets/icons/toolbox.svg',
    spell: 'systems/oq/assets/icons/magic-swirl.svg',
    specialAbility: 'systems/oq/assets/icons/embrassed-energy.svg',
  },
  weaponIcons: {
    melee: 'systems/oq/assets/icons/two-handed-sword.svg',
    ranged: 'systems/oq/assets/icons/crossbow.svg',
    shield: 'systems/oq/assets/icons/checked-shield.svg',
  },
  skillGroups: {
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
    // specialAbility: 'systems/oq/templates/item/special-ability-sheet.html',
  },
  spellsTypes: {
    personal: 'personal',
    divine: 'divine',
    sorcery: 'sorcery',
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
};
