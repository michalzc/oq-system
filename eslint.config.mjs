import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import handlebars from './tools/eslint-handlebars.mjs';

const jsFiles = ['**/*.{js,cjs,mjs}'];
const templateFiles = ['src/public/**/*.{hbs,handlebars,html}'];

// Foundry VTT v14 globals the system uses. Everything else is reached through the `foundry` namespace.
const foundryGlobals = Object.fromEntries(
  [
    'Actor',
    'CONFIG',
    'CONST',
    'ChatMessage',
    'Combat',
    'Handlebars',
    'Hooks',
    'Item',
    'Macro',
    'Roll',
    'canvas',
    'foundry',
    'fromUuid',
    'game',
    'ui',
  ].map((name) => [name, 'readonly']),
);

export default [
  // `**/.*` keeps ESLint 8's default of skipping dotfiles and dot-directories (local `.dev/`, `.direnv/`, ...).
  { ignores: ['dist/', 'build/', 'foundryvtt-data/', 'foundryvtt-api/', '**/.*'] },

  {
    files: jsFiles,
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.jquery, ...foundryGlobals },
    },
  },
  {
    files: ['*.{js,cjs,mjs}', 'tools/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.mocha } },
  },
  { files: jsFiles, ...prettierRecommended },

  // HTML ESLint checks the markup; the handlebars plugin parses the template expressions it treats as opaque text.
  {
    files: templateFiles,
    plugins: { '@html-eslint': html, handlebars },
    languageOptions: {
      parser: htmlParser,
      parserOptions: { templateEngineSyntax: htmlParser.TEMPLATE_ENGINE_SYNTAX.HANDLEBAR_EXTENDED },
    },
    rules: {
      'handlebars/valid-syntax': 'error',
      '@html-eslint/no-duplicate-attrs': 'error',
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/require-closing-tags': 'error',
      '@html-eslint/require-img-alt': 'error',
      '@html-eslint/no-obsolete-tags': 'error',
      '@html-eslint/quotes': ['error', 'double'],
    },
  },
];
