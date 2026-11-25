import { availableTemporaryPoints, parsePointAmount } from '../utils/resource-points.js';
import { OQActorDialog } from './actor-dialog.js';

/**
 * The pool editor of a resource's temporary points: lists the pools in spending order, corrects a pool's remaining
 * amount, removes a pool and grants new points. Every change is saved at once through the actor's pool methods.
 * Unlike the other actor dialogs it is re-rendered when the actor changes, so it never shows spent or removed pools;
 * a grant being typed when someone else changes the actor is cleared.
 */
export class TemporaryPointsDialog extends OQActorDialog {
  static DEFAULT_OPTIONS = {
    classes: ['temporary-points'],
    position: { width: 420 },
    form: { handler: TemporaryPointsDialog.onGrant, closeOnSubmit: false },
    actions: {
      removePool: TemporaryPointsDialog.onRemovePool,
    },
  };

  static PARTS = {
    form: {
      template: 'systems/oq/templates/applications/temporary-points-dialog.hbs',
    },
  };

  /**
   * @param {object} options
   * @param {Actor} options.actor
   * @param {string} options.resource `hp`
   */
  constructor(options) {
    super(options);
    this.resource = options.resource;
  }

  static dialogId(actor, { resource }) {
    return `${super.dialogId(actor)}-${resource}`;
  }

  get resourceLabel() {
    return game.i18n.localize(`OQ.Labels.AttributesNames.${this.resource}.label`);
  }

  get title() {
    return game.i18n.format('OQ.Resources.DialogTitle', { resource: this.resourceLabel, name: this.actor.name });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { value, max } = this.actor.system.attributes[this.resource];
    const pools = this.actor.temporaryPools(this.resource);
    return Object.assign(context, {
      resourceLabel: this.resourceLabel,
      ordinary: { value, max },
      pools,
      total: availableTemporaryPoints(pools),
    });
  }

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this.actor.apps[this.id] = this;
  }

  _onClose(options) {
    super._onClose(options);
    delete this.actor.apps[this.id];
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    // Enter in a pool's field confirms its correction instead of submitting the form, which would grant.
    for (const input of this.element.querySelectorAll('.pool-remaining')) {
      input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        input.blur();
      });
    }
  }

  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    const poolId = event.target.closest('[data-pool-id]')?.dataset.poolId;
    if (poolId && event.target.matches('.pool-remaining')) this.onCorrectRemaining(poolId, event.target.value);
  }

  /** Saves the remaining amount typed in a pool's field. */
  async onCorrectRemaining(poolId, text) {
    if (!this.actor.isOwner) return;
    const remaining = this.#readAmount(text);
    // An invalid amount, or a pool someone else removed meanwhile: show the stored pools again.
    const exists = this.actor.temporaryPools(this.resource).some((pool) => pool.id === poolId);
    if (remaining === null || !exists) return this.render();
    await this.actor.correctTemporaryPool(this.resource, poolId, remaining);
  }

  /** Submitting the form, with the Grant button or Enter, grants the amount typed in the grant row. */
  static async onGrant(event, form, formData) {
    if (!this.actor.isOwner) return;
    const amount = this.#readAmount(formData.object.amount);
    if (amount !== null) await this.actor.grantTemporaryPoints(this.resource, amount, formData.object.label);
  }

  /** A typed amount of points, or null after telling the user it is invalid. */
  #readAmount(text) {
    const amount = parsePointAmount(text);
    if (amount === null) ui.notifications.error('OQ.Resources.InvalidAmount', { localize: true });
    return amount;
  }

  static async onRemovePool(event, target) {
    if (!this.actor.isOwner) return;
    await this.actor.removeTemporaryPool(this.resource, target.closest('[data-pool-id]').dataset.poolId);
  }
}
