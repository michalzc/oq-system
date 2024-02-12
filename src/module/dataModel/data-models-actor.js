import _ from 'lodash-es';
import { npcCharacteristics, pcCharacteristics } from './default-characteristics.js';

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

function modMaxValueAttributeModel() {
  return new fields.SchemaField({
    mod: new fields.NumberField({ integer: true, required: true, initial: 0 }),
    max: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
    value: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
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
  return new fields.SchemaField(
    {
      reference: new fields.StringField({ required: true, trim: '' }),
      mod: new fields.NumberField({ required: true, integer: true }),
    },
    { required: false },
  );
}

function baseAttributesModel() {
  return {
    hp: modMaxValueAttributeModel(),
    dm: stringModAttributeModel(),
    mp: modMaxValueAttributeModel(),
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
  });
}

function npcPersonalModel() {
  return new fields.SchemaField({
    description: new fields.HTMLField({ trim: true, initial: '' }),
    shortDescription: new fields.HTMLField({ trim: true, initial: '' }),
  });
}

export class CharacterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(pcCharacteristics),
      attributes: characterAttributesModel(),
      personal: characterPersonalModel(),
    };
  }
}

export class NpcDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(npcCharacteristics),
      attributes: npcAttributesModel(),
      personal: npcPersonalModel(),
    };
  }
}
