import { getCompendiumList } from '../utils/compendium-utils.js';

export function registerDefaultItemsSetting() {
  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium, {
    name: 'OQ.Settings.defaultItemsCompendium.name',
    hint: 'OQ.Settings.defaultItemsCompendium.hint',
    scope: 'world',
    requiresReload: false,
    type: String,
    choices: getCompendiumList(),
    default: CONFIG.OQ.SettingsConfig.defaults.characterItemsCompendium,
    config: true,
  });
}
export function registerLateSettings() {
  registerDefaultItemsSetting();
}

export function registerSettings() {
  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.coinsConfiguration, {
    name: 'OQ.Settings.coinsConfiguration.name',
    hint: 'OQ.Settings.coinsConfiguration.hint',
    scope: 'world',
    requiresReload: true,
    type: String,
    default: CONFIG.OQ.SettingsConfig.defaults.defaultCoinsConfiguration,
    config: true,
  });
}
