/**
 * Excel 导入字段的公共校验器。
 *
 * 用法：在模块的 ImportFieldSpec.validate 里组合使用，例如
 *   { key: 'mobile', header: '手机号', validate: validators.mobile('手机号') }
 *
 * 说明：必填 / 下拉枚举 / 最大长度这三类通用规则由 excel.service 依据
 * ImportFieldSpec（required/options/maxLength）统一执行，无需在这里重复声明；
 * 这里只收口"格式类"的公共规则，避免各模块各写一份正则。
 */

export type CellValidator = (text: string, rowNo: number) => string | null

function pattern(label: string, regex: RegExp, message?: string): CellValidator {
  return (text) => {
    if (!text) return null
    return regex.test(text) ? null : (message ?? `${label}格式不正确`)
  }
}

export const validators = {
  /** 中国大陆手机号 */
  mobile: (label = '手机号'): CellValidator => pattern(label, /^1[3-9]\d{9}$/),
  /** 常用邮箱 */
  email: (label = '邮箱'): CellValidator =>
    pattern(label, /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/, `${label}格式不正确`),
  /** 自定义正则 */
  pattern,
}
