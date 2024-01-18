import { RollConfig } from './rolls.js';
import { ItemConfig } from './items.js';
import { ActorConfig } from './actors.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

const SettingKeys = {
  masterNeverThrows: {
    key: 'masterNeverThrows',
    localizationKey: 'MasterNeverThrows',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
    requiresReload: false,
  },
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  ActorConfig,
  ItemConfig,
  RollConfig,
  SettingKeys,
};
