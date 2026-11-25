/**
 * Point arithmetic of the HP and MP resources: ordinary current points, the normal maximum and an ordered list of
 * temporary-point pools. Pure, without Foundry calls, so data models, migrations and actors share it.
 */

/** The identity of the pool that recovers points stored above the normal maximum by versions before 0.9. */
export const RECOVERED_EXCESS_POOL_ID = 'recoveredExcess';

/** Localization key of the recovered pool's label. Callers store it translated, like the labels people type. */
export const RECOVERED_EXCESS_LABEL_KEY = 'OQ.Resources.RecoveredExcess';

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
 * @param {string} label label of the pool holding the excess
 * @returns {{value: number, pools: object[]}}
 */
function recoverExcess(current, max, label) {
  const normalMax = Math.max(0, max);
  if (current <= normalMax) return { value: current, pools: [] };
  return {
    value: normalMax,
    pools: [{ id: RECOVERED_EXCESS_POOL_ID, label, remaining: current - normalMax }],
  };
}

/**
 * Legacy HP, stored by a version before 0.9 without a pool list (see {@link hasPoolList}, checked by callers), converted
 * to ordinary current points and pools. The normal maximum is computed from the stored characteristics and HP
 * modifier, never read from the stored maximum.
 * @param {object} [characteristics] stored characteristics, `{siz: {base, mod}, con: {base, mod}, ...}`
 * @param {{value?: number, mod?: number}} hp stored HP
 * @param {string} label label of a recovered excess pool: the translation of {@link RECOVERED_EXCESS_LABEL_KEY}
 * @returns {{value: number, pools: object[]}}
 */
export function convertLegacyHp(characteristics, hp, label) {
  const { siz, con } = characteristics ?? {};
  const max = hpNormalMaximum(sourceCharacteristic(siz), sourceCharacteristic(con), hp.mod ?? 0);
  return recoverExcess(hp.value ?? 0, max, label);
}

/**
 * Whether a value is a valid amount of points: a nonnegative whole number, without an upper cap.
 * @param {*} amount
 * @returns {boolean}
 */
const isPointAmount = (amount) => Number.isInteger(amount) && amount >= 0;

/**
 * A typed amount of points, from a form input.
 * @param {string} [text]
 * @returns {number|null} null unless the text is a nonnegative whole number
 */
export function parsePointAmount(text) {
  const trimmed = String(text ?? '').trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

function assertPointAmount(amount) {
  if (!isPointAmount(amount)) throw new RangeError(`Invalid amount of points: ${amount}`);
}

/**
 * Grants temporary points as a new pool after every existing one, so it is spent last.
 * @param {object[]} pools
 * @param {{id: string, label: string, amount: number}} grant `id` must be new
 * @returns {object[]} the new pool list
 */
export function grantPool(pools, { id, label, amount }) {
  assertPointAmount(amount);
  if (pools.some((pool) => pool.id === id)) throw new Error(`Pool ${id} already exists`);
  return [...pools, { id, label, remaining: amount }];
}

/**
 * Corrects the remaining amount of a pool, keeping its place in the spending order. A pool at zero stays listed.
 * @param {object[]} pools
 * @param {string} id
 * @param {number} remaining
 * @returns {object[]} the new pool list
 */
export function correctPool(pools, id, remaining) {
  assertPointAmount(remaining);
  if (!pools.some((pool) => pool.id === id)) throw new Error(`Unknown pool ${id}`);
  return pools.map((pool) => (pool.id === id ? { ...pool, remaining } : pool));
}

/**
 * Removes a pool with its remaining points; the other pools keep theirs. Removing a pool already gone changes nothing.
 * @param {object[]} pools
 * @param {string} id
 * @returns {object[]} the new pool list
 */
export const removePool = (pools, id) => pools.filter((pool) => pool.id !== id);
