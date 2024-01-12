import { OQCharacterActor } from './document/actor/characterActor.js';
import { OQNpcActor } from './document/actor/npcActor.js';
import { OQSkill } from './document/item/skill.js';
import { OQWeapon } from './document/item/weapon.js';
import { OQArmor } from './document/item/armor.js';
import { OQEquipment } from './document/item/equipment.js';
import { OQSpell } from './document/item/spell.js';

export const SYSTEM_ID = 'OQ';
export const SYSTEM_NAME = 'OQ System';

const SkillGroups = ['resistance', 'combat', 'knowledge', 'practical', 'magic', 'custom'];

export const DefaultCharacteristics = {
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
};

const Item = {
  documentClasses: {
    skill: OQSkill,
    weapon: OQWeapon,
    armor: OQArmor,
    equipment: OQEquipment,
    spell: OQSpell,
  },
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  Actor,
  Item,
  DefaultCharacteristics,
  SkillGroups,
};
