/**
 * 全局提示文案集中管理
 *
 * 约定：
 * - 不含变量的固定文案，定义为常量对象（如 SUCCESS_MESSAGE.CREATE）
 * - 含变量的文案，定义为函数（如 formatDeleteCount(n)），返回拼接后的字符串
 * - 业务中统一通过 getMessage().<level>(MESSAGE_XXX) 调用，禁止散落硬编码字符串
 */

/** 成功类提示 */
export const SUCCESS_MESSAGE = {
  /** 通用操作成功 */
  OPERATION: '操作成功',
  /** 删除成功 */
  DELETE: '删除成功',
  /** 新增值集成功 */
  VALUE_SET_CREATE: '创建值集成功',
  /** 更新值集成功 */
  VALUE_SET_UPDATE: '更新值集成功',
  /** 创建资源成功 */
  RESOURCE_CREATE: '创建资源成功',
  /** 更新资源成功 */
  RESOURCE_UPDATE: '更新资源成功',
  /** 创建用户成功 */
  USER_CREATE: '创建用户成功',
  /** 更新用户成功 */
  USER_UPDATE: '更新用户成功',
  /** 创建角色成功 */
  ROLE_CREATE: '创建角色成功',
  /** 更新角色成功 */
  ROLE_UPDATE: '更新角色成功',
  /** 角色分配成功 */
  ROLE_ASSIGN: '角色分配成功！',
  /** 密码重置成功 */
  PASSWORD_RESET: '密码重置成功！',
  /** 排序完成 */
  SORT_DONE: '排序完成',
  /** 状态更新成功 */
  STATUS_UPDATE: '状态更新成功',
  /** 个人资料保存成功 */
  PROFILE_SAVED: '保存成功！昵称在重新登录后生效！',
  /** 验证码发送成功 */
  FORGOT_CODE_SENT: '验证码已发送，请查收邮箱（10 分钟内有效）',
  /** 密码重置成功，请重新登录 */
  FORGOT_RESET_DONE: '密码重置成功，请使用新密码登录',
  /** 操作日志清理成功 */
  OPERATION_LOG_CLEAN: '日志清理完成',
}

/** 失败 / 错误类提示 */
export const ERROR_MESSAGE = {
  /** 部分删除失败 */
  DELETE: '部分删除失败',
  /** 角色分配失败 */
  ROLE_ASSIGN: '角色分配失败，请重试',
  /** 密码重置失败 */
  PASSWORD_RESET: '密码重置失败，请重试',
  /** 排序失败 */
  SORT_FAILED: '排序失败',
  /** 获取加密密钥失败（刷新） */
  FETCH_ENCRYPT_KEY_REFRESH: '获取加密密钥失败，请刷新重试',
  /** 获取加密密钥失败（网络） */
  FETCH_ENCRYPT_KEY_NETWORK: '获取加密密钥失败，请检查网络',
  /** 系统级错误 */
  SYSTEM: '【系统错误】',
}

/** 警告类提示 */
export const WARNING_MESSAGE = {}

/** 信息类提示 */
export const INFO_MESSAGE = {}

/** 二次确认弹窗通用文案 */
export const CONFIRM_MESSAGE = {
  /** 单行删除确认描述 */
  DELETE_SINGLE: '确定要删除该条数据吗？此操作不可撤销。',
  /** 删除标题 */
  DELETE_TITLE: '确认删除',
  /** 删除确认（通用） */
  DELETE: '确定要删除吗？',
  /** 重置顺序确认 */
  RESET_SORT: '确定要重置顺序吗？',
  /** 日志清理二次确认 */
  OPERATION_LOG_CLEAN:
    '清理前会将命中日志归档为 JSONL 文件，随后物理删除；删除后不可恢复，确认继续吗？',
  /** 日志清理弹窗标题 */
  OPERATION_LOG_CLEAN_TITLE: '清理操作日志',
  /** 日志清理预览提示 */
  OPERATION_LOG_CLEAN_PREVIEW_HINT: '请先点击「预览清理」查看命中数量，确认无误后再执行清理。',
}

/** Excel 导入导出相关文案 */
export const EXCEL_MESSAGE = {
  /** 导入弹窗默认标题 */
  IMPORT_TITLE: '导入数据',
  /** 导入弹窗说明 */
  IMPORT_HINT: '请先下载模板，按模板格式填写后，再上传 .xlsx 文件导入。',
  /** 下载模板按钮 */
  TEMPLATE_DOWNLOAD: '下载导入模板',
  /** 导入按钮 */
  IMPORT_BUTTON: '导入',
  /** 导出按钮 */
  EXPORT_BUTTON: '导出',
  /** 选择文件按钮 */
  FILE_SELECT: '选择文件',
  /** 取消按钮 */
  CANCEL: '取消',
  /** 完成按钮 */
  DONE: '完成',
  /** 文件类型校验失败 */
  FILE_TYPE_INVALID: '仅支持 .xlsx 格式文件',
  /** 文件大小校验失败 */
  FILE_SIZE_INVALID: (maxSizeMB: number) => `文件大小不能超过 ${maxSizeMB}MB`,
  /** 部分数据导入成功 */
  RESULT_PARTIAL: '部分数据导入成功',
  /** 全部导入失败 */
  RESULT_ALL_FAILED: '全部导入失败',
  /** 失败明细标题 */
  FAILED_DETAIL_TITLE: '失败明细',
  /** 失败行号列表头 */
  FAILED_ROW_NO: '行号',
  /** 失败原因列表头 */
  FAILED_REASON: '错误原因',
  /** 下载失败明细按钮 */
  DOWNLOAD_FAILED_FILE: '下载失败明细',
  /** 下载失败明细文件名 */
  FAILED_FILE_NAME: '导入失败明细.csv',
  /** 重新选择按钮 */
  REUPLOAD: '重新选择',
  /** 模板下载失败时兜底文件名 */
  TEMPLATE_FILE_DEFAULT: '导入模板.xlsx',
  /** 导出失败时兜底文件名 */
  EXPORT_FILE_DEFAULT: 'export.xlsx',
  /** 用户导入弹窗标题 */
  USER_IMPORT_TITLE: '导入用户',
  /** 用户模板兜底文件名 */
  USER_TEMPLATE_FILE_NAME: '用户导入模板.xlsx',
  /** 用户导出兜底文件名 */
  USER_EXPORT_FILE_NAME: '用户列表.xlsx',
  /** 角色导入弹窗标题 */
  ROLE_IMPORT_TITLE: '导入角色',
  /** 角色模板兜底文件名 */
  ROLE_TEMPLATE_FILE_NAME: '角色导入模板.xlsx',
  /** 角色导出兜底文件名 */
  ROLE_EXPORT_FILE_NAME: '角色列表.xlsx',
  /** 资源导入弹窗标题 */
  RESOURCE_IMPORT_TITLE: '导入资源',
  /** 资源模板兜底文件名 */
  RESOURCE_TEMPLATE_FILE_NAME: '资源导入模板.xlsx',
  /** 资源导出兜底文件名 */
  RESOURCE_EXPORT_FILE_NAME: '资源列表.xlsx',
  /** 值集导入弹窗标题 */
  VALUE_SET_IMPORT_TITLE: '导入字典值',
  /** 值集模板兜底文件名 */
  VALUE_SET_TEMPLATE_FILE_NAME: '字典值导入模板.xlsx',
  /** 值集导出兜底文件名 */
  VALUE_SET_EXPORT_FILE_NAME: '字典值列表.xlsx',
  /** 操作日志导出兜底文件名 */
  OPERATION_LOG_EXPORT_FILE_NAME: '操作日志.xlsx',
}

/** 含变量的文案：定义为函数返回字符串 */
export const formatMessage = {
  /** 批量删除确认：传入条数 */
  confirmDeleteCount: (count: number) => `确认删除选中的 ${count} 条数据吗？`,
  /** 删除失败（附带原因） */
  deleteFailedWithReason: (reason: string) => `删除失败：${reason}`,
  /** 分页总数：传入条数 */
  totalCount: (totalCount: number) => `共 ${totalCount} 条数据`,
  /** 导入全部成功 */
  excelImportSuccess: (count: number) => `成功导入 ${count} 条数据`,
  /** 导入结果概览(部分成功/失败) */
  excelImportSummary: (successCount: number, failCount: number) =>
    `成功 ${successCount} 条，失败 ${failCount} 条`,
  /** 日志清理预览结果 */
  operationLogCleanPreview: (count: number) => `按当前条件将清理 ${count} 条日志`,
  /** 日志清理执行结果 */
  operationLogCleanDone: (count: number) => `已清理 ${count} 条日志（清理前已自动归档）`,
}
