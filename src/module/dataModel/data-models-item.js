import { ItemConfig } from '../consts/items-config.js';
import _ from 'lodash-es';

const fields = foundry.data.fields;

function commonStringModel(required = false) {
  return new fields.StringField({ trim: true, initial: '', required });
}

function positiveNumberModel(required = true, initial = 0) {
  return new fields.NumberField({ min: 0, integer: false, required: required, initial: initial });
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
      type: commonStringModel(),
      customTypeName: commonStringModel(),
      advancement: positiveNumberModel(),
    };
  }

  static migrateData(source) {
    const group = source.group;
    const customGroupName = source.customGroupName;
    const updatedSource =
      group || customGroupName
        ? _.merge(source, {
            group: null,
            customGroupName: null,
            type: group,
            customTypeName: customGroupName,
          })
        : source;

    return super.migrateData(updatedSource);
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
      rangeFormula: commonStringModel(false),
      rate: positiveNumberModel(false, undefined),
      cost: positiveNumberModel(),
      state: new fields.StringField({
        required: true,
        initial: ItemConfig.weaponStates.carried.key,
        choices: _.keys(ItemConfig.weaponStates),
        trim: true,
      }),
      type: new fields.StringField({
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

  static migrateData(source) {
    if (source.weaponType !== undefined) {
      _.merge(source, {
        type: source.weaponType,
      });
    }
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
      quantity: positiveNumberModel(false, 1),
      state: new fields.StringField({
        required: true,
        initial: ItemConfig.armourStates.carried.key,
        choices: _.keys(ItemConfig.equipmentStates),
        trim: true,
      }),
      type: new fields.StringField({
        required: true,
        initial: ItemConfig.equipmentTypes.single,
        choices: _.keys(ItemConfig.equipmentTypes),
        trim: true,
      }),
      traits: new fields.ArrayField(commonStringModel(), {
        required: false,
        initial: [],
      }),
    };
  }

  static migrateData(source) {
    if (source.consumable !== undefined) {
      _.merge(source, {
        type: source.consumable ? ItemConfig.equipmentTypes.consumable : ItemConfig.equipmentTypes.single,
      });
    }
  }
}

export class SpellDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      magnitude: positiveNumberModel(),
      remainingMagnitude: positiveNumberModel(),
      nonVariant: new fields.BooleanField({ required: true, initial: false }),
      noMagicPoints: new fields.BooleanField({ required: true, initial: false }),
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
      skillReference: new fields.StringField({ required: false, trim: true }),
    };
  }

  get hasSplitDivineCasting() {
    return this.noMagicPoints && !this.nonVariant;
  }

  get expended() {
    return this.noMagicPoints && this.remainingMagnitude === 0;
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
