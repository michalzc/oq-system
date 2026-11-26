import Handlebars from 'handlebars';

const INPUT_TAG = /<input\b[^>]*>/g;
const NAME_ATTRIBUTE = /\bname="([^"]*)"/;
const SINGLE_EXPRESSION_VALUE = /\bvalue="\{\{\s*([\w.@]+)\s*\}\}"/;

const lastSegment = (path) => path.split('.').at(-1);

// HTML ESLint checks markup but treats template expressions as opaque text.
export default {
  rules: {
    // An input saves to the field its name gives, so it must show that field: showing a prepared value (`char.value`)
    // in an input named `….base` writes effects and native modifiers into the stored base on the next save.
    'input-shows-named-field': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          mismatch:
            'Input "{{name}}" shows "{{value}}": show the field it saves ("…{{field}}"), or the save writes the shown value into it.',
        },
      },
      create(context) {
        return {
          Program() {
            const { text } = context.sourceCode;
            for (const tag of text.matchAll(INPUT_TAG)) {
              const name = tag[0].match(NAME_ATTRIBUTE)?.[1];
              const value = tag[0].match(SINGLE_EXPRESSION_VALUE)?.[1];
              // Document fields only (dialog inputs are not saved to a document), and only a fixed field name.
              if (!name?.startsWith('system.') || name.endsWith('}}') || !value) continue;
              if (lastSegment(name) === lastSegment(value)) continue;
              context.report({
                loc: context.sourceCode.getLocFromIndex(tag.index),
                messageId: 'mismatch',
                data: { name, value, field: lastSegment(name) },
              });
            }
          },
        };
      },
    },
    'valid-syntax': {
      meta: {
        type: 'problem',
        schema: [],
        messages: { invalid: '{{message}}' },
      },
      create(context) {
        return {
          Program(node) {
            try {
              Handlebars.parse(context.sourceCode.text);
            } catch (error) {
              context.report({
                node,
                messageId: 'invalid',
                data: { message: error.message },
              });
            }
          },
        };
      },
    },
  },
};
