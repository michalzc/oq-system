import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import less from 'less';

export function systemStyles() {
  return {
    name: 'system-styles',
    async buildStart() {
      const entry = resolve('src/styles/oq.less');
      // Keep Foundry URLs and paths relative to the emitted CSS verbatim.
      const { css, imports } = await less.render(await readFile(entry, 'utf8'), {
        filename: entry,
        paths: [dirname(entry)],
      });
      for (const file of [entry, ...imports]) this.addWatchFile(file);
      this.emitFile({ type: 'asset', fileName: 'styles/oq.css', source: css });
    },
  };
}
