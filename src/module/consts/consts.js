import { RollConfig } from './rolls-config.js';
import { ItemConfig } from './items-config.js';
import { ActorConfig } from './actors-config.js';
import { ChatConfig } from './chat-config.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

const SettingsConfig = {
  keys: {
    defaultItemsCompendium: 'defaultSkillsCompendium',
    coinsConfiguration: 'coins',
  },
  defaults: {
    characterItemsCompendium: 'oq.oq-system-basic-skills',
    defaultCoinsConfiguration:
      'Gold Ducat (GD) = 20, Silver Piece (SP) = 1, Copper Penny (CP) = 0.1, Lead Bit (LB) = 0.02',
  },
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  ActorConfig,
  ItemConfig,
  RollConfig,
  ChatConfig,
  SettingsConfig,
};
