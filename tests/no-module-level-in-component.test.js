const rule = require('../src/rules/no-module-level-in-component');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('no-module-level-in-component', rule, {
  valid: [
    { code: 'const Button = () => null;\nexport default Button;', filename: 'Button.tsx' },
    { code: 'const Memo = React.memo(Button);', filename: 'Button.tsx' },
    { code: 'function useThing() {}', filename: 'Button.tsx' },
    { code: 'const useStuff = () => 1;', filename: 'Button.tsx' },
    { code: 'function Button() { return null; }', filename: 'Button.tsx' },
    { code: 'interface P { a: string }', filename: 'Button.tsx' },
    { code: 'const MAX = 1;', filename: 'constants.ts' },
    { code: 'const MAX_SIZE = 1;', filename: 'Button.tsx', options: [{ allow: ['^MAX_'] }] },
    { code: 'const MAX = 1;', filename: 'Button.vue', options: [{ filePattern: '\\.tsx$' }] },
    { code: 'function Button() { const MAX = 1; return null; }', filename: 'Button.tsx' },
  ],
  invalid: [
    {
      code: 'const MAX_SIZE = 10;',
      filename: 'Button.tsx',
      errors: [{ messageId: 'moduleConstant', data: { name: 'MAX_SIZE' } }],
    },
    {
      code: 'export const LIMIT = 5;',
      filename: 'Button.tsx',
      errors: [{ messageId: 'moduleConstant' }],
    },
    {
      code: 'const API = "x";',
      filename: 'Button.tsx',
      errors: [{ messageId: 'moduleConstant' }],
    },
    {
      code: 'function formatName(x) { return x; }',
      filename: 'Button.tsx',
      errors: [{ messageId: 'moduleHelper', data: { name: 'formatName' } }],
    },
    {
      code: 'const getLabel = (x) => x;',
      filename: 'Button.tsx',
      errors: [{ messageId: 'moduleHelper' }],
    },
    {
      code: 'const MAX = 1;',
      filename: 'Button.ts',
      options: [{ filePattern: '\\.ts$' }],
      errors: [{ messageId: 'moduleConstant' }],
    },
  ],
});
