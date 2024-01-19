import { RollConfig } from './rolls-config.js';
import { ItemConfig } from './items-config.js';
import { ActorConfig } from './actors-config.js';

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
