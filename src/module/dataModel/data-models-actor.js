import _ from 'lodash-es';
import { npcCharacteristics, pcCharacteristics } from './default-characteristics.js';
import { convertLegacyResources, RECOVERED_EXCESS_LABEL_KEY } from '../utils/resource-points.js';

const fields = foundry.data.fields;

/**
 * @typedef {Object} DefaultCharacteristic
 * @property {number} value
 * @property {string} roll
 */

/**
 * @typedef {Object} DefaultCharacteristics
 * @property {DefaultCharacteristic} str
 * @property {DefaultCharacteristic} con
 * @property {DefaultCharacteristic} dex
 * @property {DefaultCharacteristic} siz
 * @property {DefaultCharacteristic} int
 * @property {DefaultCharacteristic} pow
 * @property {DefaultCharacteristic} cha
 */

/**
 *
 * @param {number} defaultValue
 * @param {string} defaultRoll
 * @returns {SchemaField}
 */
function characteristicModel(defaultValue, defaultRoll) {
  return new fields.SchemaField({
    base: new fields.NumberField({ min: 0, integer: true, required: true, initial: defaultValue }),
    roll: new fields.StringField({ trim: true, initial: defaultRoll, required: true }),
    mod: new fields.NumberField({ integer: true, required: true, initial: 0 }),
  });
}

/**
 *
 * @param {DefaultCharacteristics} defaults
 * @returns {SchemaField}
 */
function characteristicsModel(defaults) {
  return new fields.SchemaField(_.mapValues(defaults, (entry) => characteristicModel(entry.value, entry.roll)));
}

function modMaxValueFields() {
  return {
    mod: new fields.NumberField({ integer: true, required: true, initial: 0 }),
    max: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
    value: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  };
}

/**
 * Temporary-point pools of a resource, in grant order (FIFO). Remaining amounts have no upper cap.
 * @returns {ArrayField}
 */
function temporaryPoolsModel() {
  return new fields.ArrayField(
    new fields.SchemaField({
      id: new fields.StringField({ required: true, blank: false }),
      label: new fields.StringField({ required: true, trim: true, initial: '' }),
      remaining: new fields.NumberField({ required: true, nullable: false, min: 0, integer: true, initial: 0 }),
    }),
    { required: true, initial: () => [] },
  );
}

/** A resource with ordinary points up to the normal maximum and temporary points in pools. */
function resourceAttributeModel() {
  return new fields.SchemaField({
    ...modMaxValueFields(),
    pools: temporaryPoolsModel(),
  });
}

function baseModAttributeModel(base = 0) {
  return new fields.SchemaField({
    base: new fields.NumberField({ min: 0, integer: true, required: true, initial: base }),
    mod: new fields.NumberField({ integer: true, required: true, initial: 0 }),
  });
}

function stringModAttributeModel() {
  return new fields.SchemaField({
    mod: new fields.StringField({ trim: true, initial: '' }),
  });
}

function numAttributeModel() {
  return new fields.SchemaField({
    value: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  });
}

function characterAdditionalAttributes() {
  return {
    fn: numAttributeModel(),
    gr: numAttributeModel(),
  };
}

function initiative() {
  return new fields.SchemaField({
    reference: new fields.StringField({ required: true, trim: true, initial: '' }),
    mod: new fields.NumberField({ required: true, integer: true, initial: 0 }),
  });
}

function baseAttributesModel() {
  return {
    hp: resourceAttributeModel(),
    dm: stringModAttributeModel(),
    mp: resourceAttributeModel(),
    mr: baseModAttributeModel(15),
    ap: baseModAttributeModel(),
    initiative: initiative(),
  };
}

function npcAttributesModel() {
  return new fields.SchemaField(baseAttributesModel());
}

function characterAttributesModel() {
  return new fields.SchemaField({
    ...baseAttributesModel(),
    ...characterAdditionalAttributes(),
  });
}

function characterPersonalModel() {
  return new fields.SchemaField({
    gender: new fields.StringField({ trim: true, initial: '' }),
    age: new fields.NumberField({ min: 0, integer: true, required: false }),
    culture: new fields.StringField({ trim: true, initial: '' }),
    concept: new fields.StringField({ trim: true, initial: '' }),
    rank: new fields.StringField({ trim: true, initial: '' }),
    organisation: new fields.StringField({ trim: true, initial: '' }),
    notes: new fields.HTMLField({ trim: true, initial: '' }),
    money: new fields.ObjectField({ required: false, initial: () => ({}) }),
  });
}

function npcPersonalModel() {
  return new fields.SchemaField({
    description: new fields.HTMLField({ trim: true, initial: '' }),
    shortDescription: new fields.HTMLField({ trim: true, initial: '' }),
  });
}

class OQActorDataModel extends foundry.abstract.TypeDataModel {
  /**
   * HP and MP stored by versions before 0.9, without a pool list, are converted when a complete source is loaded:
   * world and compendium actors, and imported JSON. Updates and creation input are cleaned as partial data and
   * skipped, as their missing pool list says nothing about the stored one. Migrations 3 (HP) and 4 (MP) persist the
   * conversion for world documents.
   */
  static migrateData(source, options) {
    if (!options?.partial) {
      const label = game.i18n.localize(RECOVERED_EXCESS_LABEL_KEY);
      _.merge(source.attributes, convertLegacyResources(source.characteristics, source.attributes, label));
    }
    return super.migrateData(source, options);
  }

  /**
   * Characteristic values are the root of every other calculation, including the ones made by
   * embedded items while they prepare themselves. They have to be ready before that happens,
   * which means base data - items are prepared between base and derived data.
   *
   * `unmodified` is base plus the native modifier. `value` starts equal to it; the actor's base data preparation then
   * replaces it with the effective value, after effects.
   */
  /* override */
  prepareBaseData() {
    super.prepareBaseData();
    for (const characteristic of Object.values(this.characteristics)) {
      characteristic.unmodified = characteristic.base + characteristic.mod;
      characteristic.value = characteristic.unmodified;
    }
  }
}

export class CharacterDataModel extends OQActorDataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(pcCharacteristics),
      attributes: characterAttributesModel(),
      personal: characterPersonalModel(),
    };
  }
}

export class NpcDataModel extends OQActorDataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(npcCharacteristics),
      attributes: npcAttributesModel(),
      personal: npcPersonalModel(),
    };
  }
}
