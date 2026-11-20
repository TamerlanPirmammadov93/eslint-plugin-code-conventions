const rule = require('../src/rules/no-inline-type-import');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('no-inline-type-import', rule, {
  valid: [
    "import type { A } from 'x';",
    "import { a } from 'x';",
    "import D, { a } from 'x';",
    "import * as ns from 'x';",
  ],
  invalid: [
    {
      code: "import { type A } from 'x';",
      output: "import type { A } from 'x';",
      errors: [{ messageId: 'inlineType' }],
    },
    {
      code: "import { a, type B } from 'x';",
      output: "import { a } from 'x';\nimport type { B } from 'x';",
      errors: [{ messageId: 'inlineType' }],
    },
    {
      code: "import D, { type B, c } from 'x';",
      output: "import D, { c } from 'x';\nimport type { B } from 'x';",
      errors: [{ messageId: 'inlineType' }],
    },
    {
      code: "import { type A as B, type C } from 'x';",
      output: "import type { A as B, C } from 'x';",
      errors: [{ messageId: 'inlineType' }],
    },
  ],
});
