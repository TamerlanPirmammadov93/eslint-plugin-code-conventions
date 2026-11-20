const rule = require('../src/rules/handler-prefix');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('handler-prefix', rule, {
  valid: [
    'function onClick() {}',
    'const onSelect = () => {};',
    'const handler = 1;',
    'const handle = 1;',
    'const handled = true;',
    { code: 'function handleClick() {}', options: [{ banned: ['process'] }] },
  ],
  invalid: [
    {
      code: 'function handleClick() {}',
      errors: [
        { messageId: 'handlerPrefix', data: { name: 'handleClick', prefix: 'on', rest: 'Click' } },
      ],
    },
    {
      code: 'const handleSelect = () => {};',
      errors: [{ messageId: 'handlerPrefix' }],
    },
    {
      code: 'const processSave = () => {};',
      options: [{ banned: ['process'], prefix: 'on' }],
      errors: [
        { messageId: 'handlerPrefix', data: { name: 'processSave', prefix: 'on', rest: 'Save' } },
      ],
    },
  ],
});
