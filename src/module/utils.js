const SYSTEM_NAME = 'OQ System';
export const log = console.log.bind(undefined, `${SYSTEM_NAME} |`);

export const logObject = (message, object) => {
  log(message, object);
  return object;
};
