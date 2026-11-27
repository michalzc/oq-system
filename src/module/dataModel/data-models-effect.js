import { EFFECT_ROLES } from '../utils/effect-contributions.js';

const fields = foundry.data.fields;

/**
 * System data of every Active Effect. Extends the core change schema, so `type`, `phase` and `priority` keep their core
 * definitions and changes stored before v0.9 load and save untouched. OpenQuest fields are added by the chunk that
 * first needs them.
 *
 * An OpenQuest change names a `target` from the curated vocabulary (`EFFECT_TARGETS` in `utils/effect-contributions.js`)
 * and uses `type` as its operation, `value` as its amount and, where the target allows it, `minimum` as the floor of the
 * effective value. Its `key` stays blank, so core key-path application
 * ignores it. Changes without a target are macro or module changes and keep core behaviour.
 */
export class OQEffectDataModel extends foundry.data.ActiveEffectTypeDataModel {
  static defineSchema() {
    const schema = super.defineSchema();
    // Adopt core's own change fields, including its private type validator. The schema they came from is thrown
    // away, and a field with a parent may not join another schema.
    const coreChangeFields = schema.changes.element.fields;
    for (const field of Object.values(coreChangeFields)) field.parent = undefined;
    return {
      ...schema,
      changes: new fields.ArrayField(
        new fields.SchemaField({
          ...coreChangeFields,
          // No initial value, so changes stored without a target are saved back without one.
          target: new fields.StringField({ required: false, blank: true }),
          // The rule's floor for the effective value (Slow: 1m), on targets that allow one. Absent when not set.
          minimum: new fields.NumberField({ required: false, nullable: true }),
        }),
      ),
      // Readable text, so it survives the deletion of whatever the effect came from.
      sourceName: new fields.StringField({ trim: true, initial: '' }),
      // What an item-borne effect does (`EFFECT_ROLES`), which also fixes its `transfer`. Absent on actor effects and
      // on item effects stored before v0.9.
      role: new fields.StringField({ required: false, blank: false, choices: () => Object.keys(EFFECT_ROLES) }),
    };
  }
}
