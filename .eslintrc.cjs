// SPDX-FileCopyrightText: 2022 Johannes Loher
// SPDX-FileCopyrightText: 2022 David Archibald
//
// SPDX-License-Identifier: MIT

module.exports = {
  parserOptions: {
    ecmaVersion: 2024,
    extraFileExtensions: ['.cjs', '.mjs'],
    sourceType: 'module',
  },

  env: {
    browser: true,
    es6: true,
    jquery: true,
    mocha: true,
  },

  extends: ['eslint:recommended', '@typhonjs-fvtt/eslint-config-foundry.js/0.8.0', 'plugin:prettier/recommended'],

  plugins: [],

  rules: {
    // Specify any specific ESLint rules.
    // quotes: ["error", "double"], //for future
  },

  overrides: [
    {
      files: ['./*.js', './*.cjs', './*.mjs'],
      env: {
        node: true,
      },
    },
  ],

  globals: {
    globalThis: false, // means it is not writeable
  },
};
