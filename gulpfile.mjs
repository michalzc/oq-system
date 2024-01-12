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

import rollupStream from '@rollup/stream';

import rollupConfig from './rollup.config.mjs';

/********************/
/*  CONFIGURATION   */
/********************/

const packageId = 'oq';
const sourceDirectory = './src';
const distDirectory = './dist';
const stylesDirectory = `${sourceDirectory}/styles`;
const stylesExtension = 'less';
const sourceFileExtension = 'js';
const staticFiles = ['assets', 'fonts', 'packs', 'templates'];
const yamlExtension = 'yaml';

/********************/
/*      BUILD       */
/********************/

let cache;

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
    .pipe(gulp.dest(`${distDirectory}/module`));
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${stylesDirectory}/${packageId}.${stylesExtension}`)
    .pipe(less())
    .pipe(gulp.dest(`${distDirectory}/styles`));
}

/**
 * Build YAML files
 *
 */
async function buildYaml() {
  return gulp
    .src([`${sourceDirectory}/**/*.${yamlExtension}`, `!${sourceDirectory}/packs/**/*.${yamlExtension}`])
    .pipe(yaml({ space: 2, safe: true }))
    .pipe(gulp.dest(`${distDirectory}`));
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
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

export const build = gulp.series(clean, gulp.parallel(buildCode, buildStyles, buildYaml, copyFiles));

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
export async function clean() {
  const files = [...staticFiles, 'module', 'lang', 'system.json', 'template.json'];

  if (fs.existsSync(`${stylesDirectory}/${packageId}.${stylesExtension}`)) {
    files.push('styles');
  }

  console.log(' ', 'Files to clean:');
  console.log('   ', files.join('\n    '));

  for (const filePath of files) {
    await fs.remove(`${distDirectory}/${filePath}`);
  }
}
