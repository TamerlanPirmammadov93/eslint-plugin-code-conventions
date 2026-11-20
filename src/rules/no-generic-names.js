const DEFAULT_NAMES = [
  'data',
  'list',
  'items',
  'value',
  'temp',
  'isLoading',
  'isFetching',
  'isError',
  'isSuccess',
];
const DEFAULT_HOOK_PATTERN = '^use[A-Z0-9]';

function unwrapAwait(node) {
  return node && node.type === 'AwaitExpression' ? node.argument : node;
}

function getCalleeName(callee) {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
    return callee.property.name;
  }
  return null;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow generic variable names and bare hook result fields such as data or isLoading',
    },
    schema: [
      {
        type: 'object',
        properties: {
          names: { type: 'array', items: { type: 'string' } },
          hookPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      genericName: "'{{name}}' is too generic: use a name that says what it holds.",
      genericHookField:
        "Alias '{{name}}' to an entity-specific name when destructuring a hook result: '{{name}}: yourName'.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const names = new Set(options.names || DEFAULT_NAMES);
    const hookRegex = new RegExp(options.hookPattern || DEFAULT_HOOK_PATTERN);

    function isHookCall(init) {
      const call = unwrapAwait(init);
      if (!call || call.type !== 'CallExpression') return false;
      const calleeName = getCalleeName(call.callee);
      return Boolean(calleeName) && hookRegex.test(calleeName);
    }

    function getShorthandName(property) {
      if (property.type !== 'Property' || !property.shorthand) return null;
      const value = property.value;
      if (value.type === 'Identifier') return value;
      if (value.type === 'AssignmentPattern' && value.left.type === 'Identifier') return value.left;
      return null;
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && names.has(node.id.name)) {
          context.report({ node: node.id, messageId: 'genericName', data: { name: node.id.name } });
          return;
        }
        if (node.id.type !== 'ObjectPattern' || !isHookCall(node.init)) return;
        node.id.properties.forEach((property) => {
          const shorthandName = getShorthandName(property);
          if (!shorthandName || !names.has(shorthandName.name)) return;
          context.report({
            node: property,
            messageId: 'genericHookField',
            data: { name: shorthandName.name },
          });
        });
      },
    };
  },
};
