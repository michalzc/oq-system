import expect from 'expect.js';
import { availableTemporaryPoints, convertLegacyHp } from '../src/module/utils/resource-points.js';

/** A stored v0.8 actor `system` source: HP normal maximum is round((SIZ + CON) / 2) + HP modifier. */
const legacySystem = ({ siz = 10, con = 10, hp = {} } = {}) => ({
  characteristics: { siz: { base: siz, mod: 0 }, con: { base: con, mod: 0 } },
  attributes: { hp: { mod: 0, max: 0, value: 0, ...hp } },
});

const recovered = (remaining) => ({ id: 'recoveredExcess', label: 'OQ.Resources.RecoveredExcess', remaining });

describe('resource-points.js', function () {
  describe('#convertLegacyHp()', function () {
    it('Should recover HP stored above the normal maximum into one pool', function () {
      expect(convertLegacyHp(legacySystem({ hp: { value: 15 } }))).to.eql({
        value: 10,
        pools: [{ id: 'recoveredExcess', label: 'OQ.Resources.RecoveredExcess', remaining: 5 }],
      });
    });

    it('Should never reinterpret a source that already has a pool list, even an empty one', function () {
      expect(convertLegacyHp(legacySystem({ hp: { value: 15, pools: [] } }))).to.be(undefined);
      const pools = [{ id: 'p1', label: 'Blessing', remaining: 2 }];
      expect(convertLegacyHp(legacySystem({ hp: { value: 15, pools } }))).to.be(undefined);
    });

    it('Should treat stored HP fields missing from a legacy source as zero', function () {
      const system = legacySystem();
      system.attributes.hp = {};
      expect(convertLegacyHp(system)).to.eql({ value: 0, pools: [] });
      system.attributes.hp = { value: 12 };
      expect(convertLegacyHp(system)).to.eql({ value: 10, pools: [recovered(2)] });
    });

    it('Should give HP within the normal maximum an empty pool list', function () {
      expect(convertLegacyHp(legacySystem({ hp: { value: 6 } }))).to.eql({ value: 6, pools: [] });
      expect(convertLegacyHp(legacySystem({ hp: { value: 10 } }))).to.eql({ value: 10, pools: [] });
    });

    it('Should recover all stored HP of an actor with a zero normal maximum', function () {
      const system = legacySystem({ hp: { value: 3, mod: -10 } });
      expect(convertLegacyHp(system)).to.eql({ value: 0, pools: [recovered(3)] });
    });

    it('Should floor a negative normal maximum at zero', function () {
      const system = legacySystem({ hp: { value: 3, mod: -14 } });
      expect(convertLegacyHp(system)).to.eql({ value: 0, pools: [recovered(3)] });
    });

    it('Should create no pool for zero stored HP', function () {
      expect(convertLegacyHp(legacySystem({ hp: { value: 0, mod: -14 } }))).to.eql({ value: 0, pools: [] });
    });

    it('Should ignore a stale stored maximum', function () {
      // v0.8 actor: maximum computes 10, stored current 15, stored maximum 0.
      expect(convertLegacyHp(legacySystem({ hp: { value: 15, max: 0 } }))).to.eql({ value: 10, pools: [recovered(5)] });
      expect(convertLegacyHp(legacySystem({ hp: { value: 15, max: 20 } }))).to.eql({
        value: 10,
        pools: [recovered(5)],
      });
    });

    it('Should compute the maximum from characteristic and HP modifiers, negative ones included', function () {
      const system = legacySystem({ siz: 12, con: 9, hp: { value: 12, mod: -2 } });
      system.characteristics.siz.mod = -1;
      system.characteristics.con.mod = 2;
      // round((11 + 11) / 2) - 2 = 9
      expect(convertLegacyHp(system)).to.eql({ value: 9, pools: [recovered(3)] });
    });

    it('Should give the same result with the same pool identity when converting twice', function () {
      const first = convertLegacyHp(legacySystem({ hp: { value: 15 } }));
      const second = convertLegacyHp(legacySystem({ hp: { value: 15 } }));
      expect(second).to.eql(first);
      const converted = legacySystem({ hp: first });
      expect(convertLegacyHp(converted)).to.be(undefined);
      expect(converted.attributes.hp).to.eql({ mod: 0, max: 0, value: 10, pools: [recovered(5)] });
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
});
