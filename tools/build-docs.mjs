import { randomInt } from 'node:crypto';
import { readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';

// Generates journal pack sources from HTML documentation. Run manually and commit the output:
// docs/packs/<pack>/<journal>/journal.yml + *.html -> src/packs/<pack>/<Name>_<id>.yml
const DOCS_PACKS = join('docs', 'packs');
const SRC_PACKS = join('src', 'packs');
const JOURNAL_META = 'journal.yml';

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_PATTERN = /^[a-zA-Z0-9]{16}$/;
const PAGE_SORT_STEP = 100000;

const randomId = () => Array.from({ length: 16 }, () => ID_CHARS[randomInt(ID_CHARS.length)]).join('');
// Same rule the Foundry CLI uses for extracted file names.
const safeFilename = (name) => name.replace(/[^a-zA-Z0-9А-я]/g, '_');
const subdirs = async (path) =>
  (await readdir(path, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);

const errors = [];

function checkId(entry, label, metaPath, seenIds) {
  if (entry._id === undefined) {
    errors.push(`${metaPath}: ${label} has no _id, e.g. _id: ${randomId()}`);
  } else if (!ID_PATTERN.test(entry._id)) {
    errors.push(`${metaPath}: ${label} has invalid _id "${entry._id}", e.g. _id: ${randomId()}`);
  } else if (seenIds.has(entry._id)) {
    errors.push(`${metaPath}: ${label} reuses _id ${entry._id}`);
  } else {
    seenIds.add(entry._id);
  }
}

async function loadPage(page, index, journalDir, metaPath, seenIds) {
  const label = `page ${page.name ? `"${page.name}"` : `#${index + 1}`}`;
  checkId(page, label, metaPath, seenIds);
  if (!page.name) errors.push(`${metaPath}: ${label} has no name`);
  if (!page.file) errors.push(`${metaPath}: ${label} has no file`);
  const level = page.level ?? 1;
  if (![1, 2, 3].includes(level)) errors.push(`${metaPath}: ${label} has invalid level ${level}, expected 1-3`);

  let content = '';
  if (page.file) {
    try {
      content = (await readFile(join(journalDir, page.file), 'utf8')).trim();
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      errors.push(`${metaPath}: ${label} file ${page.file} does not exist`);
    }
  }

  return {
    _id: page._id,
    name: page.name,
    type: 'text',
    sort: (index + 1) * PAGE_SORT_STEP,
    title: { show: page.showTitle ?? true, level },
    text: { content, format: 1 },
  };
}

async function loadJournal(journalDir, seenIds) {
  const metaPath = join(journalDir, JOURNAL_META);
  const meta = yaml.load(await readFile(metaPath, 'utf8'));
  checkId(meta, 'journal', metaPath, seenIds);
  if (!meta.name) errors.push(`${metaPath}: journal has no name`);
  if (!Array.isArray(meta.pages) || meta.pages.length === 0) errors.push(`${metaPath}: journal has no pages`);

  const pages = await Promise.all(
    (meta.pages ?? []).map((page, index) => loadPage(page, index, journalDir, metaPath, seenIds)),
  );

  return {
    _id: meta._id,
    name: meta.name,
    folder: null,
    sort: meta.sort ?? 0,
    flags: {},
    ownership: { default: 0 },
    pages: pages.map((page) => ({ ...page, _key: `!journal.pages!${meta._id}.${page._id}` })),
    _key: `!journal!${meta._id}`,
  };
}

async function loadPack(pack) {
  const packDir = join(DOCS_PACKS, pack);
  const seenIds = new Set();
  const journals = [];
  for (const journal of await subdirs(packDir)) {
    const journalDir = join(packDir, journal);
    if (!(await readdir(journalDir)).includes(JOURNAL_META)) continue;
    journals.push(await loadJournal(journalDir, seenIds));
  }
  return { pack, journals };
}

const packs = await Promise.all((await subdirs(DOCS_PACKS)).map(loadPack));

// Validate everything before touching the generated sources.
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

for (const { pack, journals } of packs) {
  const destPack = join(SRC_PACKS, pack);
  await rm(destPack, { recursive: true, force: true });
  await mkdir(destPack, { recursive: true });
  for (const journal of journals) {
    const dest = join(destPack, `${safeFilename(journal.name)}_${journal._id}.yml`);
    console.log(`Writing ${dest}`);
    await writeFile(dest, yaml.dump(journal, { lineWidth: -1 }));
  }
}
