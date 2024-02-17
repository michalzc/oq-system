// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

import fs from 'fs-extra';
import gulp from 'gulp';
import less from 'gulp-less';
import sourcemaps from 'gulp-sourcemaps';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import yaml from 'gulp-yaml';
import zip from 'gulp-zip';
import jsonModify from 'gulp-json-modify';
import rename from 'gulp-rename';
import version from './version.mjs';
import { ClassicLevel } from 'classic-level';
import through2 from 'through2';
import path from 'path';

import rollupStream from '@rollup/stream';

import rollupConfig from './rollup.config.mjs';

/********************/
/*  CONFIGURATION   */
/********************/

const packageId = 'oq';
const sourceDirectory = './src';
const buildDirectory = './build';
const distDirectory = './dist';
const stylesDirectory = `${sourceDirectory}/styles`;
const packsDirectory = `${sourceDirectory}/packs`;
const stylesExtension = 'less';
const sourceFileExtension = 'js';
const staticFiles = ['assets', 'fonts', 'templates'];
const yamlExtension = 'yaml';

/********************/
/*      BUILD       */
/********************/

let cache;

const downloadPath = 'https://bitbucket.org/parmezan/oq-system/downloads';

/**
 * Build the distributable JavaScript code
 */
function buildCode() {
  return rollupStream({ ...rollupConfig(), cache })
    .on('bundle', (bundle) => {
      cache = bundle;
    })
    .pipe(source(`${packageId}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${buildDirectory}/module`));
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${stylesDirectory}/${packageId}.${stylesExtension}`)
    .pipe(less())
    .pipe(gulp.dest(`${buildDirectory}/styles`));
}

/**
 * Build YAML files
 *
 */
async function buildYaml() {
  return gulp
    .src([`${sourceDirectory}/**/*.${yamlExtension}`, `!${sourceDirectory}/packs/**/*.${yamlExtension}`])
    .pipe(yaml({ space: 2, safe: true }))
    .pipe(gulp.dest(`${buildDirectory}`));
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${buildDirectory}/${file}`);
    }
  }
}

/**
 * Watch for changes for each build step
 */
export function watch() {
  gulp.watch(`${sourceDirectory}/**/*.${sourceFileExtension}`, { ignoreInitial: false }, buildCode);
  gulp.watch(`${stylesDirectory}/**/*.${stylesExtension}`, { ignoreInitial: false }, buildStyles);
  gulp.watch(`${sourceDirectory}/**/*.${yamlExtension}`, { ignoreInitial: false }, buildYaml);
  gulp.watch(
    staticFiles.map((file) => `${sourceDirectory}/${file}`),
    { ignoreInitial: false },
    copyFiles,
  );
}

async function zipFiles() {
  return gulp
    .src(`${buildDirectory}/**`)
    .pipe(zip(`${packageId}-${version}.zip`))
    .pipe(gulp.dest(`${distDirectory}`));
}

async function updateJson() {
  return gulp
    .src(`${buildDirectory}/system.json`)
    .pipe(
      jsonModify({
        key: 'manifest',
        value: `${downloadPath}/${packageId}.json`,
      }),
    )
    .pipe(
      jsonModify({
        key: 'download',
        value: `${downloadPath}/${packageId}-${version}.zip`,
      }),
    )
    .pipe(gulp.dest(buildDirectory))
    .pipe(rename(`${packageId}.json`))
    .pipe(gulp.dest(`${distDirectory}`))
    .pipe(rename(`${packageId}-${version}.json`))
    .pipe(gulp.dest(`${distDirectory}`));
}

export async function buildPacks() {
  console.log(ClassicLevel);
  return gulp
    .src(`${packsDirectory}/*/**.yaml`)
    .pipe(yaml())
    .pipe(
      through2.obj(function (file, enc, cb) {
        const { fileType, parentId, ...content } = JSON.parse(file.contents.toString());
        const { _id } = content;
        const key = parentId ? `!${fileType}!${parentId}.${_id}` : `!${fileType}!${_id}`;
        const dbName = path.relative(packsDirectory, file.dirname);
        const dbPath = `${buildDirectory}/packs/${dbName}`;
        const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
        db.put(key, content, { sync: true });
        db.close((error) => cb(error, file));
      }),
    )
    .pipe(gulp.dest(`temp/packs-json`));
}

export const build = gulp.series(clean, gulp.parallel(buildCode, buildStyles, buildYaml, copyFiles, buildPacks));
export const dist = gulp.series(build, updateJson, zipFiles);

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
export async function clean() {
  const files = [...staticFiles, 'packs', 'module', 'lang', 'system.json', 'template.json'];

  if (fs.existsSync(`${stylesDirectory}/${packageId}.${stylesExtension}`)) {
    files.push('styles');
  }

  console.log(' ', 'Files to clean:');
  console.log('   ', files.join('\n    '));

  for (const filePath of files) {
    await fs.remove(`${buildDirectory}/${filePath}`);
  }

  await fs.remove(distDirectory);
}
