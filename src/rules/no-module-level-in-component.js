const { getFilename } = require('../lib/getSourceCode');

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const HOOK_NAME = /^use[A-Z0-9]/;
const COMPONENT_INIT_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'ClassExpression',
  'CallExpression',
]);
const FUNCTION_INIT_TYPES = new Set(['ArrowFunctionExpression', 'FunctionExpression']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow module-level constants and helper functions in component files, move them to dedicated files',
    },
    schema: [
      {
        type: 'object',
        properties: {
          filePattern: { type: 'string' },
          allow: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      moduleConstant:
        "Move module-level constant '{{name}}' out of the component file (for example to a .const file).",
      moduleHelper:
        "Move module-level helper '{{name}}' out of the component file (for example to a .utils file).",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const fileRegex = new RegExp(options.filePattern || '\\.tsx$');
    const allowRegexes = (options.allow || []).map((pattern) => new RegExp(pattern));

    if (!fileRegex.test(getFilename(context))) return {};

    function isAllowed(name) {
      return allowRegexes.some((regex) => regex.test(name));
    }

    function checkVariable(declaration) {
      declaration.declarations.forEach((declarator) => {
        if (declarator.id.type !== 'Identifier' || !declarator.init) return;
        const { name } = declarator.id;
        if (isAllowed(name)) return;
        const isFunction = FUNCTION_INIT_TYPES.has(declarator.init.type);
        if (HOOK_NAME.test(name) && isFunction) return;
        if (PASCAL_CASE.test(name) && COMPONENT_INIT_TYPES.has(declarator.init.type)) return;
        context.report({
          node: declarator.id,
          messageId: isFunction ? 'moduleHelper' : 'moduleConstant',
          data: { name },
        });
      });
    }

    function checkFunction(declaration) {
      if (!declaration.id) return;
      const { name } = declaration.id;
      if (isAllowed(name) || HOOK_NAME.test(name) || PASCAL_CASE.test(name)) return;
      context.report({ node: declaration.id, messageId: 'moduleHelper', data: { name } });
    }

    return {
      Program(program) {
        program.body.forEach((statement) => {
          const declaration =
            statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
          if (!declaration) return;
          if (declaration.type === 'VariableDeclaration') checkVariable(declaration);
          if (declaration.type === 'FunctionDeclaration') checkFunction(declaration);
        });
      },
    };
  },
};
