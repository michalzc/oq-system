import _ from 'lodash-es';

export const getCompendiumList = () =>
  _.fromPairs(
    [[CONFIG.OQ.SettingsConfig.noDefaultCompendium, game.i18n.localize('OQ.Labels.NoDefaultCompendium')]].concat(
      game.packs.filter((pack) => pack.documentName === 'Item').map((pack) => [pack.metadata.id, pack.metadata.label]),
    ),
  );

/**
 * Item data for a new actor: the items whose `flags.oq.newActor` lists the actor type, taken from the default items
 * compendium and, when the world setting allows it, from the world's items.
 * @param {string} actorType
 * @returns {Promise<object[]>}
 */
export async function getDefaultItemsForActor(actorType) {
  const isDefaultFor = (data) => (data.flags?.oq?.newActor ?? []).includes(actorType);

  const fromWorld = game.settings.get(CONFIG.OQ.SYSTEM_ID, CONFIG.OQ.SettingsConfig.keys.defaultItemsFromWorld);
  const worldItems = fromWorld ? game.items.filter(isDefaultFor) : [];
  // A world copy of a compendium item replaces it, so editing an imported default item doesn't add it twice.
  const replacedUuids = new Set(worldItems.map((item) => item._stats?.compendiumSource).filter(Boolean));
  const compendiumItems = await getCompendiumDefaultItems(
    (entry) => isDefaultFor(entry) && !replacedUuids.has(entry.uuid),
  );

  // Same as core's item drop on an actor sheet: embedded items don't belong to the source's folders.
  return [...compendiumItems, ...worldItems].map((item) => game.items.fromCompendium(item, { clearFolder: true }));
}

/**
 * Items of the default items compendium whose index entries pass the filter.
 * @param {(entry: object) => boolean} filter
 * @returns {Promise<Item[]>}
 */
async function getCompendiumDefaultItems(filter) {
  const defaultItemsCompendium = game.settings.get(
    CONFIG.OQ.SYSTEM_ID,
    CONFIG.OQ.SettingsConfig.keys.defaultItemsCompendium,
  );
  const compendium = game.packs.get(defaultItemsCompendium);
  if (compendium?.documentName !== 'Item') return [];

  // Only the matching items are loaded, the index tells which ones they are.
  const index = await compendium.getIndex({ fields: ['flags.oq.newActor'] });
  const ids = index.filter(filter).map((entry) => entry._id);
  if (!ids.length) return [];
  return compendium.getDocuments({ _id__in: ids });
}
