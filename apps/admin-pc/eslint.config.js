import repoReactConfig from '@repo/eslint-config/react'

export default [
  ...repoReactConfig,
  {
    ignores: ['dist', 'build', '**/test/*', '**/*.test.*'],
  },
  {
    files: [
      '**/utils/tree-fns.ts',
      '**/utils/fns.ts',
      '**/utils/common-render-switch.tsx',
      '**/common/smart-types.ts',
      '**/common/SmartTableSortableWrapper.tsx',
      '**/common/SmartTableRowContext.ts',
      '**/address-select/AddressSelect.tsx',
      '**/remote-select/RemoteSelect.tsx',
      '**/components/ResourceTree.tsx',
      '**/store/store.util.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // 针对这些文件关闭 any 校验
    },
  },
]
