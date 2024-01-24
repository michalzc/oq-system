import { ItemConfig } from '../consts/items-config.js';

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

export class SkillDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      formula: commonStringModel(),
      mod: positiveNumberModel(),
      group: commonStringModel(),
      customGroupName: commonStringModel(),
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
      encumbrance: positiveNumberModel(false, undefined),
      ranged: new fields.BooleanField({ initial: false }),
      rangeFormula: commonStringModel(false),
      rate: positiveNumberModel(false, undefined),
      cost: positiveNumberModel(),
      status: new fields.StringField({
        required: true,
        initial: ItemConfig.weaponArmourStatus.stowed,
        choices: ItemConfig.weaponArmourStatus,
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
      description: htmlFieldModel(),
    };
  }
}

export class EquipmentDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}

export class SpellDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}

export class SpecialAbilityDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}
