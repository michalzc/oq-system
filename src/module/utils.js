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
