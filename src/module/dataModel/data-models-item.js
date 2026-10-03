import { ItemConfig } from '../consts/items-config.js';
import _ from 'lodash-es';
import { renameLegacyField } from '../utils/utils.js';

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

class OQItemDataModel extends foundry.abstract.TypeDataModel {
  /**
   * Item images by `type`. When the type changes, an item still showing one of these images switches to the image of
   * the new type; a custom image is kept.
   * @type {Record<string, string>|null}
   */
  static typeIcons = null;

  /* override */
  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;

    const icons = this.constructor.typeIcons;
    const newType = changes.system?.type;
    const newIcon = icons?.[newType];
    if (newIcon && newType !== this.type && Object.values(icons).includes(this.parent.img)) {
      changes.img = newIcon;
    }
  }
}

export class SkillDataModel extends OQItemDataModel {
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

  static migrateData(source, options) {
    renameLegacyField(source, 'group', 'type');
    renameLegacyField(source, 'customGroupName', 'customTypeName');
    return super.migrateData(source, options);
  }
}

export class WeaponDataModel extends OQItemDataModel {
  static typeIcons = ItemConfig.weaponIcons;

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
      rate: new fields.StringField({ required: false, trim: true }),
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

  static migrateData(source, options) {
    renameLegacyField(source, 'weaponType', 'type');
    return super.migrateData(source, options);
  }
}

export class ArmorDataModel extends OQItemDataModel {
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

export class EquipmentDataModel extends OQItemDataModel {
  static typeIcons = ItemConfig.equipmentIcons;

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

  static migrateData(source, options) {
    renameLegacyField(source, 'consumable', 'type', (consumable) =>
      consumable ? ItemConfig.equipmentTypes.consumable : ItemConfig.equipmentTypes.single,
    );
    return super.migrateData(source, options);
  }
}

export class SpellDataModel extends OQItemDataModel {
  static typeIcons = ItemConfig.spellIcons;

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

export class SpecialAbilityDataModel extends OQItemDataModel {
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
