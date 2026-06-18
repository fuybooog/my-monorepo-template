import repoReactConfig from '@repo/eslint-config/react'

export default [
  ...repoReactConfig,
  {
    // 如果有针对 admin-pc 目录的特殊忽略，写在这里
    ignores: ['dist', 'build'],
  },
]
