import assert from 'node:assert/strict';
import expect from 'expect.js';
import _ from 'lodash-es';
import { themedIconPath, themedIconsMigration } from '../src/module/migration/migration-1-themed-icons.js';
import { embeddedNewActorFlagMigration } from '../src/module/migration/migration-2-embedded-new-actor-flag.js';
import { legacyHpExcessMigration } from '../src/module/migration/migration-3-legacy-hp-excess.js';
import { legacyMpExcessMigration } from '../src/module/migration/migration-4-legacy-mp-excess.js';
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
    expect(pendingMigrations(0, migrations)).to.eql(migrations);
    expect(pendingMigrations(LATEST_MIGRATION_VERSION, migrations)).to.eql([]);
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

    it('Should migrate roll table and table result images and descriptions', function () {
      for (const handler of [handlers.RollTable, handlers.TableResult]) {
        expect(handler({ img: LEGACY, description: `<img src="${LEGACY}">` }, helpers)).to.eql({
          img: THEMED,
          description: `<img src="${THEMED}">`,
        });
        expect(handler({ img: THEMED, description: '' }, helpers)).to.eql({});
        expect(handler({ img: null }, helpers)).to.eql({});
      }
    });
  });
});

describe('migration-2-embedded-new-actor-flag.js', function () {
  const { Item } = embeddedNewActorFlagMigration.handlers;
  const remove = () => 'removed';
  const marked = { _id: 'i1', flags: { oq: { newActor: ['character'] } } };

  it('Should clear the default item mark of an item in an actor', function () {
    expect(Item(marked, { parent: {}, remove })).to.eql({ flags: { oq: { newActor: 'removed' } } });
  });

  it('Should keep the mark of items outside actors', function () {
    expect(Item(marked, { parent: null, remove })).to.eql({});
  });

  it('Should leave items in actors without the mark alone', function () {
    expect(Item({ _id: 'i2', flags: {} }, { parent: {}, remove })).to.eql({});
    expect(Item({ _id: 'i3', flags: { oq: {} } }, { parent: {}, remove })).to.eql({});
  });
});

/** An actor source with SIZ 10 and CON 10: HP normal maximum 10 plus the HP modifier. */
const actorSource = (hp, extra = {}) => ({
  _id: 'a1',
  type: 'character',
  system: {
    characteristics: { siz: { base: 10, mod: 0 }, con: { base: 10, mod: 0 }, pow: { base: 10, mod: 0 } },
    attributes: { hp: { mod: 0, max: 0, ...hp }, mp: { mod: 0, max: 0, value: 14 } },
  },
  ...extra,
});
// The label is stored translated; the stub translation marks it.
const recoveredPool = (remaining) => ({ id: 'recoveredExcess', label: 'i18n:OQ.Resources.RecoveredExcess', remaining });
const i18n = { localize: (key) => `i18n:${key}` };

describe('migration-3-legacy-hp-excess.js', function () {
  const { Actor, Token } = legacyHpExcessMigration.handlers;
  let savedGame;

  before(function () {
    savedGame = globalThis.game;
    globalThis.game = { i18n };
  });

  after(function () {
    if (savedGame === undefined) delete globalThis.game;
    else globalThis.game = savedGame;
  });

  describe('Actor', function () {
    it('Should persist HP above the normal maximum as a recovered excess pool', function () {
      expect(Actor(actorSource({ value: 15 }), helpers)).to.eql({
        system: { attributes: { hp: { value: 10, pools: [recoveredPool(5)] } } },
      });
    });

    it('Should persist an empty pool list for HP within the normal maximum', function () {
      expect(Actor(actorSource({ value: 6 }), helpers)).to.eql({
        system: { attributes: { hp: { value: 6, pools: [] } } },
      });
    });

    it('Should persist a source converted on load as it is, without reinterpreting it', function () {
      // Loaded actors were converted by their data model, so the stored HP is written from them.
      const loaded = actorSource({ value: 10, pools: [recoveredPool(5)] });
      expect(Actor(loaded, helpers)).to.eql({
        system: { attributes: { hp: { value: 10, pools: [recoveredPool(5)] } } },
      });
      // A lowered HP modifier makes the maximum 4; the converted actor keeps HP 6 and gets no recovery pool.
      const lowered = actorSource({ value: 6, mod: -6, pools: [] });
      expect(Actor(lowered, helpers)).to.eql({ system: { attributes: { hp: { value: 6, pools: [] } } } });
    });

    it('Should leave MP and other actor data alone', function () {
      const changes = Actor(actorSource({ value: 15 }), helpers);
      expect(Object.keys(changes)).to.eql(['system']);
      expect(Object.keys(changes.system.attributes)).to.eql(['hp']);
    });

    it('Should make no effect changes to an actor with legacy active effects', function () {
      const effects = [
        { _id: 'e1', name: 'Old buff', changes: [{ key: 'system.attributes.hp.value', mode: 2, value: '5' }] },
        { _id: 'e2', name: 'Module effect', changes: [{ key: 'system.attributes.hp.max', mode: 5, value: '30' }] },
      ];
      const changes = Actor(actorSource({ value: 15 }, { effects }), helpers);
      expect(changes).to.not.have.key('effects');
      expect(Object.keys(changes)).to.eql(['system']);
    });

    it('Should return no changes for an actor without HP', function () {
      expect(Actor({ _id: 'a1', img: THEMED }, helpers)).to.eql({});
    });
  });

  describe('Token', function () {
    const convertedBase = actorSource({ value: 10, pools: [recoveredPool(5)] });
    const tokenHelpers = { ...helpers, worldActor: (id) => (id === 'a1' ? structuredClone(convertedBase) : null) };
    const token = (delta, extra = {}) => ({ _id: 't1', actorId: 'a1', actorLink: false, delta, ...extra });

    it('Should give a delta overriding HP its own empty pool list instead of the base recovery pool', function () {
      const source = token({ system: { attributes: { hp: { value: 6 } } } });
      expect(Token(source, tokenHelpers)).to.eql({
        delta: { system: { attributes: { hp: { value: 6, pools: [] } } } },
      });
    });

    it('Should recover the excess stored in a delta into its own pool', function () {
      const source = token({ system: { attributes: { hp: { value: 15 } } } });
      expect(Token(source, tokenHelpers)).to.eql({
        delta: { system: { attributes: { hp: { value: 10, pools: [recoveredPool(5)] } } } },
      });
    });

    it("Should compute the maximum from the delta's characteristics and modifier merged over the base actor's", function () {
      const source = token({
        system: { characteristics: { con: { base: 14 } }, attributes: { hp: { value: 15, mod: -1 } } },
      });
      // round((10 + 14) / 2) - 1 = 11
      expect(Token(source, tokenHelpers)).to.eql({
        delta: { system: { attributes: { hp: { value: 11, pools: [recoveredPool(4)] } } } },
      });
    });

    it('Should leave a delta that does not override HP inheriting the base actor', function () {
      expect(Token(token({ system: { attributes: { mp: { value: 3 } } } }), tokenHelpers)).to.eql({});
      expect(Token(token({ system: {} }), tokenHelpers)).to.eql({});
      expect(Token(token({ img: null }), tokenHelpers)).to.eql({});
      expect(Token(token(undefined), tokenHelpers)).to.eql({});
    });

    it('Should return no changes for a delta that already has a pool list', function () {
      const source = token({ system: { attributes: { hp: { value: 15, pools: [] } } } });
      expect(Token(source, tokenHelpers)).to.eql({});
    });

    it('Should leave linked tokens and tokens without a base actor alone', function () {
      const delta = { system: { attributes: { hp: { value: 15 } } } };
      expect(Token(token(delta, { actorLink: true }), tokenHelpers)).to.eql({});
      expect(Token(token(delta, { actorId: 'missing' }), tokenHelpers)).to.eql({});
    });
  });
});

/** An actor source with POW 10: MP normal maximum 10 plus the MP modifier. HP is already converted. */
const mpActorSource = (mp, extra = {}) =>
  _.merge(actorSource({ value: 6, pools: [] }, extra), { system: { attributes: { mp: { value: 0, ...mp } } } });

describe('migration-4-legacy-mp-excess.js', function () {
  const { Actor, Token } = legacyMpExcessMigration.handlers;
  let savedGame;

  before(function () {
    savedGame = globalThis.game;
    globalThis.game = { i18n };
  });

  after(function () {
    if (savedGame === undefined) delete globalThis.game;
    else globalThis.game = savedGame;
  });

  it('Should come after the HP migration', function () {
    expect(legacyMpExcessMigration.version).to.be.greaterThan(legacyHpExcessMigration.version);
  });

  describe('Actor', function () {
    it('Should persist MP above the normal maximum as a recovered excess pool', function () {
      // v0.8 actor: MP maximum 10, stored 14.
      expect(Actor(mpActorSource({ value: 14 }), helpers)).to.eql({
        system: { attributes: { mp: { value: 10, pools: [recoveredPool(4)] } } },
      });
    });

    it('Should persist an empty pool list for MP within the normal maximum', function () {
      expect(Actor(mpActorSource({ value: 7 }), helpers)).to.eql({
        system: { attributes: { mp: { value: 7, pools: [] } } },
      });
    });

    it('Should persist a source converted on load as it is, without reinterpreting it', function () {
      const loaded = mpActorSource({ value: 10, pools: [recoveredPool(4)] });
      expect(Actor(loaded, helpers)).to.eql({
        system: { attributes: { mp: { value: 10, pools: [recoveredPool(4)] } } },
      });
      // A lowered MP modifier makes the maximum 4; the converted actor keeps MP 6 and gets no recovery pool.
      const lowered = mpActorSource({ value: 6, mod: -6, pools: [] });
      expect(Actor(lowered, helpers)).to.eql({ system: { attributes: { mp: { value: 6, pools: [] } } } });
    });

    it('Should leave HP and other actor data alone', function () {
      const legacyHp = actorSource({ value: 15 }, { effects: [{ _id: 'e1', name: 'Old buff', changes: [] }] });
      const changes = Actor(legacyHp, helpers);
      expect(Object.keys(changes)).to.eql(['system']);
      expect(Object.keys(changes.system.attributes)).to.eql(['mp']);
    });

    it('Should return no changes for an actor without MP', function () {
      expect(Actor({ _id: 'a1', img: THEMED }, helpers)).to.eql({});
    });
  });

  describe('Token', function () {
    // Base actor MP 9 of 10, converted on load.
    const base = mpActorSource({ value: 9, pools: [] });
    const tokenHelpers = { ...helpers, worldActor: (id) => (id === 'a1' ? structuredClone(base) : null) };
    const token = (delta, extra = {}) => ({ _id: 't1', actorId: 'a1', actorLink: false, delta, ...extra });
    const mpDelta = (mp) => ({ system: { attributes: { mp } } });

    it('Should recover the excess of each overriding delta into its own pool', function () {
      // Two unlinked tokens with MP 12 and 15, base actor MP 9 of 10.
      expect(Token(token(mpDelta({ value: 12 })), tokenHelpers)).to.eql({
        delta: mpDelta({ value: 10, pools: [recoveredPool(2)] }),
      });
      expect(Token(token(mpDelta({ value: 15 }), { _id: 't2' }), tokenHelpers)).to.eql({
        delta: mpDelta({ value: 10, pools: [recoveredPool(5)] }),
      });
    });

    it('Should give a delta overriding MP within the maximum its own empty pool list', function () {
      expect(Token(token(mpDelta({ value: 6 })), tokenHelpers)).to.eql({ delta: mpDelta({ value: 6, pools: [] }) });
    });

    it("Should compute the maximum from the delta's POW and modifier merged over the base actor's", function () {
      const source = token({
        system: { characteristics: { pow: { base: 14 } }, attributes: { mp: { value: 15, mod: -2 } } },
      });
      // 14 - 2 = 12
      expect(Token(source, tokenHelpers)).to.eql({ delta: mpDelta({ value: 12, pools: [recoveredPool(3)] }) });
    });

    it('Should leave a delta that does not override MP inheriting the base actor', function () {
      expect(Token(token({ system: { attributes: { hp: { value: 3 } } } }), tokenHelpers)).to.eql({});
      expect(Token(token({ system: {} }), tokenHelpers)).to.eql({});
      expect(Token(token(undefined), tokenHelpers)).to.eql({});
    });

    it('Should return no changes for a delta that already has an MP pool list', function () {
      expect(Token(token(mpDelta({ value: 15, pools: [] })), tokenHelpers)).to.eql({});
    });

    it('Should leave linked tokens and tokens without a base actor alone', function () {
      expect(Token(token(mpDelta({ value: 15 }), { actorLink: true }), tokenHelpers)).to.eql({});
      expect(Token(token(mpDelta({ value: 15 }), { actorId: 'missing' }), tokenHelpers)).to.eql({});
    });
  });
});

describe('migration-runner.js', function () {
  describe('#applyPendingMigrations() and #migrateWorld()', function () {
    let savedGlobals;
    let storedVersion;
    let updates;
    let notifications;
    let dialogs;
    // The GM's answer to the failed migration dialog, null when it is closed.
    let dialogAnswer;

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

    // Generic runner behaviour runs on fixture migrations, so registering a new migration leaves these tests alone.
    const DOCUMENT_NAMES = ['Actor', 'Item', 'Scene', 'Token', 'Macro', 'ChatMessage', 'RollTable', 'TableResult'];
    const replaceLegacyIcon = (source) => (source.img === LEGACY ? { img: THEMED } : {});
    const iconMigration = {
      version: 1,
      name: 'Icons',
      handlers: Object.fromEntries(DOCUMENT_NAMES.map((documentName) => [documentName, replaceLegacyIcon])),
    };

    const run = async (migrationList = [iconMigration]) => {
      applyPendingMigrations(migrationList);
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
      Object.assign(documents, {
        documentName,
        documentClass: { updateDocuments: record(documentName) },
        get: (id) => documents.find((document) => document.id === id),
      });

    function setGlobals({ isGM = true, documents = {}, packs = [] } = {}) {
      globalThis.CONFIG = { OQ: { SYSTEM_ID: 'oq', SettingsConfig } };
      globalThis.foundry = {
        data: {
          operators: {
            ForcedReplacement: { create: (value) => ({ replaced: value }) },
            ForcedDeletion: class ForcedDeletion {},
          },
        },
        applications: {
          api: {
            DialogV2: {
              wait: async (config) => {
                dialogs.push(config);
                return dialogAnswer;
              },
            },
          },
        },
      };
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
        i18n: { ...i18n, format: (key, data) => `${key} ${JSON.stringify(data)}` },
        actors: collection('Actor', documents.actors ?? []),
        items: collection('Item', documents.items ?? []),
        scenes: collection('Scene', documents.scenes ?? []),
        journal: collection('JournalEntry', []),
        macros: collection('Macro', documents.macros ?? []),
        messages: collection('ChatMessage', documents.messages ?? []),
        tables: collection('RollTable', documents.tables ?? []),
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
      dialogs = [];
      dialogAnswer = null;
    });

    it('Should migrate world documents with their embedded documents and store the version', async function () {
      const actor = new FakeDocument({ _id: 'a1', img: LEGACY }, { updateEmbeddedDocuments: recordEmbedded('a1') });
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
      expect(storedVersion).to.be(iconMigration.version);
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
        { _id: 't1', img: LEGACY },
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
          { target: 's1.Token', batch: [{ _id: 't1', img: THEMED }] },
          { target: 't1.Item', batch: [{ _id: 'd1', img: THEMED }] },
          { target: 'Macro', batch: [{ _id: 'm1', img: THEMED }] },
        ],
      );
    });

    it('Should clear the default item mark of items in actors and token deltas only', async function () {
      const marked = (_id) => ({ _id, type: 'armour', img: THEMED, flags: { oq: { newActor: ['character'] } } });
      const actor = new FakeDocument({ _id: 'a1', img: THEMED }, { updateEmbeddedDocuments: recordEmbedded('a1') });
      actor.items = [new FakeDocument(marked('i1'))];
      const deltaItems = Object.assign([new FakeDocument(marked('d1'))], { manages: () => true });
      const token = new FakeDocument(
        { _id: 't1', texture: { src: THEMED } },
        { actorLink: false, delta: { items: deltaItems }, actor: { updateEmbeddedDocuments: recordEmbedded('t1') } },
      );
      const scene = new FakeDocument({ _id: 's1' }, { tokens: [token], updateEmbeddedDocuments: recordEmbedded('s1') });
      const worldItem = new FakeDocument(marked('i2'));
      setGlobals({ documents: { actors: [actor], items: [worldItem], scenes: [scene] } });

      await run([embeddedNewActorFlagMigration]);

      const removed = { flags: { oq: { newActor: new foundry.data.operators.ForcedDeletion() } } };
      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 'a1.Item', batch: [{ _id: 'i1', ...removed }] },
          { target: 't1.Item', batch: [{ _id: 'd1', ...removed }] },
        ],
      );
      expect(worldItem.source.flags.oq.newActor).to.eql(['character']);
      expect(storedVersion).to.be(embeddedNewActorFlagMigration.version);
    });

    it('Should migrate roll tables with their results', async function () {
      const table = new FakeDocument(
        { _id: 'r1', img: LEGACY, description: '' },
        { updateEmbeddedDocuments: recordEmbedded('r1') },
      );
      table.results = [
        new FakeDocument({ _id: 'tr1', img: LEGACY, description: '' }),
        new FakeDocument({ _id: 'tr2', img: 'icons/svg/d20.svg', description: '' }),
      ];
      setGlobals({ documents: { tables: [table] } });

      await run();

      assert.deepEqual(
        updates.map(({ target, batch }) => ({ target, batch })),
        [
          { target: 'RollTable', batch: [{ _id: 'r1', img: THEMED }] },
          { target: 'r1.TableResult', batch: [{ _id: 'tr1', img: THEMED }] },
        ],
      );
      expect(storedVersion).to.be(iconMigration.version);
    });

    it('Should migrate world compendia only, restoring their lock', async function () {
      const configured = [];
      const pack = (packageType, documentName) => ({
        metadata: { packageType },
        documentName,
        collection: `${packageType}.${documentName}`,
        locked: true,
        configure: async (config) => configured.push(config),
        getDocuments: async () => [new FakeDocument({ _id: 'p1', img: LEGACY }, { results: [] })],
        documentClass: { updateDocuments: record(`${packageType}.${documentName}`) },
      });
      setGlobals({
        packs: [
          pack('world', 'Macro'),
          pack('system', 'Macro'),
          pack('world', 'Playlist'),
          pack('world', 'RollTable'),
          pack('system', 'RollTable'),
        ],
      });

      await run();

      expect(updates.map(({ target }) => target)).to.eql(['world.Macro', 'world.RollTable']);
      expect(updates[0].options.pack).to.be('world.Macro');
      expect(updates[1].options.pack).to.be('world.RollTable');
      // The migration unlocks both world packs and locks them again.
      expect(configured).to.eql([{ locked: false }, { locked: true }, { locked: false }, { locked: true }]);
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
      expect(dialogs.map(({ content }) => content)).to.eql(['<p>OQ.Migration.SkipPrompt {"version":1,"count":1}</p>']);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)[0]).to.be('error');
    });

    it('Should keep the version when the GM chooses to retry', async function () {
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      game.macros.documentClass.updateDocuments = async () => [];
      dialogAnswer = 'retry';

      await run();

      expect(dialogs.length).to.be(1);
      expect(storedVersion).to.be(0);
      expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":1}']);
    });

    it('Should store the version and warn when the GM skips the failed documents', async function () {
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      game.macros.documentClass.updateDocuments = async () => [];
      dialogAnswer = 'skip';

      await run();

      expect(dialogs.length).to.be(1);
      expect(storedVersion).to.be(iconMigration.version);
      expect(notifications).to.eql([
        ['warn', 'OQ.Migration.Begin'],
        ['remove', 'OQ.Migration.Begin'],
        ['warn', 'OQ.Migration.CompleteSkipped {"count":1}'],
      ]);
    });

    describe('with a later migration', function () {
      let later;

      beforeEach(function () {
        later = {
          version: iconMigration.version + 1,
          name: 'Rename',
          handlers: { Macro: (source) => (source.name === 'old' ? { name: 'new' } : {}) },
        };
      });

      const runBoth = () => run([iconMigration, later]);

      it('Should run the later migration after the GM skips the failed documents', async function () {
        setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY, name: 'old' })] } });
        const update = game.macros.documentClass.updateDocuments;
        game.macros.documentClass.updateDocuments = async (batch, options) =>
          batch[0].img ? [] : update(batch, options);
        dialogAnswer = 'skip';

        await runBoth();

        expect(dialogs.length).to.be(1);
        expect(updates.map(({ batch }) => batch)).to.eql([[{ _id: 'm1', name: 'new' }]]);
        expect(storedVersion).to.be(later.version);
        expect(notifications.at(-1)).to.eql(['warn', 'OQ.Migration.CompleteSkipped {"count":1}']);
      });

      it('Should store the earlier migration when only the later one fails', async function () {
        const macros = ['m1', 'm2'].map((_id) => new FakeDocument({ _id, img: LEGACY }));
        setGlobals({ documents: { macros } });
        later.handlers.Macro = () => {
          throw new Error('invalid');
        };

        await runBoth();

        expect(updates.map(({ batch }) => batch)).to.eql([
          [
            { _id: 'm1', img: THEMED },
            { _id: 'm2', img: THEMED },
          ],
        ]);
        expect(dialogs.map(({ content }) => content)).to.eql([
          `<p>OQ.Migration.SkipPrompt {"version":${later.version},"count":2}</p>`,
        ]);
        expect(storedVersion).to.be(iconMigration.version);
        expect(notifications.at(-1)).to.eql(['error', 'OQ.Migration.Failed {"count":2}']);
      });
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

    it('Should count a batch as saved when its update does not return an array', async function () {
      setGlobals({ documents: { macros: [new FakeDocument({ _id: 'm1', img: LEGACY })] } });
      const update = game.macros.documentClass.updateDocuments;
      game.macros.documentClass.updateDocuments = async (batch, options) => {
        await update(batch, options);
      };

      await run();

      expect(updates.length).to.be(1);
      expect(dialogs).to.eql([]);
      expect(storedVersion).to.be(iconMigration.version);
      expect(notifications.at(-1)).to.eql(['info', 'OQ.Migration.Complete']);
    });

    it('Should accept all requested document IDs returned in a different order', async function () {
      const macros = ['m1', 'm2'].map((_id) => new FakeDocument({ _id, img: LEGACY }));
      setGlobals({ documents: { macros } });
      const update = game.macros.documentClass.updateDocuments;
      game.macros.documentClass.updateDocuments = async (batch, options) => (await update(batch, options)).reverse();

      await run();

      expect(storedVersion).to.be(iconMigration.version);
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
      expect(storedVersion).to.be(iconMigration.version);
      expect(notifications.at(-1)).to.eql(['info', 'OQ.Migration.Complete']);
    });

    describe('legacy HP and MP excess', function () {
      // HP stored 15 of 10 and MP 14 of 10, unless given.
      const legacyActor = (_id, hp = 15, mp = 14) =>
        _.merge(actorSource({ value: hp }, { _id }), { system: { attributes: { mp: { value: mp } } } });
      const pointsOf = (source) =>
        _.mapValues(_.pick(source.system.attributes, ['hp', 'mp']), (resource) => _.pick(resource, ['value', 'pools']));
      const unlinked = (_id, delta) => new FakeDocument({ _id, actorId: 'a1', actorLink: false, delta });
      const resourceDelta = (resource, points) => ({ system: { attributes: { [resource]: points } } });
      const runExcess = () => run([legacyHpExcessMigration, legacyMpExcessMigration]);

      it('Should persist world actors and give each overriding token delta its own pool lists', async function () {
        // Base actor MP 9 of 10; unlinked tokens override HP 6, MP 12 and MP 15, and one inherits everything.
        const actor = new FakeDocument(legacyActor('a1', 15, 9), { items: [] });
        const tokens = [
          unlinked('t1', resourceDelta('hp', { value: 6 })),
          unlinked('t2', resourceDelta('mp', { value: 12 })),
          unlinked('t3', resourceDelta('mp', { value: 15 })),
          unlinked('t4', { system: {} }),
        ];
        const scene = new FakeDocument({ _id: 's1' }, { tokens, updateEmbeddedDocuments: recordEmbedded('s1') });
        setGlobals({ documents: { actors: [actor], scenes: [scene] } });

        await runExcess();

        assert.deepEqual(
          updates.map(({ target, batch }) => ({ target, batch })),
          [
            {
              target: 'Actor',
              batch: [{ _id: 'a1', system: { attributes: { hp: { value: 10, pools: [recoveredPool(5)] } } } }],
            },
            { target: 's1.Token', batch: [{ _id: 't1', delta: resourceDelta('hp', { value: 6, pools: [] }) }] },
            {
              target: 'Actor',
              batch: [{ _id: 'a1', system: { attributes: { mp: { value: 9, pools: [] } } } }],
            },
            {
              target: 's1.Token',
              batch: [
                { _id: 't2', delta: resourceDelta('mp', { value: 10, pools: [recoveredPool(2)] }) },
                { _id: 't3', delta: resourceDelta('mp', { value: 10, pools: [recoveredPool(5)] }) },
              ],
            },
          ],
        );
        expect(pointsOf(actor.source)).to.eql({
          hp: { value: 10, pools: [recoveredPool(5)] },
          mp: { value: 9, pools: [] },
        });
        expect(tokens[0].source.delta).to.eql(resourceDelta('hp', { value: 6, pools: [] }));
        expect(tokens[3].source.delta).to.eql({ system: {} });
        expect(storedVersion).to.be(legacyMpExcessMigration.version);
      });

      it('Should convert actors in locked world compendia, keeping their IDs and restoring the lock', async function () {
        const configured = [];
        const packDocument = new FakeDocument(legacyActor('p1'), { items: [] });
        const pack = {
          metadata: { packageType: 'world' },
          documentName: 'Actor',
          collection: 'world.monsters',
          locked: true,
          configure: async (config) => configured.push(config),
          getDocuments: async () => [packDocument],
          documentClass: { updateDocuments: record('world.monsters') },
        };
        setGlobals({ packs: [pack] });

        await runExcess();

        expect(updates.map(({ target, batch, options }) => [target, batch, options.pack])).to.eql([
          [
            'world.monsters',
            [{ _id: 'p1', system: { attributes: { hp: { value: 10, pools: [recoveredPool(5)] } } } }],
            'world.monsters',
          ],
          [
            'world.monsters',
            [{ _id: 'p1', system: { attributes: { mp: { value: 10, pools: [recoveredPool(4)] } } } }],
            'world.monsters',
          ],
        ]);
        // Each migration unlocks the pack and locks it again.
        expect(configured).to.eql([{ locked: false }, { locked: true }, { locked: false }, { locked: true }]);
        expect(storedVersion).to.be(legacyMpExcessMigration.version);
      });

      it('Should give the same totals and one recovery pool per resource when retried', async function () {
        const persisted = [legacyActor('a1'), legacyActor('a2', 13, 12)];
        const load = (skipId) => {
          const actors = persisted.map((source) => new FakeDocument(structuredClone(source), { items: [] }));
          setGlobals({ documents: { actors } });
          const update = game.actors.documentClass.updateDocuments;
          game.actors.documentClass.updateDocuments = async (batch, options) => {
            const saved = (await update(batch, options)).filter((document) => document.id !== skipId);
            for (const document of saved) {
              const stored = persisted.find((source) => source._id === document.id);
              for (const [key, points] of Object.entries(document.toObject().system.attributes)) {
                Object.assign(stored.system.attributes[key], points);
              }
            }
            return saved;
          };
        };

        // The HP step fails for a2, so the GM retries and the MP step waits.
        load('a2');
        await runExcess();

        expect(storedVersion).to.be(0);
        expect(persisted.map(pointsOf)).to.eql([
          { hp: { value: 10, pools: [recoveredPool(5)] }, mp: { value: 14 } },
          { hp: { value: 13 }, mp: { value: 12 } },
        ]);

        load();
        await runExcess();

        expect(storedVersion).to.be(legacyMpExcessMigration.version);
        expect(persisted.map(pointsOf)).to.eql([
          { hp: { value: 10, pools: [recoveredPool(5)] }, mp: { value: 10, pools: [recoveredPool(4)] } },
          { hp: { value: 10, pools: [recoveredPool(3)] }, mp: { value: 10, pools: [recoveredPool(2)] } },
        ]);
      });
    });

    it('Should apply the changes in memory before the world is stored', function () {
      const actor = new FakeDocument({ _id: 'a1', img: LEGACY }, { items: [] });
      const message = new FakeDocument({ _id: 'c1', img: LEGACY });
      setGlobals({ documents: { actors: [actor], messages: [message] } });

      applyPendingMigrations([iconMigration]);

      expect(actor.source.img).to.be(THEMED);
      expect(message.source.img).to.be(THEMED);
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
      storedVersion = iconMigration.version;
      const macro = new FakeDocument({ _id: 'm1', img: LEGACY });
      setGlobals({ documents: { macros: [macro] } });

      await run();

      expect(macro.source.img).to.be(LEGACY);
      expect(updates).to.eql([]);
      expect(notifications).to.eql([]);
    });

    describe('without a migration list', function () {
      const runRegistered = async () => {
        applyPendingMigrations();
        await migrateWorld();
      };

      it('Should run the registered migrations', async function () {
        setGlobals();

        await runRegistered();

        expect(storedVersion).to.be(LATEST_MIGRATION_VERSION);
        expect(notifications.at(-1)).to.eql(['info', 'OQ.Migration.Complete']);
      });

      it('Should warn when the world was migrated by a newer version than the registered migrations', async function () {
        storedVersion = LATEST_MIGRATION_VERSION + 1;
        setGlobals();

        await runRegistered();

        expect(notifications.map(([type]) => type)).to.eql(['warn']);
        expect(storedVersion).to.be(LATEST_MIGRATION_VERSION + 1);
      });
    });

    it('Should warn when the world was migrated by a newer version', async function () {
      storedVersion = iconMigration.version + 1;
      const macro = new FakeDocument({ _id: 'm1', img: LEGACY });
      setGlobals({ documents: { macros: [macro] } });

      await run();

      expect(macro.source.img).to.be(LEGACY);
      expect(updates).to.eql([]);
      expect(notifications).to.eql([['warn', `OQ.Migration.NewerVersion {"version":${storedVersion}}`]]);
      expect(storedVersion).to.be(iconMigration.version + 1);
    });
  });
});
