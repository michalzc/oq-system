import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import handlebars from './eslint-handlebars.mjs';

export default [
  {
    files: ['src/public/**/*.{hbs,handlebars,html}'],
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
