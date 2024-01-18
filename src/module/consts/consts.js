import { OQCharacterActor } from '../document/actor/character-actor.js';
import { OQNpcActor } from '../document/actor/npc-actor.js';
import { OQSkill } from '../document/item/skill.js';
import { OQWeapon } from '../document/item/weapon.js';
import { OQArmor } from '../document/item/armor.js';
import { OQEquipment } from '../document/item/equipment.js';
import { OQSpell } from '../document/item/spell.js';
import { OQCharacterSheet } from '../sheet/actor/character-sheet.js';
import { OQNpcSheet } from '../sheet/actor/npc-sheet.js';
import { OQSkillSheet } from '../sheet/item/skill-sheet.js';
import { OQSpecialAbility } from '../document/item/specialAbility.js';
import { BaseRollFormula, DifficultyLevels, RollResults } from './rolls.js';
import { SkillGroups } from './items.js';
import { OQWeaponSheet } from '../sheet/item/weapon-sheet.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

//FIXME: delete after fixing rolls
const CharacteristicsParams = {
  characteristicsRolls: {
    str: '3d6',
    dex: '3d6',
    con: '3d6',
    siz: '2d6+6',
    int: '2d6+6',
    pow: '3d6',
    cha: '3d6',
  },
  characteristicPoints: 30,
  basePoints: 56,
  damageModifiers: [
    { key: 10, value: '-1d6' },
    { key: 15, value: '-1d4' },
    { key: 25, value: '0' },
    { key: 30, value: '+1d4' },
  ],
  damageModifierFunction: function (value) {
    const tableVal = this.damageModifiers.find((kv) => value <= kv.key);
    if (tableVal) {
      return tableVal.value;
    } else {
      const mul = Math.floor((value - 16) / 15);
      return `+${mul}d6`;
    }
  },
};

const Actor = {
  documentClasses: {
    character: OQCharacterActor,
    npc: OQNpcActor,
  },
  sheetClasses: {
    character: OQCharacterSheet,
    npc: OQNpcSheet,
  },
};

const Item = {
  documentClasses: {
    skill: OQSkill,
    weapon: OQWeapon,
    armor: OQArmor,
    equipment: OQEquipment,
    spell: OQSpell,
    specialAbility: OQSpecialAbility,
  },
  sheetClasses: {
    skill: OQSkillSheet,
    weapon: OQWeaponSheet,
  },
};

const SettingKeys = {
  masterNeverThrows: {
    key: 'masterNeverThrows',
    localizationKey: 'MasterNeverThrows',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
    requiresReload: false,
  },
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  Actor,
  Item,
  CharacteristicsParams,
  SkillGroups,
  DifficultyLevels,
  BaseRollFormula,
  SettingKeys,
  RollResults,
};
