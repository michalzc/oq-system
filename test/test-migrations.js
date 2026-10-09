import assert from 'node:assert/strict';
import expect from 'expect.js';
import _ from 'lodash-es';
import { themedIconPath, themedIconsMigration } from '../src/module/migration/migration-1-themed-icons.js';
import { LATEST_MIGRATION_VERSION, migrations, pendingMigrations } from '../src/module/migration/migrations.js';
import { applyPendingMigrations, migrateWorld } from '../src/module/migration/migration-runner.js';
import { SettingsConfig } from '../src/module/consts/settings-config.js';

const LEGACY = 'systems/oq/assets/icons/skills.svg';
const THEMED = 'systems/oq/assets/icons/themed/skills.svg';
const helpers = { replace: (value) => ({ replaced: value }) };

describe('migrations.js', function () {
  it('Should keep migrations in ascending version order', function () {
    const versions = migrations.map((migration) => migration.version);
    expect(versions).to.eql([...versions].sort((a, b) => a - b));
    expect(new Set(versions).size).to.be(versions.length);
    expect(LATEST_MIGRATION_VERSION).to.be(versions.at(-1));
  });

  it('Should return the migrations newer than the stored version', function () {
    expect(pendingMigrations(0)).to.eql(migrations);
    expect(pendingMigrations(LATEST_MIGRATION_VERSION)).to.eql([]);
  });
});

describe('migration-1-themed-icons.js', function () {
  describe('#themedIconPath()', function () {
    it('Should move a legacy system icon to the themed directory', function () {
      expect(themedIconPath(LEGACY)).to.be(THEMED);
    });

    it('Should keep a leading slash', function () {
      expect(themedIconPath(`/${LEGACY}`)).to.be(`/${THEMED}`);
    });

    it('Should leave the NPC portrait in place', function () {
      expect(themedIconPath('systems/oq/assets/icons/cultist.svg')).to.be('systems/oq/assets/icons/cultist.svg');
    });

    it('Should leave an already themed icon untouched', function () {
      expect(themedIconPath(THEMED)).to.be(THEMED);
    });

    it('Should move every legacy system icon in HTML content', function () {
      const html =
        '<img src="systems/oq/assets/icons/skills.svg"><img src="systems/oq/assets/icons/cultist.svg">' +
        '<img src="systems/oq/assets/icons/ink-swirl.svg">';
      expect(themedIconPath(html)).to.be(
        '<img src="systems/oq/assets/icons/themed/skills.svg"><img src="systems/oq/assets/icons/cultist.svg">' +
          '<img src="systems/oq/assets/icons/themed/ink-swirl.svg">',
      );
    });

    it('Should leave other images untouched', function () {
      expect(themedIconPath('icons/svg/mystery-man.svg')).to.be('icons/svg/mystery-man.svg');
      expect(themedIconPath('worlds/test/assets/icons/skills.svg')).to.be('worlds/test/assets/icons/skills.svg');
    });
  });

  describe('handlers', function () {
    const { handlers } = themedIconsMigration;

    it('Should migrate the actor image and prototype token texture', function () {
      const source = { img: LEGACY, prototypeToken: { texture: { src: LEGACY } } };
      expect(handlers.Actor(source, helpers)).to.eql({ img: THEMED, prototypeToken: { texture: { src: THEMED } } });
    });

    it('Should return no changes for an up to date actor', function () {
      const source = { img: 'systems/oq/assets/icons/cultist.svg', prototypeToken: { texture: { src: THEMED } } };
      expect(handlers.Actor(source, helpers)).to.eql({});
    });

    it('Should migrate the image of an item', function () {
      expect(handlers.Item({ type: 'armour', img: LEGACY, system: { ap: 2 } }, helpers)).to.eql({ img: THEMED });
      expect(handlers.Item({ type: 'spell', img: 'icons/svg/book.svg', system: {} }, helpers)).to.eql({});
    });

    it('Should replace the system data of items with renamed fields', function () {
      for (const type of ['skill', 'weapon', 'equipment']) {
        const system = { type: 'melee' };
        expect(handlers.Item({ type, img: THEMED, system }, helpers)).to.eql({ system: { replaced: system } });
      }
    });

    it('Should migrate the token texture and the image stored in its delta', function () {
      expect(handlers.Token({ texture: { src: LEGACY }, delta: { img: LEGACY } }, helpers)).to.eql({
        texture: { src: THEMED },
        delta: { img: THEMED },
      });
      expect(handlers.Token({ texture: { src: THEMED }, delta: { img: null } }, helpers)).to.eql({});
      expect(handlers.Token({ texture: { src: THEMED } }, helpers)).to.eql({});
    });

    it('Should migrate chat message content', function () {
      const content = `<img src="${LEGACY}"> card`;
      expect(handlers.ChatMessage({ content }, helpers)).to.eql({ content: `<img src="${THEMED}"> card` });
      expect(handlers.ChatMessage({ content: 'roll' }, helpers)).to.eql({});
    });

    it('Should migrate the macro image', function () {
      expect(handlers.Macro({ img: LEGACY }, helpers)).to.eql({ img: THEMED });
    });

    it('Should migrate journal page images and text content', function () {
      expect(handlers.JournalEntryPage({ src: LEGACY, text: { content: `<img src="${LEGACY}">` } }, helpers)).to.eql({
        src: THEMED,
        text: { content: `<img src="${THEMED}">` },
      });
      expect(handlers.JournalEntryPage({ src: null, text: { content: null } }, helpers)).to.eql({});
    });
  });
});

describe('migration-runner.js', function () {
  describe('#applyPendingMigrations() and #migrateWorld()', function () {
    let savedGlobals;
    let storedVersion;
    let updates;
    let notifications;

    // Foundry writes the parent into the operation it is given, which must not leak into the next update. The changes
    // are already applied in memory, so they must be sent without diffing.
    const record =
      (target) =>
      async (batch, options = {}) => {
        expect(options.parent).to.be(undefined);
        expect(options.diff).to.be(false);
        options.parent = target;
        updates.push({ target, batch, options });
        return batch.map((source) => new FakeDocument(source));
      };
    const recordEmbedded =
      (target) =>
      async (name, batch, options = {}) => {
        expect(options.diff).to.be(false);
        options.parent = target;
        updates.push({ target: `${target}.${name}`, batch });
        return batch.map((source) => new FakeDocument(source));
      };

    const run = async () => {
      applyPendingMigrations();
      await migrateWorld();
    };

    class FakeDocument {
      constructor(source, extra = {}) {
        this.source = source;
        Object.assign(this, extra);
      }

      get id() {
        return this.source._id;
      }

      get uuid() {
        return `Fake.${this.source._id}`;
      }

      toObject() {
        return structuredClone(this.source);
      }

      updateSource(changes) {
        _.merge(this.source, changes);
      }
    }

    const collection = (documentName, documents) =>
      Object.assign(documents, { documentName, documentClass: { updateDocuments: record(documentName) } });

    function setGlobals({ isGM = true, documents = {}, packs = [] } = {}) {
      globalThis.CONFIG = { OQ: { SYSTEM_ID: 'oq', SettingsConfig } };
      globalThis.foundry = { data: { operators: { ForcedReplacement: { create: (value) => ({ replaced: value }) } } } };
      globalThis.ui = {
        notifications: {
          warn: (message) => notifications.push(['warn', message]) && message,
          info: (message) => notifications.push(['info', message]),
          error: (message) => notifications.push(['error', message]),
          remove: (message) => notifications.push(['remove', message]),
        },
      };
      globalThis.game = {
        users: { activeGM: isGM ? { isSelf: true } : null },
        settings: {
          get: () => storedVersion,
          set: async (system, key, value) => {
            storedVersion = value;
          },
        },
        i18n: { format: (key, data) => `${key} ${JSON.stringify(data)}` },
        actors: collection('Actor', documents.actors ?? []),
        items: collection('Item', documents.items ?? []),
        scenes: collection('Scene', documents.scenes ?? []),
        journal: collection('JournalEntry', []),
        macros: collection('Macro', documents.macros ?? []),
        messages: collection('ChatMessage', documents.messages ?? []),
        packs,
      };
    }

    before(function () {
      savedGlobals = Object.fromEntries(['CONFIG', 'foundry', 'game', 'ui'].map((key) => [key, globalThis[key]]));
    });

    after(function () {
      for (const [key, value] of Object.entries(savedGlobals)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    });

    beforeEach(function () {
      storedVersion = 0;
      updates = [];
      notifications = [];
    });

    it('Should migrate world documents with their embedded documents and store the version', async function () {
      const actor = new FakeDocument(
        { _id: 'a1', img: LEGACY, prototypeToken: { texture: { src: THEMED } } },
        { updateEmbeddedDocuments: recordEmbedded('a1') },
      );
      actor.items = [new FakeDocument({ _id: 'i1', type: 'armour', img: LEGACY })];
      const item = new FakeDocument({ _id: 'i2', type: 'armour', img: LEGACY });
      const macro = new FakeDocument({ _id: 'm1', img: THEMED });
      setGlobals({ documents: { actors: [actor], items: [item], macros: [macro] } });

      await run();

      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 'Actor', batch: [{ _id: 'a1', img: THEMED }] },
          { target: 'a1.Item', batch: [{ _id: 'i1', img: THEMED }] },
          { target: 'Item', batch: [{ _id: 'i2', img: THEMED }] },
        ],
      );
      expect(storedVersion).to.be(LATEST_MIGRATION_VERSION);
      expect(notifications.map(([type]) => type)).to.eql(['warn', 'remove', 'info']);
    });

    it('Should migrate the items stored in the delta of an unlinked token', async function () {
      const deltaItem = new FakeDocument({ _id: 'd1', type: 'armour', img: LEGACY });
      const baseItem = new FakeDocument({ _id: 'b1', type: 'armour', img: LEGACY });
      const items = Object.assign([deltaItem, baseItem], { manages: (id) => id === 'd1' });
      const tokenActor = {
        updateEmbeddedDocuments: recordEmbedded('t1'),
      };
      const token = new FakeDocument(
        { _id: 't1', texture: { src: LEGACY }, delta: { img: null } },
        { actorLink: false, delta: { items }, actor: tokenActor },
      );
      const scene = new FakeDocument(
        { _id: 's1' },
        {
          tokens: [token],
          updateEmbeddedDocuments: recordEmbedded('s1'),
        },
      );
      setGlobals({ documents: { scenes: [scene], macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });

      await run();

      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 's1.Token', batch: [{ _id: 't1', texture: { src: THEMED } }] },
          { target: 't1.Item', batch: [{ _id: 'd1', img: THEMED }] },
          { target: 'Macro', batch: [{ _id: 'm1', img: THEMED }] },
        ],
      );
    });

    it('Should migrate world compendia only, restoring their lock', async function () {
      const configured = [];
      const pack = (packageType, documentName) => ({
        metadata: { packageType },
        documentName,
        collection: `${packageType}.${documentName}`,
        locked: true,
        configure: async (config) => configured.push(config),
        getDocuments: async () => [new FakeDocument({ _id: 'p1', img: LEGACY })],
        documentClass: { updateDocuments: record(`${packageType}.${documentName}`) },
      });
      setGlobals({ packs: [pack('world', 'Macro'), pack('system', 'Macro'), pack('world', 'Playlist')] });

      await run();

      expect(updates.map(({ target }) => target)).to.eql(['world.Macro']);
      expect(updates[0].options.pack).to.be('world.Macro');
      expect(configured).to.eql([{ locked: false }, { locked: true }]);
    });

    it('Should keep the version when a document fails, so the migration runs again', async function () {
      const broken = new FakeDocument({ _id: 'a1', img: LEGACY });
      broken.toObject = () => {
        throw new Error('invalid');
      };
      broken.items = [];
      const valid = new FakeDocument({ _id: 'i1', type: 'armour', img: LEGACY });
      setGlobals({ documents: { actors: [broken], items: [valid] } });

      await run();

      expect(updates.map(({ target }) => target)).to.eql(['Item']);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)[0]).to.be('error');
    });

    it('Should fail every requested document when an update returns no documents', async function () {
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      game.macros.documentClass.updateDocuments = async () => [];

      await run();

      expect(storedVersion).to.be(0);
      expect(notifications).to.eql([
        ['warn', 'OQ.Migration.Begin'],
        ['remove', 'OQ.Migration.Begin'],
        ['error', 'OQ.Migration.Failed {"count":1}'],
      ]);
    });

    it('Should count partial updates as failures and continue later batches and collections', async function () {
      const items = Array.from(
        { length: 101 },
        (_, index) => new FakeDocument({ _id: `i${index}`, type: 'armour', img: LEGACY }),
      );
      setGlobals({ documents: { items, macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      const update = game.items.documentClass.updateDocuments;
      game.items.documentClass.updateDocuments = async (batch, options) => {
        const documents = await update(batch, options);
        return documents.filter((document) => document.id !== 'i0' && document.id !== 'i1');
      };

      await run();

      expect(updates.map(({ target, batch }) => [target, batch.length])).to.eql([
        ['Item', 100],
        ['Item', 1],
        ['Macro', 1],
      ]);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":2}']);
    });

    it('Should accept all requested document IDs returned in a different order', async function () {
      const macros = ['m1', 'm2'].map((_id) => new FakeDocument({ _id, img: LEGACY }));
      setGlobals({ documents: { macros } });
      const update = game.macros.documentClass.updateDocuments;
      game.macros.documentClass.updateDocuments = async (batch, options) => (await update(batch, options)).reverse();

      await run();

      expect(storedVersion).to.be(LATEST_MIGRATION_VERSION);
      expect(notifications.at(-1)).to.eql(['info', 'OQ.Migration.Complete']);
    });

    it('Should not let duplicate or unrelated returned IDs mask omitted documents', async function () {
      const macros = ['m1', 'm2', 'm3'].map((_id) => new FakeDocument({ _id, img: LEGACY }));
      setGlobals({ documents: { macros } });
      game.macros.documentClass.updateDocuments = async () => [
        macros[0],
        macros[0],
        new FakeDocument({ _id: 'other' }),
      ];

      await run();

      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":2}']);
    });

    it('Should keep the version when an embedded update omits a document', async function () {
      const actor = new FakeDocument(
        { _id: 'a1', img: THEMED },
        {
          items: [new FakeDocument({ _id: 'i1', type: 'armour', img: LEGACY })],
          updateEmbeddedDocuments: async () => [],
        },
      );
      setGlobals({ documents: { actors: [actor] } });

      await run();

      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":1}']);
    });

    it('Should restore the compendium lock and keep the version when its update omits a document', async function () {
      const configured = [];
      const pack = {
        metadata: { packageType: 'world' },
        documentName: 'Macro',
        collection: 'world.macros',
        locked: true,
        configure: async (config) => configured.push(config),
        getDocuments: async () => [new FakeDocument({ _id: 'p1', img: LEGACY })],
        documentClass: { updateDocuments: async () => [] },
      };
      setGlobals({ packs: [pack] });

      await run();

      expect(configured).to.eql([{ locked: false }, { locked: true }]);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":1}']);
    });

    it('Should count a rejected batch as failed and continue other collections', async function () {
      const items = ['i1', 'i2'].map((_id) => new FakeDocument({ _id, type: 'armour', img: LEGACY }));
      setGlobals({ documents: { items, macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      game.items.documentClass.updateDocuments = async () => {
        throw new Error('write failed');
      };

      await run();

      expect(updates.map(({ target }) => target)).to.eql(['Macro']);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":2}']);
    });

    it('Should retry only unsaved changes after reloading persisted documents', async function () {
      const persisted = ['m1', 'm2'].map((_id) => ({ _id, img: LEGACY }));
      const load = (skipId) => {
        const macros = persisted.map((source) => new FakeDocument(structuredClone(source)));
        setGlobals({ documents: { macros } });
        const update = game.macros.documentClass.updateDocuments;
        game.macros.documentClass.updateDocuments = async (batch, options) => {
          const documents = await update(batch, options);
          const saved = documents.filter((document) => document.id !== skipId);
          for (const document of saved) {
            _.merge(
              persisted.find((source) => source._id === document.id),
              document.toObject(),
            );
          }
          return saved;
        };
        return macros;
      };
      const firstLoad = load('m2');

      await run();

      expect(firstLoad.map((document) => document.source.img)).to.eql([THEMED, THEMED]);
      expect(persisted.map((source) => source.img)).to.eql([THEMED, LEGACY]);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":1}']);

      const secondLoad = load();
      expect(secondLoad.map((document) => document.source.img)).to.eql([THEMED, LEGACY]);
      updates = [];
      notifications = [];

      await run();

      expect(updates.map(({ batch }) => batch)).to.eql([[{ _id: 'm2', img: THEMED }]]);
      expect(persisted.map((source) => source.img)).to.eql([THEMED, THEMED]);
      expect(storedVersion).to.be(LATEST_MIGRATION_VERSION);
      expect(notifications.at(-1)).to.eql(['info', 'OQ.Migration.Complete']);
    });

    it('Should apply the changes in memory before the world is stored', function () {
      const actor = new FakeDocument({ _id: 'a1', img: LEGACY }, { items: [] });
      const message = new FakeDocument({ _id: 'c1', content: `<img src="${LEGACY}">` });
      setGlobals({ documents: { actors: [actor], messages: [message] } });

      applyPendingMigrations();

      expect(actor.source.img).to.be(THEMED);
      expect(message.source.content).to.be(`<img src="${THEMED}">`);
      expect(updates).to.eql([]);
    });

    it('Should only apply the changes in memory for a player', async function () {
      const macro = new FakeDocument({ _id: 'm1', img: LEGACY });
      setGlobals({ isGM: false, documents: { macros: [macro] } });

      await run();

      expect(macro.source.img).to.be(THEMED);
      expect(updates).to.eql([]);
      expect(notifications).to.eql([]);
      expect(storedVersion).to.be(0);
    });

    it('Should do nothing for an up to date world', async function () {
      storedVersion = LATEST_MIGRATION_VERSION;
      const macro = new FakeDocument({ _id: 'm1', img: LEGACY });
      setGlobals({ documents: { macros: [macro] } });

      await run();

      expect(macro.source.img).to.be(LEGACY);
      expect(updates).to.eql([]);
      expect(notifications).to.eql([]);
    });

    it('Should warn when the world was migrated by a newer version', async function () {
      storedVersion = LATEST_MIGRATION_VERSION + 1;
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });

      await run();

      expect(updates).to.eql([]);
      expect(notifications.map(([type]) => type)).to.eql(['warn']);
      expect(storedVersion).to.be(LATEST_MIGRATION_VERSION + 1);
    });
  });
});
