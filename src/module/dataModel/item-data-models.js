const fields = foundry.data.fields;

function commonStringModel() {
  return new fields.StringField({ trim: true, initial: '' });
}

function positiveNumberModel() {
  return new fields.NumberField({ min: 0, integer: true, required: true, initial: 0 });
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
