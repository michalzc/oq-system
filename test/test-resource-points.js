import expect from 'expect.js';
import {
  applyBarInput,
  availableTemporaryPoints,
  convertLegacyHp,
  correctPool,
  grantPool,
  hasPoolList,
  parsePointAmount,
  removePool,
  restorePoints,
  setOrdinaryPoints,
  spendPoints,
} from '../src/module/utils/resource-points.js';

/** A stored v0.8 actor `system` source: HP normal maximum is round((SIZ + CON) / 2) + HP modifier. */
const legacySystem = ({ siz = 10, con = 10, hp = {} } = {}) => ({
  characteristics: { siz: { base: siz, mod: 0 }, con: { base: con, mod: 0 } },
  attributes: { hp: { mod: 0, max: 0, value: 0, ...hp } },
});

/** Converts the HP of a stored `system` source. */
const convert = (system) => convertLegacyHp(system.characteristics, system.attributes.hp, 'Recovered excess');

const recovered = (remaining) => ({ id: 'recoveredExcess', label: 'Recovered excess', remaining });

describe('resource-points.js', function () {
  describe('#convert()', function () {
    it('Should recover HP stored above the normal maximum into one pool', function () {
      expect(convert(legacySystem({ hp: { value: 15 } }))).to.eql({
        value: 10,
        pools: [{ id: 'recoveredExcess', label: 'Recovered excess', remaining: 5 }],
      });
    });

    it('Should treat stored HP fields missing from a legacy source as zero', function () {
      const system = legacySystem();
      system.attributes.hp = {};
      expect(convert(system)).to.eql({ value: 0, pools: [] });
      system.attributes.hp = { value: 12 };
      expect(convert(system)).to.eql({ value: 10, pools: [recovered(2)] });
    });

    it('Should give HP within the normal maximum an empty pool list', function () {
      expect(convert(legacySystem({ hp: { value: 6 } }))).to.eql({ value: 6, pools: [] });
      expect(convert(legacySystem({ hp: { value: 10 } }))).to.eql({ value: 10, pools: [] });
    });

    it('Should recover all stored HP of an actor with a zero normal maximum', function () {
      const system = legacySystem({ hp: { value: 3, mod: -10 } });
      expect(convert(system)).to.eql({ value: 0, pools: [recovered(3)] });
    });

    it('Should floor a negative normal maximum at zero', function () {
      const system = legacySystem({ hp: { value: 3, mod: -14 } });
      expect(convert(system)).to.eql({ value: 0, pools: [recovered(3)] });
    });

    it('Should create no pool for zero stored HP', function () {
      expect(convert(legacySystem({ hp: { value: 0, mod: -14 } }))).to.eql({ value: 0, pools: [] });
    });

    it('Should ignore a stale stored maximum', function () {
      // v0.8 actor: maximum computes 10, stored current 15, stored maximum 0.
      expect(convert(legacySystem({ hp: { value: 15, max: 0 } }))).to.eql({ value: 10, pools: [recovered(5)] });
      expect(convert(legacySystem({ hp: { value: 15, max: 20 } }))).to.eql({
        value: 10,
        pools: [recovered(5)],
      });
    });

    it('Should compute the maximum from characteristic and HP modifiers, negative ones included', function () {
      const system = legacySystem({ siz: 12, con: 9, hp: { value: 12, mod: -2 } });
      system.characteristics.siz.mod = -1;
      system.characteristics.con.mod = 2;
      // round((11 + 11) / 2) - 2 = 9
      expect(convert(system)).to.eql({ value: 9, pools: [recovered(3)] });
    });

    it('Should give the same result with the same pool identity when converting twice', function () {
      const first = convert(legacySystem({ hp: { value: 15 } }));
      const second = convert(legacySystem({ hp: { value: 15 } }));
      expect(second).to.eql(first);
      expect(hasPoolList(first)).to.be(true);
    });
  });

  describe('#hasPoolList()', function () {
    it('Should tell a stored resource with a pool list, even an empty one, from a legacy one', function () {
      expect(hasPoolList({ value: 15, pools: [] })).to.be(true);
      expect(hasPoolList({ value: 15, pools: [{ id: 'p1', label: 'Blessing', remaining: 2 }] })).to.be(true);
      expect(hasPoolList({ value: 15 })).to.be(false);
      expect(hasPoolList(undefined)).to.be(false);
    });
  });

  describe('#availableTemporaryPoints()', function () {
    it('Should sum the remaining amounts of every pool, exhausted ones included', function () {
      const pools = [
        { id: 'a', label: 'A', remaining: 4 },
        { id: 'b', label: 'B', remaining: 0 },
        { id: 'c', label: 'C', remaining: 3 },
      ];
      expect(availableTemporaryPoints(pools)).to.be(7);
    });

    it('Should be zero without pools', function () {
      expect(availableTemporaryPoints([])).to.be(0);
      expect(availableTemporaryPoints(undefined)).to.be(0);
    });
  });

  describe('#parsePointAmount()', function () {
    it('Should read a typed nonnegative whole number', function () {
      expect(parsePointAmount('0')).to.be(0);
      expect(parsePointAmount(' 12 ')).to.be(12);
      expect(parsePointAmount('1000000')).to.be(1000000);
    });

    it('Should reject blank, negative, fractional and other input', function () {
      for (const text of ['', '  ', '-1', '1.5', '1e3', '+3', 'abc', undefined, null]) {
        expect(parsePointAmount(text)).to.be(null);
      }
    });
  });

  describe('pool editing', function () {
    const pool = (id, remaining) => ({ id, label: id.toUpperCase(), remaining });
    // HP 6/10 with A=1, B=2 (the spec's examples).
    const pools = () => [pool('a', 1), pool('b', 2)];

    describe('#grantPool()', function () {
      it('Should append a new pool after every existing pool', function () {
        const granted = grantPool(pools(), { id: 'c', label: 'Vigour from Aldric', amount: 4 });
        expect(granted).to.eql([pool('a', 1), pool('b', 2), { id: 'c', label: 'Vigour from Aldric', remaining: 4 }]);
      });

      it('Should append after exhausted pools too', function () {
        expect(grantPool([pool('a', 0)], { id: 'b', label: 'B', amount: 3 })).to.eql([pool('a', 0), pool('b', 3)]);
      });

      it('Should accept any nonnegative whole amount without an upper cap', function () {
        expect(grantPool([], { id: 'a', label: 'A', amount: 0 })).to.eql([pool('a', 0)]);
        expect(grantPool([], { id: 'a', label: 'A', amount: 250 })).to.eql([pool('a', 250)]);
      });

      it('Should reject negative or fractional amounts', function () {
        for (const amount of [-1, 1.5, NaN, Infinity, '3', null, undefined]) {
          expect(() => grantPool([], { id: 'a', label: 'A', amount })).to.throwError(RangeError);
        }
      });

      it('Should reject an identity already in the list', function () {
        expect(() => grantPool(pools(), { id: 'a', label: 'A', amount: 1 })).to.throwError();
      });

      it('Should not change the given list', function () {
        const original = pools();
        grantPool(original, { id: 'c', label: 'C', amount: 4 });
        expect(original).to.eql(pools());
      });
    });

    describe('#correctPool()', function () {
      it('Should set the remaining amount and keep the pool in its place', function () {
        // Correct A to 3, then grant C=4: order A(3), C(4); total +7.
        const corrected = correctPool([pool('a', 1)], 'a', 3);
        const granted = grantPool(corrected, { id: 'c', label: 'C', amount: 4 });
        expect(granted).to.eql([pool('a', 3), pool('c', 4)]);
        expect(availableTemporaryPoints(granted)).to.be(7);
        expect(correctPool(pools(), 'a', 9)).to.eql([pool('a', 9), pool('b', 2)]);
      });

      it('Should keep a pool corrected to zero listed', function () {
        expect(correctPool(pools(), 'b', 0)).to.eql([pool('a', 1), pool('b', 0)]);
      });

      it('Should reject negative or fractional amounts', function () {
        for (const amount of [-1, 0.5, NaN]) expect(() => correctPool(pools(), 'a', amount)).to.throwError(RangeError);
      });

      it('Should reject an unknown pool', function () {
        expect(() => correctPool(pools(), 'z', 1)).to.throwError();
      });

      it('Should not change the given list', function () {
        const original = pools();
        correctPool(original, 'a', 5);
        expect(original).to.eql(pools());
      });
    });

    describe('#removePool()', function () {
      it('Should drop only the removed pool and its remaining points', function () {
        // HP 6/10, A=4, B=3: remove A leaves B=3.
        expect(removePool([pool('a', 4), pool('b', 3)], 'a')).to.eql([pool('b', 3)]);
        expect(removePool([pool('a', 4), pool('b', 3), pool('c', 1)], 'b')).to.eql([pool('a', 4), pool('c', 1)]);
      });

      it('Should leave the list unchanged when the pool is already gone', function () {
        expect(removePool(pools(), 'z')).to.eql(pools());
      });
    });
  });

  describe('spending and restoring', function () {
    const pool = (id, remaining) => ({ id, label: id.toUpperCase(), remaining });
    const state = (value, max, ...pools) => ({ value, max, pools });

    describe('#spendPoints()', function () {
      it('Should drain the oldest pool completely before the next', function () {
        // HP 6/10, A=4 then B=3; chat damage 5 (ignore armour): HP 6/10, A=0, B=2, 5 absorbed.
        expect(spendPoints(state(6, 10, pool('a', 4), pool('b', 3)), 5)).to.eql({
          state: state(6, 10, pool('a', 0), pool('b', 2)),
          fromPools: 5,
          fromOrdinary: 0,
        });
      });

      it('Should continue into ordinary points once every pool is empty', function () {
        // HP 6/10 + A=4; damage 7: HP 3/10, A=0.
        expect(spendPoints(state(6, 10, pool('a', 4)), 7)).to.eql({
          state: state(3, 10, pool('a', 0)),
          fromPools: 4,
          fromOrdinary: 3,
        });
      });

      it('Should skip exhausted pools and keep them listed', function () {
        const result = spendPoints(state(6, 10, pool('a', 0), pool('b', 2), pool('c', 3)), 4);
        expect(result.state).to.eql(state(6, 10, pool('a', 0), pool('b', 0), pool('c', 1)));
        expect(result.fromPools).to.be(4);
      });

      it('Should floor ordinary points at zero and report only the points actually taken', function () {
        expect(spendPoints(state(3, 10, pool('a', 1)), 10)).to.eql({
          state: state(0, 10, pool('a', 0)),
          fromPools: 1,
          fromOrdinary: 3,
        });
        expect(spendPoints(state(0, 10), 2)).to.eql({ state: state(0, 10), fromPools: 0, fromOrdinary: 0 });
      });

      it('Should take a single point from temporary points first', function () {
        // HP 10/10 + A=2: right-click on the HP label, or normal damage 3 against AP 2.
        expect(spendPoints(state(10, 10, pool('a', 2)), 1).state).to.eql(state(10, 10, pool('a', 1)));
      });

      it('Should spend recovered excess like any pool, and healing should not refill it', function () {
        // Converted HP 10/10 + recovered 5: damage 3, then heal.
        const damaged = spendPoints(state(10, 10, pool('recoveredExcess', 5)), 3).state;
        expect(damaged).to.eql(state(10, 10, pool('recoveredExcess', 2)));
        expect(restorePoints(damaged, 5)).to.eql({ state: damaged, restored: 0 });
      });

      it('Should change nothing for zero', function () {
        const start = state(6, 10, pool('a', 4));
        expect(spendPoints(start, 0)).to.eql({ state: start, fromPools: 0, fromOrdinary: 0 });
      });

      it('Should reject negative or fractional amounts', function () {
        for (const amount of [-1, 1.5, NaN]) expect(() => spendPoints(state(6, 10), amount)).to.throwError(RangeError);
      });

      it('Should not change the given state', function () {
        const start = state(6, 10, pool('a', 4));
        spendPoints(start, 7);
        expect(start).to.eql(state(6, 10, pool('a', 4)));
      });
    });

    describe('#restorePoints()', function () {
      it('Should restore ordinary points only, up to the normal maximum', function () {
        // HP 6/10, A=1, B=2; heal 4: HP 10/10, A=1, B=2.
        expect(restorePoints(state(6, 10, pool('a', 1), pool('b', 2)), 4)).to.eql({
          state: state(10, 10, pool('a', 1), pool('b', 2)),
          restored: 4,
        });
        expect(restorePoints(state(6, 10), 9)).to.eql({ state: state(10, 10), restored: 4 });
      });

      it('Should restore nothing at full ordinary points and leave pools intact', function () {
        expect(restorePoints(state(10, 10, pool('a', 2)), 3)).to.eql({
          state: state(10, 10, pool('a', 2)),
          restored: 0,
        });
      });

      it('Should restore nothing with a zero or negative normal maximum', function () {
        expect(restorePoints(state(0, 0, pool('a', 3)), 2)).to.eql({ state: state(0, 0, pool('a', 3)), restored: 0 });
        expect(restorePoints(state(0, -2), 2)).to.eql({ state: state(0, -2), restored: 0 });
      });

      it('Should reject negative or fractional amounts', function () {
        for (const amount of [-1, 0.5]) expect(() => restorePoints(state(6, 10), amount)).to.throwError(RangeError);
      });
    });

    describe('#setOrdinaryPoints()', function () {
      it('Should set ordinary points clamped to zero and the normal maximum, leaving pools alone', function () {
        const start = state(6, 10, pool('a', 2));
        expect(setOrdinaryPoints(start, 4)).to.eql({ state: state(4, 10, pool('a', 2)) });
        expect(setOrdinaryPoints(start, 15)).to.eql({ state: state(10, 10, pool('a', 2)) });
        expect(setOrdinaryPoints(start, -3)).to.eql({ state: state(0, 10, pool('a', 2)) });
        expect(setOrdinaryPoints(state(0, -2), 5)).to.eql({ state: state(0, -2) });
      });

      it('Should reject a value that is not a whole number', function () {
        for (const value of [NaN, 1.5, Infinity]) {
          expect(() => setOrdinaryPoints(state(6, 10), value)).to.throwError(RangeError);
        }
      });
    });
  });

  describe('#applyBarInput()', function () {
    const pool = (id, remaining) => ({ id, label: id.toUpperCase(), remaining });
    const state = (value, max, ...pools) => ({ value, max, pools });

    it('Should agree with damage, healing and typing for the HUD input sequence', function () {
      // HP 10/10 + A=2; token HUD "-3", then "+5", then "4": 9/10 A=0; 10/10 A=0; 4/10 A=0.
      const minus3 = applyBarInput(state(10, 10, pool('a', 2)), -3, true).state;
      expect(minus3).to.eql(state(9, 10, pool('a', 0)));
      const plus5 = applyBarInput(minus3, 5, true).state;
      expect(plus5).to.eql(state(10, 10, pool('a', 0)));
      expect(applyBarInput(plus5, 4, false).state).to.eql(state(4, 10, pool('a', 0)));
    });

    it('Should clamp an absolute value and leave pools alone', function () {
      expect(applyBarInput(state(6, 10, pool('a', 2)), 15, false).state).to.eql(state(10, 10, pool('a', 2)));
      expect(applyBarInput(state(6, 10, pool('a', 2)), -4, false).state).to.eql(state(0, 10, pool('a', 2)));
    });

    it('Should change nothing for a zero change', function () {
      expect(applyBarInput(state(6, 10, pool('a', 2)), 0, true).state).to.eql(state(6, 10, pool('a', 2)));
    });

    it('Should reject a value that is not a whole number', function () {
      for (const value of [1.5, NaN]) {
        expect(() => applyBarInput(state(6, 10), value, true)).to.throwError(RangeError);
        expect(() => applyBarInput(state(6, 10), value, false)).to.throwError(RangeError);
      }
    });
  });
});
