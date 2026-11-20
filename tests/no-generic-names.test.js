const rule = require('../src/rules/no-generic-names');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('no-generic-names', rule, {
  valid: [
    'const { data: userData } = useUser();',
    'const { value } = event.target;',
    'const userList = [];',
    'const { data } = fetchIt();',
    'const { isLoading: isUserLoading, data: userData } = useUser();',
    'const [value, setValue] = useState(0);',
    { code: 'const data = 1;', options: [{ names: ['foo'] }] },
  ],
  invalid: [
    {
      code: 'const data = 1;',
      errors: [{ messageId: 'genericName', data: { name: 'data' } }],
    },
    {
      code: 'const { data } = useUser();',
      errors: [{ messageId: 'genericHookField', data: { name: 'data' } }],
    },
    {
      code: 'const { data = [] } = useUser();',
      errors: [{ messageId: 'genericHookField' }],
    },
    {
      code: 'const { data, isFetching } = await useThing();',
      errors: [{ messageId: 'genericHookField' }, { messageId: 'genericHookField' }],
    },
    {
      code: 'const { isLoading } = api.useQuery();',
      errors: [{ messageId: 'genericHookField' }],
    },
    {
      code: 'const foo = 1;',
      options: [{ names: ['foo'] }],
      errors: [{ messageId: 'genericName' }],
    },
  ],
});
