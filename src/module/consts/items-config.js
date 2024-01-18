import { OQSkill } from '../document/item/skill.js';
import { OQWeapon } from '../document/item/weapon.js';
import { OQArmour } from '../document/item/armor.js';
import { OQEquipment } from '../document/item/equipment.js';
import { OQSpell } from '../document/item/spell.js';
import { OQSpecialAbility } from '../document/item/special-ability.js';
import { OQSkillSheet } from '../sheet/item/skill-sheet.js';
import { OQWeaponSheet } from '../sheet/item/weapon-sheet.js';

export const ItemConfig = {
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
  },
  defaultIcons: {
    skill: 'systems/oq/assets/icons/skills.svg',
    weapon: 'systems/oq/assets/icons/spears.svg',
    armour: 'systems/oq/assets/icons/armor-vest.svg',
    equipment: 'systems/oq/assets/icons/toolbox.svg',
    spell: 'systems/oq/assets/icons/magic-swirl.svg',
    specialAbility: 'systems/oq/assets/icons/embrassed-energy.svg',
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
  itemSheetPartials: {
    skill: 'systems/oq/templates/item/parts/skill-sheet-details.hbs',
    weapon: 'systems/oq/templates/item/parts/weapon-sheet-details.hbs',
    // armour: 'systems/oq/templates/item/armor-sheet.html',
    // equipment: 'systems/oq/templates/item/equipment-sheet.html',
    // spell: 'systems/oq/templates/item/spell-sheet.html',
    // specialAbility: 'systems/oq/templates/item/special-ability-sheet.html',
  },
};
