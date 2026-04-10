import jsxA11y from 'prefer-code-style/eslint/jsx-a11y'
import next from 'prefer-code-style/eslint/next'
import normal from 'prefer-code-style/eslint/preset/normal'
import typescriptStrict from 'prefer-code-style/eslint/typescript-strict'

export default [
  ...normal,
  ...typescriptStrict,
  ...next,
  ...jsxA11y,
  {
    ignores: ['src/lib/api/generated'],
  },
]
