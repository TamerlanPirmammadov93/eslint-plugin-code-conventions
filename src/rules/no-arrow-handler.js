const { getSourceCode } = require('../lib/getSourceCode');

const DEFAULT_PATTERN = '^(?:on|handle)[A-Z0-9]';
const FIXABLE_PARENT_TYPES = new Set([
  'Program',
  'BlockStatement',
  'StaticBlock',
  'TSModuleBlock',
  'ExportNamedDeclaration',
]);

function containsThis(node, visitorKeys) {
  function visit(current) {
    if (!current || typeof current.type !== 'string') return false;
    if (current.type === 'ThisExpression') return true;
    if (current.type === 'FunctionExpression' || current.type === 'FunctionDeclaration') {
      return false;
    }
    const keys = visitorKeys[current.type] || [];
    return keys.some((key) => {
      const child = current[key];
      return Array.isArray(child) ? child.some(visit) : visit(child);
    });
  }
  return visit(node);
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Declare event handlers as named function declarations, not arrow functions',
    },
    schema: [
      {
        type: 'object',
        properties: { pattern: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: {
      arrowHandler: "Declare '{{name}}' as a function declaration: 'function {{name}}() {}'.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const options = context.options[0] || {};
    const namePattern = new RegExp(options.pattern || DEFAULT_PATTERN);

    function buildFunctionText({ name, arrow }) {
      const arrowToken = sourceCode.getTokenBefore(arrow.body, {
        filter: (token) => token.value === '=>',
      });
      let header = sourceCode.text.slice(arrow.range[0], arrowToken.range[0]).trim();
      if (arrow.async) header = header.replace(/^async\s*/, '');
      if (!header.startsWith('(') && !header.startsWith('<')) header = `(${header})`;
      const bodyText =
        arrow.body.type === 'BlockStatement'
          ? sourceCode.getText(arrow.body)
          : `{ return ${sourceCode.getText(arrow.body)}; }`;
      return `${arrow.async ? 'async ' : ''}function ${name}${header} ${bodyText}`;
    }

    function canFix({ declaration, declarator }) {
      const init = declarator.init;
      if (declarator.id.typeAnnotation) return false;
      if (init.type !== 'ArrowFunctionExpression') return false;
      if (declaration.declarations.length !== 1 || declaration.kind !== 'const') return false;
      if (!FIXABLE_PARENT_TYPES.has(declaration.parent.type)) return false;
      return !containsThis(init.body, sourceCode.visitorKeys);
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || !node.init) return;
        if (!namePattern.test(node.id.name)) return;
        const isFunction =
          node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression';
        if (!isFunction) return;

        const declaration = node.parent;
        const isFixable = canFix({ declaration, declarator: node });

        context.report({
          node: node.id,
          messageId: 'arrowHandler',
          data: { name: node.id.name },
          fix: isFixable
            ? (fixer) =>
                fixer.replaceText(
                  declaration,
                  buildFunctionText({ name: node.id.name, arrow: node.init }),
                )
            : null,
        });
      },
    };
  },
};
