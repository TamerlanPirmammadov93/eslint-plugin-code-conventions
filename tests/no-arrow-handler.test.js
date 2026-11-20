const rule = require('../src/rules/no-arrow-handler');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('no-arrow-handler', rule, {
  valid: [
    'function onClick() {}',
    'const value = () => 1;',
    'const onCount = 5;',
    'const online = () => {};',
    { code: 'const onClick = () => {};', options: [{ pattern: '^submit' }] },
  ],
  invalid: [
    {
      code: 'const onClick = () => { go(); };',
      output: 'function onClick() { go(); }',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onChange = async (e) => { await x(e); };',
      output: 'async function onChange(e) { await x(e); }',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onSelect = (id: string): void => doIt(id);',
      output: 'function onSelect(id: string): void { return doIt(id); }',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onX = e => e;',
      output: 'function onX(e) { return e; }',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onX = () => ({ a: 1 });',
      output: 'function onX() { return { a: 1 }; }',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'export const onGo = () => {};',
      output: 'export function onGo() {}',
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onClick: Handler = () => {};',
      output: null,
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onClick = function () {};',
      output: null,
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const onA = () => { this.x(); };',
      output: null,
      errors: [{ messageId: 'arrowHandler' }],
    },
    {
      code: 'const handleSave = () => {};',
      output: 'function handleSave() {}',
      errors: [{ messageId: 'arrowHandler' }],
    },
  ],
});
