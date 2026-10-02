import Handlebars from 'handlebars';

// HTML ESLint checks markup but treats template expressions as opaque text.
export default {
  rules: {
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
