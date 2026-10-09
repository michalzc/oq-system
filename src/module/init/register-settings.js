import { getCompendiumList } from '../utils/compendium-utils.js';

/**
 * Replaces the default values of core settings with the ones recommended for OQ. Core registers its settings after
 * the `init` hook, so this runs in `setup`. Client settings are stored per browser, so it runs on every client.
 */
export function applyCoreSettingDefaults() {
  for (const [key, value] of Object.entries(CONFIG.OQ.SettingsConfig.coreDefaults)) {
    const setting = game.settings.settings.get(`core.${key}`);
    if (!setting) continue;
    setting.default = value;
    // The settings form and its Reset Defaults button read the field's initial value and the setting default.
    if (setting.type instanceof foundry.data.fields.DataField) setting.type.initial = value;
  }
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

  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium, {
    name: 'OQ.Settings.defaultItemsCompendium.name',
    hint: 'OQ.Settings.defaultItemsCompendium.hint',
    scope: 'world',
    requiresReload: false,
    type: String,
    // Called when the settings form renders: compendium packs don't exist yet during `init`.
    choices: getCompendiumList,
    default: CONFIG.OQ.SettingsConfig.defaults.characterItemsCompendium,
    config: true,
  });

  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.defaultItemsFromWorld, {
    name: 'OQ.Settings.defaultItemsFromWorld.name',
    hint: 'OQ.Settings.defaultItemsFromWorld.hint',
    scope: 'world',
    requiresReload: false,
    type: Boolean,
    default: false,
    config: true,
  });

  // The version of the last data migration applied to the world, see `migration/migrations.js`. Pending migrations
  // are applied when the world loads, so lowering it takes effect after the reload.
  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.migrationVersion, {
    name: 'OQ.Settings.migrationVersion.name',
    hint: 'OQ.Settings.migrationVersion.hint',
    scope: 'world',
    requiresReload: true,
    type: new foundry.data.fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
    default: 0,
    config: true,
  });
}
