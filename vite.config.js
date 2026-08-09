import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { build, defineConfig } from 'vite';
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
const publicDirectory = `${sourceDirectory}/public`;

const entryPoint = path.resolve(sourceDirectory, 'module', `${packageId}.js`);
const foundryUrl = 'http://localhost:32000';
const devPort = 32001;
const hmrPath = '/vite-hmr';
const hmrPrefix = '/@vite/';
const hmrClient = `${hmrPrefix}client`;

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
 * Watch the sources that never enter the module graph, so that `--watch` rebuilds on them: the pack
 * sources, and `src/public` (Vite copies it verbatim on every build, but does not watch it). Files
 * added while `--watch` is running are only picked up when they land directly in a watched
 * directory; deeper additions need a restart.
 */
async function watchExtraSources(ctx) {
  for (const directory of [packsDirectory, publicDirectory]) {
    ctx.addWatchFile(path.resolve(directory));
    (await findFiles(directory)).forEach((file) => ctx.addWatchFile(path.resolve(file)));
  }
}

/**
 * Everything the system needs next to the JavaScript bundle: stylesheet, manifests and compendia.
 * The static files are handled by Vite itself, as `src/public` is the public directory.
 */
function systemFiles() {
  let watching = false;

  return {
    name: 'oq-system-files',
    apply: 'build',
    configResolved(config) {
      watching = Boolean(config.build.watch);
    },
    async buildStart() {
      await Promise.all([buildStyles(this), buildYaml(this)]);
      if (watching) await watchExtraSources(this);
    },
    async writeBundle() {
      await buildPacks();
    },
  };
}

/**
 * Make a development build talk to the dev server below.
 *
 * Foundry loads the system with a plain `<script type="module">`, so nothing injects the HMR client
 * into the page and the entry point has to bring it along. It is appended as a script element rather
 * than imported because Vite aliases `/@vite/client` to its own source before any plugin can mark it
 * external, which would bundle the client into the release-shaped output. A tag also degrades
 * quietly to a 404 when Foundry is opened directly on its own port, without the dev server.
 */
function hmrClientTag() {
  const tag = `document.head.append(Object.assign(document.createElement('script'), { type: 'module', src: '${hmrClient}' }));`;

  return {
    name: 'oq-hmr-client-tag',
    apply: 'build',
    transform(code, id) {
      if (id === entryPoint) return { code: `${tag}\n${code}`, map: null };
    },
  };
}

/**
 * The development server: a proxy in front of Foundry that rebuilds and reloads.
 *
 * The system itself is served by Foundry out of `dist` (linked into its data directory), so the dev
 * server only has to own the HMR endpoints and hand everything else over. Rebuilding is the same
 * `vite build --watch` that produces a release, driven from here so that `npm run dev` stays a
 * single process — there is no second code path that serves the sources.
 */
function devServer() {
  return {
    name: 'oq-dev-server',
    apply: 'serve',
    async configureServer(server) {
      const watcher = await build({ mode: 'development', build: { watch: {} } });

      // `END` fires once the rebuild is fully written, packs and static files included.
      watcher.on('event', (event) => {
        if (event.code === 'END') server.hot.send({ type: 'full-reload' });
      });
      server.httpServer?.once('close', () => watcher.close());
    },
  };
}

export default defineConfig(({ mode }) => ({
  publicDir: publicDirectory,
  plugins: [systemFiles(), mode === 'development' && hmrClientTag(), devServer()],
  server: {
    port: devPort,
    open: '/',
    // Keep the HMR socket off `/`, where it would be indistinguishable from Foundry's own.
    hmr: { path: hmrPath },
    proxy: {
      [`^(?!${hmrPrefix}|${hmrPath})`]: { target: foundryUrl, ws: true, changeOrigin: true },
    },
  },
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
      entry: entryPoint,
      formats: ['es'],
      fileName: () => `module/${packageId}.js`,
    },
    rollupOptions: {
      // Keep any future code-split chunk next to the entry that imports it.
      output: { chunkFileNames: 'module/[name]-[hash].js' },
    },
  },
}));
