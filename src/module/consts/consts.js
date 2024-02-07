import { RollConfig } from './rolls-config.js';
import { ItemConfig } from './items-config.js';
import { ActorConfig } from './actors-config.js';

export const SYSTEM_ID = 'oq';
export const SYSTEM_NAME = 'OQ System';

const SettingKeys = {};

const ChatConfig = {
  itemTemplate: 'systems/oq/templates/chat/parts/item-template.hbs',
};

export const OQ = {
  SYSTEM_ID,
  SYSTEM_NAME,
  ActorConfig,
  ItemConfig,
  RollConfig,
  ChatConfig,
  SettingKeys,
};
