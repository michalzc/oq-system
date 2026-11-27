import { effectListEntry, effectTargets, isOpenQuestChange, roleTransfer } from '../utils/effect-contributions.js';

export class OQActiveEffect extends foundry.documents.ActiveEffect {
  /** Core uses it as the initial `img` of new effects; icons come only from the themed set. */
  static DEFAULT_ICON = 'systems/oq/assets/icons/themed/flint-spark.svg';

  /**
   * Creates an empty effect on an actor or an item and opens it in the effect editor.
   * @param {Actor|Item} parent
   * @param {object} [data] more data of the new effect, such as an item effect's `system.role`
   * @returns {Promise<OQActiveEffect|undefined>}
   */
  static async createOn(parent, data = {}) {
    const [effect] = await parent.createEmbeddedDocuments('ActiveEffect', [
      { name: game.i18n.localize('OQ.Effects.NewEffect'), ...data },
    ]);
    effect?.sheet.render(true);
    return effect;
  }

  /** An effect with a role transfers as its role requires, whatever its data says. */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;
    const transfer = roleTransfer(this._source);
    if (transfer !== undefined && transfer !== this._source.transfer) this.updateSource({ transfer });
  }

  /** An update never gives an effect with a role another `transfer` than its role requires. */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) return false;
    const transfer = roleTransfer({ system: { role: changes.system?.role ?? this._source.system.role } });
    if (transfer !== undefined && (changes.transfer ?? this._source.transfer) !== transfer) changes.transfer = transfer;
  }

  /**
   * OpenQuest changes are applied only by the actor's own preparation (`utils/effect-contributions.js`), so core
   * key-path application skips them. Other changes keep core behaviour. Statuses and `token.` changes are collected by
   * `Actor#applyActiveEffects` around this check, so they are unaffected.
   */
  shouldApplyChange(change, options) {
    return !isOpenQuestChange(change) && super.shouldApplyChange(change, options);
  }

  /** The change targets this effect may name, by its role or its parent. See `effectTargets`. */
  get targets() {
    return effectTargets(this._source, this.parent?.documentName);
  }

  /** What the effects list and the editor show, read from the stored data. See `effectListEntry`. */
  get listEntry() {
    return effectListEntry(this._source, this.targets);
  }
}
