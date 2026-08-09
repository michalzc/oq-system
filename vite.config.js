import { cp, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import less from 'less';
import yaml from 'js-yaml';
import { compilePack } from '@foundryvtt/foundryvtt-cli';

/********************/
/*  CONFIGURATION   */
/********************/

const packageId = 'oq';
const sourceDirectory = 'src';
const outputDirectory = 'dist';
const stylesDirectory = `${sourceDirectory}/styles`;
const packsDirectory = `${sourceDirectory}/packs`;
const staticDirectories = ['assets', 'fonts', 'templates'];

/**
 * Recursively collect the files under a directory, optionally filtered by extension.
 */
async function findFiles(directory, extension = '') {
  const entries = await readdir(directory, { recursive: true });
  return entries.filter((entry) => entry.endsWith(extension)).map((entry) => path.join(directory, entry));
}

/**
 * Compile `src/styles/oq.less` into `styles/oq.css`.
 *
 * The stylesheet is compiled outside of Vite's asset pipeline on purpose: its `url()`s are either
 * absolute Foundry paths (`/systems/oq/…`) or relative to the emitted CSS, and both must survive
 * verbatim rather than being resolved and hashed.
 */
async function buildStyles(ctx) {
  const entry = path.resolve(stylesDirectory, `${packageId}.less`);
  const { css, imports } = await less.render(await readFile(entry, 'utf8'), {
    filename: entry,
    paths: [path.dirname(entry)],
  });

  [entry, ...imports].forEach((file) => ctx.addWatchFile(file));
  ctx.emitFile({ type: 'asset', fileName: `styles/${packageId}.css`, source: css });
}

/**
 * Convert every YAML source outside of the packs into JSON, keeping the directory layout
 * (`src/system.yaml` → `system.json`, `src/lang/en.yaml` → `lang/en.json`, …).
 */
async function buildYaml(ctx) {
  const files = (await findFiles(sourceDirectory, '.yaml')).filter((file) => !file.startsWith(packsDirectory));

  await Promise.all(
    files.map(async (file) => {
      ctx.addWatchFile(path.resolve(file));
      const contents = yaml.load(await readFile(file, 'utf8'));
      ctx.emitFile({
        type: 'asset',
        fileName: path.relative(sourceDirectory, file).replace(/\.yaml$/, '.json'),
        source: `${JSON.stringify(contents, null, 2)}\n`,
      });
    }),
  );
}

/**
 * Compile the YAML pack sources into LevelDB compendia. The target is dropped first so that entries
 * deleted from the sources cannot survive in an incremental (`--watch`) rebuild.
 */
async function buildPacks() {
  const packs = await readdir(packsDirectory, { withFileTypes: true });
  await rm(path.join(outputDirectory, 'packs'), { recursive: true, force: true });
  await Promise.all(
    packs
      .filter((pack) => pack.isDirectory())
      .map((pack) =>
        compilePack(path.join(packsDirectory, pack.name), path.join(outputDirectory, 'packs', pack.name), {
          yaml: true,
        }),
      ),
  );
}

/**
 * Copy the directories that ship as-is.
 */
async function copyStaticFiles() {
  await Promise.all(
    staticDirectories.map((directory) =>
      cp(path.join(sourceDirectory, directory), path.join(outputDirectory, directory), { recursive: true }),
    ),
  );
}

/**
 * Watch the sources that are copied or compiled outside of the module graph. Files added while
 * `--watch` is running are only picked up when they land directly in a watched directory; deeper
 * additions need a restart.
 */
async function watchStaticSources(ctx) {
  const directories = [packsDirectory, ...staticDirectories.map((name) => path.join(sourceDirectory, name))];

  for (const directory of directories) {
    ctx.addWatchFile(path.resolve(directory));
    (await findFiles(directory)).forEach((file) => ctx.addWatchFile(path.resolve(file)));
  }
}

/**
 * Everything the system needs next to the JavaScript bundle: stylesheet, manifests, compendia and
 * static files.
 */
function systemFiles() {
  let watching = false;

  return {
    name: 'oq-system-files',
    configResolved(config) {
      watching = Boolean(config.build.watch);
    },
    async buildStart() {
      await Promise.all([buildStyles(this), buildYaml(this)]);
      if (watching) await watchStaticSources(this);
    },
    async writeBundle() {
      await Promise.all([buildPacks(), copyStaticFiles()]);
    },
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [systemFiles()],
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    sourcemap: true,
    // Ship readable code, as the rollup build did: Foundry resolves class names at runtime (sheet
    // registration, data models), so enabling minification also means setting
    // `rollupOptions.output.keepNames`.
    minify: false,
    target: 'esnext',
    lib: {
      entry: path.resolve(sourceDirectory, 'module', `${packageId}.js`),
      formats: ['es'],
      fileName: () => `module/${packageId}.js`,
    },
    rollupOptions: {
      // Keep any future code-split chunk next to the entry that imports it.
      output: { chunkFileNames: 'module/[name]-[hash].js' },
    },
  },
});
