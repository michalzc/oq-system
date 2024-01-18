import { WeaponsHands } from '../consts/items-config.js';

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
      shortName: commonStringModel(),
      group: commonStringModel(),
      customGroupName: commonStringModel(),
    };
  }
}

export class WeaponDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
      damageFormula: commonStringModel(true),
      hands: new fields.StringField({ required: true, initial: WeaponsHands.one, choices: WeaponsHands }),
      encumbrance: positiveNumberModel(false, undefined),
      ranged: new fields.BooleanField({ initial: false }),
      rangeFormula: commonStringModel(false),
      rate: positiveNumberModel(false, undefined),
      cost: positiveNumberModel(),
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
