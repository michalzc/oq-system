import { effectListEntry, isOpenQuestChange } from '../utils/effect-contributions.js';

export class OQActiveEffect extends foundry.documents.ActiveEffect {
  /** Core uses it as the initial `img` of new effects; icons come only from the themed set. */
  static DEFAULT_ICON = 'systems/oq/assets/icons/themed/flint-spark.svg';

  /**
   * Creates an empty effect on the actor and opens it in the effect editor.
   * @param {Actor} actor
   * @returns {Promise<OQActiveEffect|undefined>}
   */
  static async createOnActor(actor) {
    const [effect] = await actor.createEmbeddedDocuments('ActiveEffect', [
      { name: game.i18n.localize('OQ.Effects.NewEffect') },
    ]);
    effect?.sheet.render(true);
    return effect;
  }

  /**
   * OpenQuest changes are applied only by the actor's own preparation (`utils/effect-contributions.js`), so core
   * key-path application skips them. Other changes keep core behaviour. Statuses and `token.` changes are collected by
   * `Actor#applyActiveEffects` around this check, so they are unaffected.
   */
  shouldApplyChange(change, options) {
    return !isOpenQuestChange(change) && super.shouldApplyChange(change, options);
  }

  /** What the effects list and the editor show, read from the stored data. See `effectListEntry`. */
  get listEntry() {
    return effectListEntry(this._source);
  }
}
