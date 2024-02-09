import _ from 'lodash-es';

export const getCompendiumList = () =>
  _.fromPairs(
    game.packs.filter((pack) => pack.documentName === 'Item').map((pack) => [pack.metadata.id, pack.metadata.label]),
  );

export async function getDefaultItemsForCharacter() {
  const defaultItemsCompendium = game.settings.get(
    CONFIG.OQ.SYSTEM_ID,
    CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium,
  );

  if (defaultItemsCompendium) {
    const compendium = game.packs.get(defaultItemsCompendium);
    if (compendium) {
      const documents = await compendium.getDocuments({});
      if (documents) {
        return documents.map((item) => item.toObject(true));
      }
    }
  }

  return [];
}
