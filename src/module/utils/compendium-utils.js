import _ from 'lodash-es';

export const getCompendiumList = () =>
  _.fromPairs(
    [[CONFIG.OQ.SettingsConfig.noDefaultCompendium, game.i18n.localize('OQ.Labels.NoDefaultCompendium')]].concat(
      game.packs.filter((pack) => pack.documentName === 'Item').map((pack) => [pack.metadata.id, pack.metadata.label]),
    ),
  );

export async function getDefaultItemsForActor(actorType) {
  const defaultItemsCompendium = game.settings.get(
    CONFIG.OQ.SYSTEM_ID,
    CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium,
  );

  if (defaultItemsCompendium && defaultItemsCompendium !== CONFIG.OQ.SettingsConfig.noDefaultCompendium) {
    const compendium = game.packs.get(defaultItemsCompendium);
    if (compendium) {
      const documents = await compendium.getDocuments({});
      if (documents) {
        return documents
          .filter((item) => (item.flags?.oq?.newActor ?? []).includes(actorType))
          .map((item) => item.toObject(true))
          .map((item) => game.items.fromCompendium(item));
      }
    }
  }
  return [];
}
