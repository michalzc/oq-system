import assert from 'node:assert/strict';
import expect from 'expect.js';
import { themedIconPath, themedIconsMigration } from '../src/module/migration/migration-1-themed-icons.js';
import { LATEST_MIGRATION_VERSION, migrations, pendingMigrations } from '../src/module/migration/migrations.js';
import { migrateWorld } from '../src/module/migration/migration-runner.js';
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
      expect(handlers.Actor(source, helpers)).to.eql({ img: THEMED, 'prototypeToken.texture.src': THEMED });
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
        'texture.src': THEMED,
        'delta.img': THEMED,
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
        'text.content': `<img src="${THEMED}">`,
      });
      expect(handlers.JournalEntryPage({ src: null, text: { content: null } }, helpers)).to.eql({});
    });
  });
});

describe('migration-runner.js', function () {
  describe('#migrateWorld()', function () {
    let savedGlobals;
    let storedVersion;
    let updates;
    let notifications;

    const record = (target) => async (batch, options) => {
      updates.push({ target, batch, options });
      return batch;
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
        messages: collection('ChatMessage', []),
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
        { updateEmbeddedDocuments: async (name, batch) => updates.push({ target: `a1.${name}`, batch }) },
      );
      actor.items = [new FakeDocument({ _id: 'i1', type: 'armour', img: LEGACY })];
      setGlobals({ documents: { actors: [actor], macros: [new FakeDocument({ _id: 'm1', img: THEMED })] } });

      await migrateWorld();

      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 'Actor', batch: [{ _id: 'a1', img: THEMED }] },
          { target: 'a1.Item', batch: [{ _id: 'i1', img: THEMED }] },
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
        updateEmbeddedDocuments: async (name, batch) => updates.push({ target: `t1.${name}`, batch }),
      };
      const token = new FakeDocument(
        { _id: 't1', texture: { src: LEGACY }, delta: { img: null } },
        { actorLink: false, delta: { items }, actor: tokenActor },
      );
      const scene = new FakeDocument(
        { _id: 's1' },
        {
          tokens: [token],
          updateEmbeddedDocuments: async (name, batch) => updates.push({ target: `s1.${name}`, batch }),
        },
      );
      setGlobals({ documents: { scenes: [scene] } });

      await migrateWorld();

      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 's1.Token', batch: [{ _id: 't1', 'texture.src': THEMED }] },
          { target: 't1.Item', batch: [{ _id: 'd1', img: THEMED }] },
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

      await migrateWorld();

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

      await migrateWorld();

      expect(updates.map(({ target }) => target)).to.eql(['Item']);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)[0]).to.be('error');
    });

    it('Should do nothing for a player or an up to date world', async function () {
      setGlobals({ isGM: false, documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      await migrateWorld();

      storedVersion = LATEST_MIGRATION_VERSION;
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      await migrateWorld();

      expect(updates).to.eql([]);
      expect(notifications).to.eql([]);
    });

    it('Should warn when the world was migrated by a newer version', async function () {
      storedVersion = LATEST_MIGRATION_VERSION + 1;
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });

      await migrateWorld();

      expect(updates).to.eql([]);
      expect(notifications.map(([type]) => type)).to.eql(['warn']);
      expect(storedVersion).to.be(LATEST_MIGRATION_VERSION + 1);
    });
  });
});
