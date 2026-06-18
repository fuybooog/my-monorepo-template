import baseConfig from './packages/eslint-config/base.js'

export default [
  ...baseConfig,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', 'pnpm-lock.yaml', '**/types/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
    },
  },

  {
    files: ['apps/backend-api/**/*.ts'],
    rules: {
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
]
