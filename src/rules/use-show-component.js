const JSX_TYPES = new Set(['JSXElement', 'JSXFragment']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Use a dedicated conditional component instead of '{cond && <JSX />}'",
    },
    schema: [
      {
        type: 'object',
        properties: { component: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: {
      useShow: "Use <{{component}} when={...}> instead of '{cond && <JSX />}'.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const component = options.component || 'Show';

    return {
      JSXExpressionContainer(node) {
        if (!JSX_TYPES.has(node.parent.type)) return;
        const { expression } = node;
        if (expression.type !== 'LogicalExpression' || expression.operator !== '&&') return;
        if (!JSX_TYPES.has(expression.right.type)) return;
        context.report({ node, messageId: 'useShow', data: { component } });
      },
    };
  },
};
