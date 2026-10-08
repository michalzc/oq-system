import assert from 'node:assert/strict';
import { getDefaultItemsForActor } from '../src/module/utils/compendium-utils.js';
import { SettingsConfig } from '../src/module/consts/settings-config.js';

const PACK_ID = 'world.defaults';

const packItem = (id, newActor) => ({
  _id: id,
  uuid: `Compendium.${PACK_ID}.Item.${id}`,
  name: id,
  flags: { oq: { newActor } },
});

const worldItem = (id, newActor, compendiumSource = null) => ({
  _id: id,
  name: id,
  flags: { oq: { newActor } },
  _stats: { compendiumSource },
});

describe('compendium-utils.js', function () {
  describe('#getDefaultItemsForActor()', function () {
    let savedGlobals;
    let settings;
    let packItems;
    let worldItems;

    before(function () {
      savedGlobals = { CONFIG: globalThis.CONFIG, game: globalThis.game };
    });

    after(function () {
      for (const [key, value] of Object.entries(savedGlobals)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    });

    beforeEach(function () {
      settings = {
        [SettingsConfig.keys.defaultItemsCompendium]: PACK_ID,
        [SettingsConfig.keys.defaultItemsFromWorld]: false,
      };
      packItems = [packItem('dodge', ['character', 'npc']), packItem('trade', ['character']), packItem('bite', [])];
      worldItems = [worldItem('torch', ['character']), worldItem('claws', ['npc'])];

      const pack = {
        documentName: 'Item',
        getIndex: async () => packItems,
        getDocuments: async ({ _id__in }) => packItems.filter((item) => _id__in.includes(item._id)),
      };
      globalThis.CONFIG = { OQ: { SYSTEM_ID: 'oq', SettingsConfig } };
      globalThis.game = {
        settings: { get: (_scope, key) => settings[key] },
        packs: { get: (id) => (id === PACK_ID ? pack : undefined) },
        items: {
          filter: (predicate) => worldItems.filter(predicate),
          fromCompendium: (item) => ({ name: item.name }),
        },
      };
    });

    const names = async (actorType) => (await getDefaultItemsForActor(actorType)).map((item) => item.name);

    it('Should take only the compendium items when world items are disabled', async function () {
      assert.deepEqual(await names('character'), ['dodge', 'trade']);
    });

    it('Should add the marked world items when enabled', async function () {
      settings[SettingsConfig.keys.defaultItemsFromWorld] = true;
      assert.deepEqual(await names('character'), ['dodge', 'trade', 'torch']);
      assert.deepEqual(await names('npc'), ['dodge', 'claws']);
    });

    it('Should take the world items without a default compendium', async function () {
      settings[SettingsConfig.keys.defaultItemsCompendium] = SettingsConfig.noDefaultCompendium;
      settings[SettingsConfig.keys.defaultItemsFromWorld] = true;
      assert.deepEqual(await names('character'), ['torch']);
    });

    it('Should replace a compendium item with its world copy', async function () {
      settings[SettingsConfig.keys.defaultItemsFromWorld] = true;
      worldItems.push(worldItem('trade (edited)', ['character'], `Compendium.${PACK_ID}.Item.trade`));
      assert.deepEqual(await names('character'), ['dodge', 'torch', 'trade (edited)']);
    });

    it('Should keep a compendium item when its world copy is not marked for the actor type', async function () {
      settings[SettingsConfig.keys.defaultItemsFromWorld] = true;
      worldItems.push(worldItem('trade (edited)', [], `Compendium.${PACK_ID}.Item.trade`));
      assert.deepEqual(await names('character'), ['dodge', 'trade', 'torch']);
    });
  });
});
