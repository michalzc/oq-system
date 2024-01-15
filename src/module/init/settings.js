// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
  const localizationPrefix = 'OQ.Settings';
  const masterNeverThrows = CONFIG.OQ.SettingKeys.masterNeverThrows;
  game.settings.register(CONFIG.OQ.SYSTEM_ID, masterNeverThrows.key, {
    name: `${localizationPrefix}.${masterNeverThrows.localizationKey}.name`,
    hint: `${localizationPrefix}.${masterNeverThrows.localizationKey}.hint`,
    scope: masterNeverThrows.scope,
    type: masterNeverThrows.type,
    default: masterNeverThrows.default,
    config: masterNeverThrows.config,
  });
}
