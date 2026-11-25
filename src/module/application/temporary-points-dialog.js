import { availableTemporaryPoints, parsePointAmount } from '../utils/resource-points.js';
import { OQActorDialog } from './actor-dialog.js';

/**
 * The pool editor of a resource's temporary points: lists the pools in spending order, corrects a pool's remaining
 * amount, removes a pool and grants new points. Every change is saved at once through the actor's pool methods.
 * Unlike the other actor dialogs it is re-rendered when the actor changes, so it never shows spent or removed pools.
 */
export class TemporaryPointsDialog extends OQActorDialog {
  static DEFAULT_OPTIONS = {
    classes: ['temporary-points'],
    position: { width: 420 },
    form: { handler: TemporaryPointsDialog.onGrant, closeOnSubmit: false, submitOnChange: false },
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
  constructor({ actor, resource, ...options }) {
    super({ actor, id: `TemporaryPointsDialog-${resource}-${actor.uuid.replaceAll('.', '-')}`, ...options });
    this.resource = resource;
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

  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    const poolId = event.target.closest('[data-pool-id]')?.dataset.poolId;
    if (poolId && event.target.matches('.pool-remaining')) this.correctPool(poolId, event.target.value);
  }

  async correctPool(poolId, text) {
    if (!this.actor.isOwner) return;
    const remaining = parsePointAmount(text);
    if (remaining === null) {
      ui.notifications.error('OQ.Resources.InvalidAmount', { localize: true });
      return this.render();
    }
    await this.actor.correctTemporaryPool(this.resource, poolId, remaining);
  }

  /** Submitting the form, with the Grant button or Enter, grants the amount typed in the grant row. */
  static async onGrant(event, form, formData) {
    if (!this.actor.isOwner) return;
    const amount = parsePointAmount(formData.object.amount);
    if (amount === null) {
      ui.notifications.error('OQ.Resources.InvalidAmount', { localize: true });
      return;
    }
    await this.actor.grantTemporaryPoints(this.resource, amount, formData.object.label);
  }

  static async onRemovePool(event, target) {
    if (!this.actor.isOwner) return;
    await this.actor.removeTemporaryPool(this.resource, target.closest('[data-pool-id]').dataset.poolId);
  }
}
