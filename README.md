# eslint-plugin-code-conventions

ESLint rules for team naming and structure conventions in React and TypeScript projects: handler
and boolean naming, no generic names, separate `import type` statements, and a clean component file
structure.

For sorting rules (imports, JSX props, interface fields, enum members, ...) see the companion
package `eslint-plugin-sort-by-length`.

- 7 rules, 2 of them with auto-fix
- Works with ESLint 8.57+ (legacy `.eslintrc`) and ESLint 9 (flat config)
- Works with `@typescript-eslint/parser` (TypeScript and TSX)
- No runtime dependencies

## Installation

```bash
npm install --save-dev eslint eslint-plugin-code-conventions
```

## Usage

### Flat config (`eslint.config.js`)

```js
const codeConventions = require('eslint-plugin-code-conventions');

module.exports = [
  codeConventions.configs['flat/recommended'],
  {
    rules: {
      'code-conventions/boolean-prefix': 'warn',
    },
  },
];
```

### Legacy config (`.eslintrc.js`)

```js
module.exports = {
  extends: ['plugin:code-conventions/recommended'],
  rules: {
    'code-conventions/boolean-prefix': 'warn',
  },
};
```

### Configs

| Config | Rules |
|---|---|
| `recommended` / `flat/recommended` | `handler-prefix`, `no-arrow-handler`, `no-inline-type-import` (all `warn`) |
| `all` / `flat/all` | all 7 rules (all `warn`) |

## Rules

| Rule | Fix | What it checks |
|---|---|---|
| [`no-inline-type-import`](#no-inline-type-import) | 🔧 | `import { type X }` must be a separate `import type` |
| [`handler-prefix`](#handler-prefix) | | `handleClick` must be `onClick` |
| [`no-arrow-handler`](#no-arrow-handler) | 🔧 | `const onClick = () => {}` must be `function onClick() {}` |
| [`boolean-prefix`](#boolean-prefix) | | Booleans start with `is`, `has`, `can`, `should`, `will`, `are` |
| [`no-generic-names`](#no-generic-names) | | No `data`, `list`, `items`, `value`, bare `isLoading` from hooks |
| [`no-module-level-in-component`](#no-module-level-in-component) | | No module-level constants and helpers in component files |
| [`use-show-component`](#use-show-component) | | `{cond && <X />}` must be `<Show when={cond}>` |

### no-inline-type-import

`import { a, type B } from 'x'` becomes `import { a } from 'x'` plus `import type { B } from 'x'`.

Run it together with `sort-by-length/imports` (from `eslint-plugin-sort-by-length`): that rule
decides which group the split-off `import type` lands in, so on its own this fixer leaves it glued
to the value import.

```ts
// ❌
import { useState, type FC } from 'react';

// ✅
import { useState } from 'react';
import type { FC } from 'react';
```

### handler-prefix

Reports declarations named `handleX`. Options: `prefix` (default `'on'`) and `banned` (default
`['handle']`).

```ts
// ❌
function handleClick() {}

// ✅
function onClick() {}
```

### no-arrow-handler

Reports `const onX = () => {}` and `const handleX = function () {}`. Arrow functions are fixed to
function declarations unless the variable has a type annotation or the body uses `this`. Option
`pattern` (default `'^(?:on|handle)[A-Z0-9]'`) selects which names count as handlers.

```ts
// ❌
const onClick = () => setOpen(true);

// ✅
function onClick() {
  return setOpen(true);
}
```

### boolean-prefix

Reports variables, parameters and properties that are clearly boolean but lack a prefix. A value
counts as boolean when it has a `boolean` type annotation or when its initializer is `true`/`false`,
a `!` expression, a comparison, `Boolean(x)`, or a logical/conditional expression made only of
those. Constants such as `IS_ENABLED` and names with a leading `_` are accepted.

```ts
// ❌
const visible = true;
const disabled = count === 0;

// ✅
const isVisible = true;
const isDisabled = count === 0;
```

| Option | Default | Meaning |
|---|---|---|
| `prefixes` | `['is', 'has', 'can', 'should', 'will', 'are']` | Accepted prefixes |
| `allow` | `[]` | Regex patterns of names to ignore (for example `['^checked$']`) |

### no-generic-names

Reports `const data = ...` and similar. When destructuring the result of a hook (`useX()`), also
reports bare `data`, `isLoading` and friends, so you alias them: `const { data: userData } = useUser()`.

```ts
// ❌
const data = await getUsers();
const { data, isLoading } = useUser();

// ✅
const users = await getUsers();
const { data: userData, isLoading: isUserLoading } = useUser();
```

| Option | Default | Meaning |
|---|---|---|
| `names` | `data`, `list`, `items`, `value`, `temp`, `isLoading`, `isFetching`, `isError`, `isSuccess` | Banned names |
| `hookPattern` | `'^use[A-Z0-9]'` | Which callees count as hooks |

### no-module-level-in-component

In component files, reports module-level constants and helper functions. PascalCase components
(functions, classes, `memo(...)`, `forwardRef(...)`) and `useX` hooks are allowed.

```tsx
// ❌ UserCard.tsx
const MAX_ITEMS = 10;
function formatName(name: string) {}

export function UserCard() {}

// ✅ UserCard.tsx
import { MAX_ITEMS } from './UserCard.const';
import { formatName } from './UserCard.utils';

export function UserCard() {}
```

| Option | Default | Meaning |
|---|---|---|
| `filePattern` | `'\\.tsx$'` | Files the rule applies to |
| `allow` | `[]` | Regex patterns of names to ignore |

### use-show-component

Reports `{cond && <JSX />}` used as a JSX child. Option `component` (default `'Show'`) changes the
name shown in the message. The rule does not fix, because it cannot add the import for you.

```tsx
// ❌
{isOpen && <Modal />}

// ✅
<Show when={isOpen}>
  <Modal />
</Show>
```

## Rules that overlap with other plugins

These are covered well elsewhere, so the plugin does not duplicate them. Use them next to
`code-conventions`:

| Convention | Use |
|---|---|
| Interface `I`, type `T`, enum `E` prefixes | `@typescript-eslint/naming-convention` |
| No array index as JSX key | `react/no-array-index-key` |
| No component defined inside a component | `react/no-unstable-nested-components` |
| Max file length | `max-lines` |
| Max 2 positional parameters | `max-params` with `[ 'warn', 2 ]` |
| Always `import type` for types | `@typescript-eslint/consistent-type-imports` |

## Development

```bash
npm install
npm test
```

Tests use ESLint's `RuleTester` with `@typescript-eslint/parser` and Node's built-in test runner.

## License

MIT
