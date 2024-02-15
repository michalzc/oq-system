import { ItemConfig } from '../consts/items-config.js';
import _ from 'lodash-es';

const fields = foundry.data.fields;

function commonStringModel(required = false) {
  return new fields.StringField({ trim: true, initial: '', required });
}

function positiveNumberModel(require = true, initial = 0) {
  return new fields.NumberField({ min: 0, integer: true, require, initial });
}

function htmlFieldModel() {
  return new fields.HTMLField({ trim: true, initial: '' });
}

function encumbranceModel() {
  return new fields.NumberField({ min: 0, integer: false, initial: 0 });
}

export class SkillDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      formula: commonStringModel(),
      mod: positiveNumberModel(),
      group: commonStringModel(),
      customGroupName: commonStringModel(),
      advancement: positiveNumberModel(),
    };
  }
}

export class WeaponDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      correspondingSkill: new fields.SchemaField({
        skillReference: new fields.StringField({ required: false, trim: true }),
        skillMod: new fields.NumberField({ required: false, integer: true }),
      }),
      hands: new fields.StringField({
        required: true,
        initial: ItemConfig.weaponHands.one,
        choices: ItemConfig.weaponHands,
      }),
      encumbrance: encumbranceModel(),
      ranged: new fields.BooleanField({ initial: false }),
      rangeFormula: commonStringModel(false),
      rate: positiveNumberModel(false, undefined),
      cost: positiveNumberModel(),
      state: new fields.StringField({
        required: true,
        initial: ItemConfig.weaponStates.carried.key,
        choices: _.keys(ItemConfig.weaponStates),
        trim: true,
      }),
      weaponType: new fields.StringField({
        required: true,
        initial: ItemConfig.weaponType.melee,
        choices: ItemConfig.weaponType,
        trim: true,
      }),
      traits: new fields.ArrayField(commonStringModel(), {
        required: false,
        initial: [],
      }),
      damage: new fields.SchemaField({
        damageFormula: commonStringModel(true),
        includeDamageMod: new fields.BooleanField({ initial: true, required: true }),
      }),
    };
  }
}

export class ArmorDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      ap: positiveNumberModel(true, 0),
      cost: positiveNumberModel(true, 0),
      encumbrance: encumbranceModel(),
      description: htmlFieldModel(),
      state: new fields.StringField({
        required: true,
        initial: ItemConfig.armourStates.worn.key,
        choices: _.keys(ItemConfig.armourStates),
        trim: true,
      }),
    };
  }
}

export class EquipmentDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      cost: positiveNumberModel(true, 0),
      encumbrance: encumbranceModel(),
      consumable: new fields.BooleanField({ required: true, initial: false }),
      quantity: positiveNumberModel(false),
      state: new fields.StringField({
        required: true,
        initial: ItemConfig.armourStates.carried.key,
        choices: _.keys(ItemConfig.equipmentStates),
        trim: true,
      }),
    };
  }
}

export class SpellDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      magnitude: positiveNumberModel(),
      nonVariant: new fields.BooleanField({ required: true, initial: false }),
      type: new fields.StringField({
        required: true,
        trim: true,
        choices: _.keys(ItemConfig.spellsTypes),
        initial: ItemConfig.spellsTypes.personal,
      }),
      traits: new fields.ArrayField(commonStringModel(), {
        nullable: false,
        required: false,
        initial: [],
      }),
      description: htmlFieldModel(),
    };
  }
}

export class SpecialAbilityDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      traits: new fields.ArrayField(commonStringModel(), {
        nullable: false,
        required: false,
        initial: [],
      }),
      formula: commonStringModel(),
      damageFormula: commonStringModel(),
      type: new fields.StringField({
        required: true,
        trim: true,
        initial: ItemConfig.specialAbilityType.general,
        choices: _.keys(ItemConfig.specialAbilityType),
      }),
    };
  }
}
