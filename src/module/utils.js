import { SYSTEM_NAME } from './consts.js';

export const log = console.log.bind(undefined, `${SYSTEM_NAME} |`);
