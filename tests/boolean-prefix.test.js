const rule = require('../src/rules/boolean-prefix');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('boolean-prefix', rule, {
  valid: [
    'const isActive = true;',
    'const hasItems = items.length > 0;',
    'interface P { isOpen: boolean; onClose: () => void }',
    'function f(canEdit: boolean) {}',
    "const name = 'x';",
    'const a = b && c;',
    'const IS_ENABLED = true;',
    'const _isHidden = !x;',
    'const areEqual = a === b;',
    'interface P { name: string }',
    { code: 'interface P { checked: boolean }', options: [{ allow: ['^checked$'] }] },
    { code: 'const isOn = true;', options: [{ prefixes: ['is'] }] },
  ],
  invalid: [
    {
      code: 'const active = true;',
      errors: [{ messageId: 'booleanPrefix', data: { name: 'active', prefixes: 'is, has, can, should, will, are' } }],
    },
    { code: 'const done = !x;', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'const matches = a === b;', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'const both = !a && !b;', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'const ok = Boolean(x);', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'interface P { disabled: boolean }', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'interface P { disabled?: boolean | undefined }', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'function f(open: boolean) {}', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'function f(open = false) {}', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'let loaded: boolean;', errors: [{ messageId: 'booleanPrefix' }] },
    { code: 'class A { visible = true }', errors: [{ messageId: 'booleanPrefix' }] },
    {
      code: 'const hasX = true;',
      options: [{ prefixes: ['is'] }],
      errors: [{ messageId: 'booleanPrefix' }],
    },
  ],
});
