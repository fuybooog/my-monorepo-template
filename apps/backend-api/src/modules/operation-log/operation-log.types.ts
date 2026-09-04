/**
 * 操作日志公共类型与常量。
 *
 * 设计说明：
 * - module 记录业务模块编码（user/role/resource/value-set），
 *   moduleText 冗余中文名，避免依赖字典表导致历史日志文案漂移；
 * - 一条日志 = 谁(operator) + 何时(createdAt) + 对哪个对象(business) +
 *   做了什么(operationType) + 改了哪些字段(detailJson)。
 */

/** 日志级别：1-INFO / 2-WARN / 3-ERROR（同时决定清理保留时长） */
export enum OperationLogLevel {
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export const OPERATION_LOG_LEVEL_TEXT: Record<number, string> = {
  [OperationLogLevel.INFO]: '信息',
  [OperationLogLevel.WARN]: '警告',
  [OperationLogLevel.ERROR]: '错误',
}

/** 操作类型（存字符串编码，便于直接检索） */
export enum OperationLogAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
  ASSIGN = 'ASSIGN',
  RESET_PWD = 'RESET_PWD',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  OTHER = 'OTHER',
}

export const OPERATION_LOG_ACTION_TEXT: Record<string, string> = {
  [OperationLogAction.LOGIN]: '登录',
  [OperationLogAction.LOGOUT]: '退出登录',
  [OperationLogAction.CREATE]: '新增',
  [OperationLogAction.UPDATE]: '修改',
  [OperationLogAction.DELETE]: '删除',
  [OperationLogAction.ENABLE]: '启用',
  [OperationLogAction.DISABLE]: '禁用',
  [OperationLogAction.ASSIGN]: '分配',
  [OperationLogAction.RESET_PWD]: '重置密码',
  [OperationLogAction.IMPORT]: '导入',
  [OperationLogAction.EXPORT]: '导出',
  [OperationLogAction.OTHER]: '操作',
}

/** 业务模块注册表：编码 -> 中文名（moduleText 取值来源，新增业务模块需在此登记） */
export const OPERATION_LOG_MODULES: Record<string, string> = {
  auth: '认证管理',
  user: '用户管理',
  role: '角色管理',
  resource: '资源管理',
  'value-set': '值集管理',
  'operation-log': '日志管理',
}

/**
 * 字段级变更明细（detail_json 中每一项）。
 * oldText/newText 为格式化后的展示值；oldValue/newValue 保留原始值。
 */
export interface LogFieldChange {
  /** 字段名，如 nickName */
  field: string
  /** 字段中文名，如 昵称 */
  fieldText: string
  oldValue: unknown | null
  newValue: unknown | null
  oldText: string
  newText: string
}

/**
 * 字段元数据：声明哪些字段参与 diff、中文名与展示格式化。
 * 各业务模块在自己的埋点处维护（如 USER_FIELD_META），与权限码一样集中登记。
 */
export interface FieldMeta<T = Record<string, unknown>> {
  field: keyof T & string
  /** 字段中文名（用于 summary 与详情表格） */
  label: string
  /** 把存储值格式化为展示文本，如 status: 0 -> 禁用、1 -> 启用 */
  format?: (value: unknown) => string | null
}

/** 埋点入口入参 */
export interface RecordOperationLogInput {
  /** 业务模块编码，见 OPERATION_LOG_MODULES */
  module: string
  /** 业务对象id（无对象场景如系统任务可省略） */
  businessId?: number | null
  /** 业务对象描述，如：用户 #5 王五 */
  businessText: string
  /** 操作类型 */
  operationType: OperationLogAction | string
  /** 日志级别，默认 INFO */
  level?: OperationLogLevel
  /** 字段级变更明细（UPDATE 场景建议由 buildFieldChanges 生成） */
  changes?: LogFieldChange[]
  /** 自定义摘要（默认按 操作人+动作+对象+变更 自动拼装） */
  summary?: string
  /** 显式指定操作人（覆盖请求上下文；定时任务/登录等无登录态场景使用） */
  actor?: {
    userId?: number
    userName?: string
    operatorIp?: string | null
  }
}
