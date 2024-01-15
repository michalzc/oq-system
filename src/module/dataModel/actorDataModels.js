const fields = foundry.data.fields;

function characteristicModel() {
  return new fields.SchemaField({
    base: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
    roll: new fields.StringField({ trim: true, initial: '', required: true }),
    mod: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  });
}

function characteristicsModel() {
  return new fields.SchemaField({
    str: characteristicModel(),
    dex: characteristicModel(),
    con: characteristicModel(),
    siz: characteristicModel(),
    int: characteristicModel(),
    pow: characteristicModel(),
    cha: characteristicModel(),
  });
}

function modMaxValueAttributeModel() {
  return new fields.SchemaField({
    mod: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
    max: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
    value: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  });
}

function baseModAttributeModel(base = 0) {
  return new fields.SchemaField({
    base: new fields.NumberField({ min: 0, integer: true, required: true, initial: base }),
    mod: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  });
}

function stringModAttributeModel() {
  return new fields.SchemaField({
    mod: new fields.StringField({ trim: true, initial: '' }),
  });
}

const characterAdditionalAttributes = {
  fn: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
  gr: new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 }),
};

const baseAttributesModel = {
  hp: modMaxValueAttributeModel(),
  dm: stringModAttributeModel(),
  mp: modMaxValueAttributeModel(),
  mr: baseModAttributeModel(15),
  ap: baseModAttributeModel(),
};

function npcAttributesModel() {
  return new fields.SchemaField(baseAttributesModel);
}

function characterAttributesModel() {
  return new fields.SchemaField({
    ...baseAttributesModel,
    ...characterAdditionalAttributes,
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
    description: new fields.StringField({ trim: true, initial: '' }),
  });
}

export class CharacterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(),
      attributes: characterAttributesModel(),
      personal: characterPersonalModel(),
    };
  }
}

export class NpcDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsModel(),
      attributes: npcAttributesModel(),
      personal: npcPersonalModel(),
    };
  }
}
