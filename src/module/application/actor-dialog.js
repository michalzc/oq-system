/**
 * A form editing part of an actor, one per actor and {@link OQActorDialog.dialogId}. Unlike a document sheet it isn't
 * re-rendered when the actor changes, so unsaved input survives updates made elsewhere; a dialog that must show live
 * data registers itself in `actor.apps`.
 */
export class OQActorDialog extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static DEFAULT_OPTIONS = {
    // Keep the parchment palette until the dialogs support both colour schemes.
    classes: ['oq', 'oq-dialog', 'themed', 'theme-light'],
    tag: 'form',
    form: { handler: OQActorDialog.onSubmit, closeOnSubmit: true },
  };

  /**
   * @param {object} options
   * @param {Actor} options.actor The edited actor
   */
  constructor({ actor, ...options }) {
    super({ ...options, id: new.target.dialogId(actor, options) });
    this.actor = actor;
  }

  /**
   * The id of the actor's dialog: one per class and actor. Subclasses add the options that tell their dialogs apart.
   * @param {Actor} actor
   * @param {object} options The dialog's other options
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  static dialogId(actor, options) {
    return `${this.name}-${actor.uuid.replaceAll('.', '-')}`;
  }

  /**
   * Shows the dialog for the actor. An open one is brought to the front as it is, keeping any unsaved input.
   * @param {Actor} actor
   * @param {object} [options] Further options of the dialog class
   * @returns {Promise<OQActorDialog>}
   */
  static async open(actor, options = {}) {
    const dialog = new this({ actor, ...options });
    const existing = foundry.applications.instances.get(dialog.id);
    if (existing?.rendered) {
      await existing.maximize();
      existing.bringToFront();
      return existing;
    }
    return dialog.render({ force: true });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return Object.assign(context, {
      actor: this.actor,
      system: this.actor.system,
      rootId: this.id,
    });
  }

  static async onSubmit(event, form, formData) {
    if (!this.actor.isOwner) return;
    await this.actor.update(formData.object);
  }
}
