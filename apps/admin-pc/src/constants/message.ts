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
}

/** 含变量的文案：定义为函数返回字符串 */
export const formatMessage = {
  /** 批量删除确认：传入条数 */
  confirmDeleteCount: (count: number) => `确认删除选中的 ${count} 条数据吗？`,
  /** 删除失败（附带原因） */
  deleteFailedWithReason: (reason: string) => `删除失败：${reason}`,
  /** 分页总数：传入条数 */
  totalCount: (totalCount: number) => `共 ${totalCount} 条数据`,
}
