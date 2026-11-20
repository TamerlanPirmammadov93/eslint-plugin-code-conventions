const DEFAULT_PREFIXES = ['is', 'has', 'can', 'should', 'will', 'are'];
const BOOLEAN_OPERATORS = new Set([
  '==',
  '!=',
  '===',
  '!==',
  '<',
  '>',
  '<=',
  '>=',
  'in',
  'instanceof',
]);
const NULLISH_TYPES = new Set(['TSUndefinedKeyword', 'TSNullKeyword']);

function isBooleanExpression(node) {
  if (!node) return false;
  switch (node.type) {
    case 'Literal':
      return typeof node.value === 'boolean';
    case 'UnaryExpression':
      return node.operator === '!';
    case 'BinaryExpression':
      return BOOLEAN_OPERATORS.has(node.operator);
    case 'LogicalExpression':
      return isBooleanExpression(node.left) && isBooleanExpression(node.right);
    case 'ConditionalExpression':
      return isBooleanExpression(node.consequent) && isBooleanExpression(node.alternate);
    case 'CallExpression':
      return node.callee.type === 'Identifier' && node.callee.name === 'Boolean';
    default:
      return false;
  }
}

function isBooleanTypeNode(node) {
  if (!node) return false;
  if (node.type === 'TSBooleanKeyword') return true;
  if (node.type === 'TSLiteralType') {
    return node.literal.type === 'Literal' && typeof node.literal.value === 'boolean';
  }
  if (node.type === 'TSUnionType') {
    const hasBoolean = node.types.some(isBooleanTypeNode);
    return hasBoolean && node.types.every((t) => isBooleanTypeNode(t) || NULLISH_TYPES.has(t.type));
  }
  return false;
}

function isBooleanAnnotation(typeAnnotation) {
  return Boolean(typeAnnotation) && isBooleanTypeNode(typeAnnotation.typeAnnotation);
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require boolean variables, parameters and properties to start with a boolean prefix',
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefixes: { type: 'array', items: { type: 'string' } },
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      booleanPrefix: "Boolean '{{name}}' must start with one of: {{prefixes}}.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const prefixes = options.prefixes || DEFAULT_PREFIXES;
    const allowRegexes = (options.allow || []).map((pattern) => new RegExp(pattern));
    const camelPattern = new RegExp(`^(?:${prefixes.join('|')})[A-Z0-9]`);
    const upperPattern = new RegExp(`^(?:${prefixes.join('|').toUpperCase()})_`);

    function isNameValid(rawName) {
      const name = rawName.replace(/^[_$]+/, '');
      if (!name) return true;
      if (allowRegexes.some((regex) => regex.test(rawName))) return true;
      return camelPattern.test(name) || upperPattern.test(name);
    }

    function check(nameNode) {
      if (!nameNode || nameNode.type !== 'Identifier') return;
      if (isNameValid(nameNode.name)) return;
      context.report({
        node: nameNode,
        messageId: 'booleanPrefix',
        data: { name: nameNode.name, prefixes: prefixes.join(', ') },
      });
    }

    return {
      Identifier(node) {
        if (isBooleanAnnotation(node.typeAnnotation)) check(node);
      },
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || node.id.typeAnnotation) return;
        if (isBooleanExpression(node.init)) check(node.id);
      },
      AssignmentPattern(node) {
        if (node.left.type !== 'Identifier' || node.left.typeAnnotation) return;
        if (isBooleanExpression(node.right)) check(node.left);
      },
      TSPropertySignature(node) {
        if (node.computed || node.key.type !== 'Identifier') return;
        if (isBooleanAnnotation(node.typeAnnotation)) check(node.key);
      },
      PropertyDefinition(node) {
        if (node.computed || node.key.type !== 'Identifier') return;
        if (isBooleanAnnotation(node.typeAnnotation) || isBooleanExpression(node.value)) {
          check(node.key);
        }
      },
    };
  },
};
