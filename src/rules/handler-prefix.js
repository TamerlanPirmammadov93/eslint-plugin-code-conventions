module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Name event handlers with the 'on' prefix instead of 'handle'",
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefix: { type: 'string' },
          banned: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      handlerPrefix: "Use the '{{prefix}}' prefix for handlers: rename '{{name}}' to '{{prefix}}{{rest}}'.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const prefix = options.prefix || 'on';
    const banned = options.banned || ['handle'];
    const pattern = new RegExp(`^(?:${banned.join('|')})([A-Z0-9].*)$`);

    function check(identifier) {
      if (!identifier || identifier.type !== 'Identifier') return;
      const match = pattern.exec(identifier.name);
      if (!match) return;
      context.report({
        node: identifier,
        messageId: 'handlerPrefix',
        data: { name: identifier.name, prefix, rest: match[1] },
      });
    }

    return {
      FunctionDeclaration(node) {
        check(node.id);
      },
      VariableDeclarator(node) {
        check(node.id);
      },
    };
  },
};
