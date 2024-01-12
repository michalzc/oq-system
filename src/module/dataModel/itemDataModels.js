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

export class SkillDataModel extends fields.ObjectField {
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

export class WeaponDataModel extends fields.ObjectField {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}

export class ArmorDataModel extends fields.ObjectField {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}

export class EquipmentDataModel extends fields.ObjectField {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}

export class SpellDataModel extends fields.ObjectField {
  static defineSchema() {
    return {
      description: htmlFieldModel(),
    };
  }
}
