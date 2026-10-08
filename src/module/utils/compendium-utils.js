import _ from 'lodash-es';

export const getCompendiumList = () =>
  _.fromPairs(
    [[CONFIG.OQ.SettingsConfig.noDefaultCompendium, game.i18n.localize('OQ.Labels.NoDefaultCompendium')]].concat(
      game.packs.filter((pack) => pack.documentName === 'Item').map((pack) => [pack.metadata.id, pack.metadata.label]),
    ),
  );

/**
 * Item data for a new actor: the items of the default items compendium whose `flags.oq.newActor` lists the actor type.
 * @param {string} actorType
 * @returns {Promise<object[]>}
 */
export async function getDefaultItemsForActor(actorType) {
  const defaultItemsCompendium = game.settings.get(
    CONFIG.OQ.SYSTEM_ID,
    CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium,
  );
  const compendium = game.packs.get(defaultItemsCompendium);
  if (compendium?.documentName !== 'Item') return [];

  // Only the matching items are loaded, the index tells which ones they are.
  const index = await compendium.getIndex({ fields: ['flags.oq.newActor'] });
  const ids = index.filter((entry) => (entry.flags?.oq?.newActor ?? []).includes(actorType)).map((entry) => entry._id);
  if (!ids.length) return [];

  const documents = await compendium.getDocuments({ _id__in: ids });
  // Same as core's item drop on an actor sheet: embedded items don't belong to the compendium's folders.
  return documents.map((item) => game.items.fromCompendium(item, { clearFolder: true }));
}
