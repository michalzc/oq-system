import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

const SRC = 'src';
const LANG = join(SRC, 'lang');

const toJson = (source) => `${JSON.stringify(yaml.load(source), null, 2)}\n`;
const langYamls = async () => {
  try {
    return (await readdir(LANG)).filter((n) => /\.ya?ml$/.test(n));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
};

export function systemMeta() {
  return {
    name: 'system-meta',
    async buildStart() {
      for (const name of ['system.yaml', 'template.yaml']) this.addWatchFile(resolve(SRC, name));
      this.addWatchFile(resolve(LANG));
      for (const n of await langYamls()) this.addWatchFile(resolve(LANG, n));
      // Public assets are copied by Vite but are not part of the module graph.
      const publicDir = resolve(SRC, 'public');
      this.addWatchFile(publicDir);
      for (const file of await readdir(publicDir, { recursive: true })) {
        this.addWatchFile(join(publicDir, file));
      }
    },
    async generateBundle() {
      for (const name of ['system', 'template']) {
        this.emitFile({
          type: 'asset',
          fileName: `${name}.json`,
          source: toJson(await readFile(join(SRC, `${name}.yaml`), 'utf8')),
        });
      }
      for (const n of await langYamls()) {
        this.emitFile({
          type: 'asset',
          fileName: `lang/${n.replace(/\.ya?ml$/, '.json')}`,
          source: toJson(await readFile(join(LANG, n), 'utf8')),
        });
      }
    },
  };
}
