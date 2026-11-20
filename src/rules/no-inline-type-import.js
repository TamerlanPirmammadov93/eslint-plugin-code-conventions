const { getSourceCode } = require('../lib/getSourceCode');

const TYPE_PREFIX = /^type\s+/;

function isInlineTypeSpecifier(specifier) {
  return specifier.type === 'ImportSpecifier' && specifier.importKind === 'type';
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: "Use a separate 'import type' statement instead of an inline 'type' modifier",
    },
    schema: [],
    messages: {
      inlineType: "Use a separate 'import type' statement instead of an inline 'type' modifier.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);

    function buildValueStatement(node, valueSpecifiers) {
      const defaultSpecifier = valueSpecifiers.find((s) => s.type === 'ImportDefaultSpecifier');
      const namespaceSpecifier = valueSpecifiers.find((s) => s.type === 'ImportNamespaceSpecifier');
      const namedTexts = valueSpecifiers
        .filter((s) => s.type === 'ImportSpecifier')
        .map((s) => sourceCode.getText(s));
      const parts = [];
      if (defaultSpecifier) parts.push(sourceCode.getText(defaultSpecifier));
      if (namespaceSpecifier) parts.push(sourceCode.getText(namespaceSpecifier));
      if (namedTexts.length) parts.push(`{ ${namedTexts.join(', ')} }`);
      return `import ${parts.join(', ')} from ${sourceCode.getText(node.source)};`;
    }

    return {
      ImportDeclaration(node) {
        if (node.importKind === 'type') return;
        const typeSpecifiers = node.specifiers.filter(isInlineTypeSpecifier);
        if (!typeSpecifiers.length) return;
        const hasAttributes = Boolean(node.attributes && node.attributes.length);

        context.report({
          node,
          messageId: 'inlineType',
          fix: hasAttributes
            ? null
            : (fixer) => {
                const typeNames = typeSpecifiers.map((s) =>
                  sourceCode.getText(s).replace(TYPE_PREFIX, ''),
                );
                const typeStatement = `import type { ${typeNames.join(', ')} } from ${sourceCode.getText(node.source)};`;
                const valueSpecifiers = node.specifiers.filter((s) => !isInlineTypeSpecifier(s));
                if (!valueSpecifiers.length) return fixer.replaceText(node, typeStatement);

                const eol = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';
                const valueStatement = buildValueStatement(node, valueSpecifiers);
                return fixer.replaceText(node, `${valueStatement}${eol}${typeStatement}`);
              },
        });
      },
    };
  },
};
