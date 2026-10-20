import { getCompendiumList } from '../utils/compendium-utils.js';
import { RulesConfigDialog } from '../application/rules-config-dialog.js';

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

  // All Rule Options in one setting, so a change is saved at once and asks for one reload. Edited through the rules
  // settings menu, not the core settings form.
  game.settings.register(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.rules, {
    name: 'OQ.Settings.rules.name',
    hint: 'OQ.Settings.rules.hint',
    scope: 'world',
    requiresReload: true,
    type: buildRulesField(),
    config: false,
  });

  game.settings.registerMenu(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.rulesMenu, {
    name: 'OQ.Settings.rules.name',
    label: 'OQ.Settings.rules.menuLabel',
    hint: 'OQ.Settings.rules.hint',
    icon: 'fa-solid fa-scale-balanced',
    type: RulesConfigDialog,
    restricted: true,
  });
}

/**
 * The schema of the rules setting. Its initial value is the OpenQuest SRD Rule Options.
 * @returns {foundry.data.fields.SchemaField}
 */
function buildRulesField() {
  const fields = foundry.data.fields;
  const { srd, CriticalRules, FumbleRules, DifficultyRanges } = CONFIG.OQ.RulesConfig;
  const prefix = 'OQ.Settings.rules';
  const choices = (rules, key) =>
    Object.fromEntries(Object.values(rules).map((rule) => [rule, `${prefix}.${key}.choices.${rule}`]));
  const modifier = (key) =>
    new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      ...DifficultyRanges[key],
      initial: srd.difficulty[key],
      label: `${prefix}.difficulty.${key}`,
    });

  return new fields.SchemaField({
    skillCap: new fields.BooleanField({
      initial: srd.skillCap,
      label: `${prefix}.skillCap.label`,
      hint: `${prefix}.skillCap.hint`,
    }),
    criticalRule: new fields.StringField({
      required: true,
      initial: srd.criticalRule,
      choices: choices(CriticalRules, 'criticalRule'),
      label: `${prefix}.criticalRule.label`,
      hint: `${prefix}.criticalRule.hint`,
    }),
    fumbleRule: new fields.StringField({
      required: true,
      initial: srd.fumbleRule,
      choices: choices(FumbleRules, 'fumbleRule'),
      label: `${prefix}.fumbleRule.label`,
      hint: `${prefix}.fumbleRule.hint`,
    }),
    mastery: new fields.BooleanField({
      initial: srd.mastery,
      label: `${prefix}.mastery.label`,
      hint: `${prefix}.mastery.hint`,
    }),
    difficulty: new fields.SchemaField({
      easy: modifier('easy'),
      simple: modifier('simple'),
      difficult: modifier('difficult'),
      hard: modifier('hard'),
    }),
  });
}

/**
 * Reads the stored Rule Options (or the SRD ones in a fresh world). World settings are readable during `init`, and it
 * must be read then: world documents are prepared before `setup`.
 * @returns {object} a copy of the active Rule Options, the value of `CONFIG.OQ.Rules`
 */
export function readRules() {
  return foundry.utils.deepClone(game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.rules));
}
