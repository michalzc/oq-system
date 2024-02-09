import { RollConfig } from './rolls-config.js';
import { ItemConfig } from './items-config.js';
import { ActorConfig } from './actors-config.js';
import { ChatConfig } from './chat-config.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

const SettingsConfig = {
  keys: {
    defaultItemsCompendium: 'defaultSkillsCompendium',
  },
  defaults: {
    characterItemsCompendium: 'oq.oq-system-basic-skills',
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
