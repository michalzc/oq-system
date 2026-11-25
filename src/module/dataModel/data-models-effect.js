const fields = foundry.data.fields;

/**
 * System data of every Active Effect. Extends the core change schema, so `type`, `phase` and `priority` keep their core
 * definitions and changes stored before v0.9 load and save untouched. OpenQuest fields are added by the chunk that
 * first needs them.
 */
export class OQEffectDataModel extends foundry.data.ActiveEffectTypeDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      // Readable text, so it survives the deletion of whatever the effect came from.
      sourceName: new fields.StringField({ trim: true, initial: '' }),
    };
  }
}
