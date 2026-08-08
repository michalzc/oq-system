import { cp, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
 * Recursively collect files matching an extension (all of them when omitted), skipping the given
 * directories.
 */
async function findFiles(directory, extension = '', skip = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return skip.includes(entryPath) ? [] : findFiles(entryPath, extension, skip);
      }
      return entry.name.endsWith(extension) ? [entryPath] : [];
    }),
  );
  return files.flat();
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
  const files = await findFiles(sourceDirectory, '.yaml', [packsDirectory]);

  for (const file of files) {
    ctx.addWatchFile(path.resolve(file));
    ctx.emitFile({
      type: 'asset',
      fileName: path.relative(sourceDirectory, file).replace(/\.yaml$/, '.json'),
      source: `${JSON.stringify(yaml.load(await readFile(file, 'utf8')), null, 2)}\n`,
    });
  }
}

/**
 * Compile the YAML pack sources into LevelDB compendia.
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
  for (const directory of staticDirectories) {
    if (existsSync(`${sourceDirectory}/${directory}`)) {
      await cp(`${sourceDirectory}/${directory}`, `${outputDirectory}/${directory}`, { recursive: true });
    }
  }
}

/**
 * Watch the sources that are copied or compiled outside of the module graph. Files added while
 * `--watch` is running are only picked up when they land directly in a watched directory; deeper
 * additions need a restart.
 */
async function watchStaticSources(ctx) {
  const directories = [packsDirectory, ...staticDirectories.map((directory) => `${sourceDirectory}/${directory}`)];
  for (const directory of directories.filter((directory) => existsSync(directory))) {
    ctx.addWatchFile(path.resolve(directory));
    (await findFiles(directory)).forEach((file) => ctx.addWatchFile(path.resolve(file)));
  }
}

/**
 * Everything the system needs next to the JavaScript bundle: stylesheet, manifests, compendia and
 * static files.
 */
function systemFiles() {
  return {
    name: 'oq-system-files',
    async buildStart() {
      await Promise.all([buildStyles(this), buildYaml(this), watchStaticSources(this)]);
    },
    async writeBundle() {
      await Promise.all([buildPacks(), copyStaticFiles()]);
    },
  };
}

export default defineConfig({
  publicDir: false,
  esbuild: { keepNames: true },
  plugins: [systemFiles()],
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    target: 'esnext',
    lib: {
      name: packageId,
      entry: path.resolve(sourceDirectory, 'module', `${packageId}.js`),
      formats: ['es'],
      fileName: () => `module/${packageId}.js`,
    },
  },
});
