/**
 * Point arithmetic of the HP and MP resources: ordinary current points, the normal maximum and an ordered list of
 * temporary-point pools. Pure, without Foundry calls, so data models, migrations and actors share it.
 */

/** The identity of the pool that recovers points stored above the normal maximum by versions before 0.9. */
export const RECOVERED_EXCESS_POOL_ID = 'recoveredExcess';

/** Localization key of the recovered pool's label; labels are localized when they are shown. */
export const RECOVERED_EXCESS_LABEL = 'OQ.Resources.RecoveredExcess';

/**
 * The HP normal maximum, used by actor preparation and legacy conversion alike.
 * @param {number} siz SIZ value
 * @param {number} con CON value
 * @param {number} mod HP modifier
 * @returns {number}
 */
export const hpNormalMaximum = (siz, con, mod) => Math.round((siz + con) / 2) + mod;

/**
 * Whether a stored resource has a pool list. One without it was stored by a version before 0.9, the legacy signal.
 * @param {object} resource stored `hp` or `mp` source
 * @returns {boolean}
 */
export const hasPoolList = (resource) => Array.isArray(resource?.pools);

/**
 * The available temporary points of a resource: the remaining amounts of its pools.
 * @param {object[]} [pools]
 * @returns {number}
 */
export const availableTemporaryPoints = (pools = []) => pools.reduce((total, pool) => total + pool.remaining, 0);

/** A characteristic's value in a stored source: base plus modifier. */
const sourceCharacteristic = (characteristic) => (characteristic?.base ?? 0) + (characteristic?.mod ?? 0);

/**
 * Converts ordinary current points of a legacy resource, which may exceed the normal maximum, into ordinary points
 * within it and a pool holding the excess.
 * @param {number} current stored ordinary current points
 * @param {number} max normal maximum, floored at zero
 * @returns {{value: number, pools: object[]}}
 */
function recoverExcess(current, max) {
  const normalMax = Math.max(0, max);
  if (current <= normalMax) return { value: current, pools: [] };
  return {
    value: normalMax,
    pools: [{ id: RECOVERED_EXCESS_POOL_ID, label: RECOVERED_EXCESS_LABEL, remaining: current - normalMax }],
  };
}

/**
 * Legacy HP, stored by a version before 0.9 without a pool list (see {@link hasPoolList}, checked by callers), converted
 * to ordinary current points and pools. The normal maximum is computed from the stored characteristics and HP
 * modifier, never read from the stored maximum.
 * @param {object} [characteristics] stored characteristics, `{siz: {base, mod}, con: {base, mod}, ...}`
 * @param {{value?: number, mod?: number}} hp stored HP
 * @returns {{value: number, pools: object[]}}
 */
export function convertLegacyHp(characteristics, hp) {
  const { siz, con } = characteristics ?? {};
  const max = hpNormalMaximum(sourceCharacteristic(siz), sourceCharacteristic(con), hp.mod ?? 0);
  return recoverExcess(hp.value ?? 0, max);
}
