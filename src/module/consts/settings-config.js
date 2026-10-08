export const SettingsConfig = {
  keys: {
    defaultItemsCompendium: 'defaultSkillsCompendium',
    coinsConfiguration: 'coins',
  },
  defaults: {
    characterItemsCompendium: 'oq.oq-system-basic-skills',
    defaultCoinsConfiguration:
      'Gold Ducats (GD) = 20, Silver Pieces (SP) = 1, Copper Pennies (CP) = 0.1, Lead Bits (LB) = 0.02',
  },
  noDefaultCompendium: 'noDefaultCompendium',
  /** New default values of core settings. Values the users have saved are kept. */
  coreDefaults: {
    leftClickRelease: true,
    tokenAutoRotate: false,
  },
};
