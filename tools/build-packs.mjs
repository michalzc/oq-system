import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { compilePack } from '@foundryvtt/foundryvtt-cli';

const SRC = 'src';
const PACKS = join(SRC, 'packs');
const BUILD = 'build';
const BUILD_PACKS = join(BUILD, 'packs');

const packs = (await readdir(PACKS, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Drop the entire generated directory so removed packs cannot survive a rebuild.
// Foundry must be stopped before compiling packs.
await rm(BUILD_PACKS, { recursive: true, force: true });

await Promise.all(
  packs.map((pack) => {
    const sourcePack = join(PACKS, pack);
    const destPack = join(BUILD_PACKS, pack);
    console.log(`Compiling ${sourcePack} -> ${destPack}`);
    return compilePack(sourcePack, destPack, { yaml: true, recursive: true, log: true });
  }),
);
