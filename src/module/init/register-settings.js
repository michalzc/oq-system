import { OQ } from '../consts/consts.js';
import { getCompendiumList } from '../utils/compendium-utils.js';

export function registerDefaultItemsSetting() {
  game.settings.register(OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium, {
    name: 'OQ.Settings.defaultItemsCompendium.name',
    hint: 'OQ.Settings.defaultItemsCompendium.hint',
    scope: 'world',
    requiresReload: false,
    type: String,
    choices: getCompendiumList(),
    default: OQ.SettingsConfig.defaults.characterItemsCompendium,
    config: true,
  });
}
export function registerSettings() {
  registerDefaultItemsSetting();
}
