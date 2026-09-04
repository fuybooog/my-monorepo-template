/**
 * 操作日志业务常量：模块/级别/操作类型的筛选选项与文案映射。
 * 与后端 modules/operation-log/operation-log.types.ts 保持一致，
 * 新增业务模块埋点时请同步登记。
 */

/** 业务模块编码 -> 中文名 */
export const LOG_MODULES: Record<string, string> = {
  auth: '认证管理',
  user: '用户管理',
  role: '角色管理',
  resource: '资源管理',
  'value-set': '值集管理',
  'operation-log': '日志管理',
}

/** 日志级别 -> 中文名 */
export const LOG_LEVEL_TEXT: Record<number, string> = {
  1: '信息',
  2: '警告',
  3: '错误',
}

/** 操作类型 -> 中文名 */
export const LOG_ACTION_TEXT: Record<string, string> = {
  LOGIN: '登录',
  LOGOUT: '退出登录',
  CREATE: '新增',
  UPDATE: '修改',
  DELETE: '删除',
  ENABLE: '启用',
  DISABLE: '禁用',
  ASSIGN: '分配',
  RESET_PWD: '重置密码',
  IMPORT: '导入',
  EXPORT: '导出',
  OTHER: '操作',
}

/** 级别下拉选项 */
export const LOG_LEVEL_OPTIONS = Object.entries(LOG_LEVEL_TEXT).map(([value, label]) => ({
  value: Number(value),
  label,
}))

/** 业务模块下拉选项 */
export const LOG_MODULE_OPTIONS = Object.entries(LOG_MODULES).map(([value, label]) => ({
  value,
  label,
}))

/** 操作类型下拉选项 */
export const LOG_ACTION_OPTIONS = Object.entries(LOG_ACTION_TEXT).map(([value, label]) => ({
  value,
  label,
}))
