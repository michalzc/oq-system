const SYSTEM_NAME = 'OQ System';
export const log = console.log.bind(undefined, `${SYSTEM_NAME} |`);

export const logError = console.error.bind(undefined, `${SYSTEM_NAME} |`);

/**
 *
 * @param {string} message
 * @param {Object|string|number|boolean|undefined} object
 * @returns {*}
 */
export const logObject = (message, object) => {
  log(message, object);
  return object;
};

/**
 * Number as string with sign. In case of 0 it returns empty string.
 * @param {number} num
 * @returns {string} string representation with sing
 */
export function signedNumberOrEmpty(num) {
  if (!num) return '';
  else return num > 0 ? `+${num}` : `${num}`;
}

export const minMaxValue = (value) => Math.max(0, Math.min(100, value));

export const mostSignificantModifier = (left, right) =>
  Math.abs(left) === Math.abs(right) ? 0 : Math.abs(left) > Math.abs(right) ? left : right;
