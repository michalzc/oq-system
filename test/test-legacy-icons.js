import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The icons moved to `themed/` in 0.8. Copies with a black background stay at the old paths, so references the
// migrations can't reach show an odd icon instead of a broken one.
const ICONS = new URL('../src/public/assets/icons/', import.meta.url);
const THEMED = new URL('themed/', ICONS);
const NOT_MOVED = ['cultist.svg'];

const svgs = (directory) =>
  readdirSync(directory)
    .filter((name) => name.endsWith('.svg'))
    .sort();

describe('Legacy icons', function () {
  it('Should keep a copy of every themed icon, and nothing else, at the old location', function () {
    const legacy = svgs(ICONS).filter((name) => !NOT_MOVED.includes(name));
    assert.deepEqual(legacy, svgs(THEMED));
  });

  it('Should only change the background of the copies to black', function () {
    for (const name of svgs(THEMED)) {
      const themed = readFileSync(new URL(name, THEMED), 'utf8');
      assert.equal(themed.match(/#600000/g)?.length, 1, `${name} should have a single background color`);
      assert.equal(readFileSync(new URL(name, ICONS), 'utf8'), themed.replace('#600000', '#000000'), name);
    }
  });
});
