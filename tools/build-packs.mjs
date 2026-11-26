import { mkdtemp, readdir, readlink, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { compilePack } from '@foundryvtt/foundryvtt-cli';

// Compiles src/packs/ YAML into LevelDB packs under build/packs/.
// With --check, compiles into a temporary directory and removes it, leaving build/ alone: safe while a world runs.
const SRC = 'src';
const PACKS = join(SRC, 'packs');
const BUILD_PACKS = join('build', 'packs');
const check = process.argv.includes('--check');

const subdirs = async (path) =>
  (await readdir(path, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

/**
 * Names of the packs under `dir` whose LevelDB LOCK file a process (a running Foundry) holds open. Reads /proc only:
 * opening a locked database would rotate its LOG file even though the open fails. Without /proc (not Linux) it finds
 * nothing.
 */
async function packsInUse(dir) {
  const lockPaths = await Promise.all(
    (await subdirs(dir)).map((pack) => realpath(join(dir, pack, 'LOCK')).catch(() => null)),
  );
  const lockFiles = new Set(lockPaths.filter(Boolean));
  if (!lockFiles.size) return [];
  const inUse = new Set();
  for (const pid of await readdir('/proc').catch(() => [])) {
    if (!/^\d+$/.test(pid)) continue;
    for (const fd of await readdir(`/proc/${pid}/fd`).catch(() => [])) {
      const target = await readlink(`/proc/${pid}/fd/${fd}`).catch(() => null);
      if (lockFiles.has(target)) inUse.add(basename(dirname(target)));
    }
  }
  return [...inUse].sort();
}

const packs = await subdirs(PACKS);
const outDir = check ? await mkdtemp(join(tmpdir(), 'oq-packs-')) : BUILD_PACKS;

if (!check) {
  const inUse = await packsInUse(BUILD_PACKS);
  if (inUse.length) {
    console.error(
      `Foundry has ${inUse.join(', ')} open in ${BUILD_PACKS}. Leave the world for Setup before building packs, ` +
        'or run `yarn check:packs` to only check that they compile.',
    );
    process.exit(1);
  }
  // Drop the entire generated directory so removed packs cannot survive a rebuild.
  await rm(BUILD_PACKS, { recursive: true, force: true });
}

try {
  await Promise.all(
    packs.map((pack) => {
      const sourcePack = join(PACKS, pack);
      const destPack = join(outDir, pack);
      console.log(`Compiling ${sourcePack} -> ${destPack}`);
      return compilePack(sourcePack, destPack, { yaml: true, recursive: true, log: !check });
    }),
  );
} finally {
  if (check) await rm(outDir, { recursive: true, force: true });
}
if (check) console.log(`All ${packs.length} packs compile.`);
