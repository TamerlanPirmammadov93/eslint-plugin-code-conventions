const rule = require('../src/rules/use-show-component');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('use-show-component', rule, {
  valid: [
    'const a = <div>{ok ? <b /> : null}</div>;',
    "const a = <div attr={ok && 'x'} />;",
    'const b = ok && <i />;',
    "const a = <div>{ok && 'text'}</div>;",
    'const a = <div>{ok || <i />}</div>;',
    'const a = <Show when={ok}><i /></Show>;',
  ],
  invalid: [
    {
      code: 'const a = <div>{ok && <span />}</div>;',
      errors: [{ messageId: 'useShow', data: { component: 'Show' } }],
    },
    {
      code: 'const a = <>{ok && <span />}</>;',
      errors: [{ messageId: 'useShow' }],
    },
    {
      code: 'const a = <div>{ok && <>text</>}</div>;',
      errors: [{ messageId: 'useShow' }],
    },
    {
      code: 'const a = <div>{ok && <span />}</div>;',
      options: [{ component: 'When' }],
      errors: [{ messageId: 'useShow', data: { component: 'When' } }],
    },
  ],
});
