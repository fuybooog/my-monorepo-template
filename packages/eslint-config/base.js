import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'pnpm-lock.yaml',
      '**/types/**',
      '**/scripts/**',
    ],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: [
      '**/*.test.[jt]s?(x)',
      '**/*.spec.[jt]s?(x)',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
    ],
    rules: {
      // 通过将所有生效规则重置为 off 禁用校验
      ...Object.keys({
        ...js.configs.recommended.rules,
        ...tseslint.configs.recommended.reduce((acc, config) => ({ ...acc, ...config.rules }), {}),
        'no-console': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      }).reduce((acc, key) => ({ ...acc, [key]: 'off' }), {}),
    },
  },
]
