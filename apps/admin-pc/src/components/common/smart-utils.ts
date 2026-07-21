/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export const getColumnKey = (col: ColumnsType<any>[number]): string | undefined => {
  const rawKey = (col as any).dataIndex ?? col.key
  if (!rawKey) return undefined
  return Array.isArray(rawKey) ? rawKey.join('.') : String(rawKey)
}

/**
 * 【数据清洗工具】根据 Schema 配置动态序列化表单/表格的日期时间字段。
 *
 * ### 核心职责
 * 1. **格式对齐**：将 Antd 日期组件产生的 `Dayjs` 响应式对象，根据 `schema` 配置精准转化为后端需要的 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss` 字符串。
 * 2. **数据无伤**：函数内部采用浅拷贝机制，属于纯函数（Pure Function），**绝对不会**污染或篡改页面上表单组件正在引用的原始状态。
 * 3. **智能识别**：自动通过正则表达式及特征属性锁定日期类组件，对于普通输入框、下拉框或分页参数（`page`, `pageSize`）等非日期字段，采取零开销直接放行。
 *
 * ### ⚠️ 破坏性及回显避坑指南（重要）
 * - **单向传递**：经此函数清洗后的返回值已发生**形态破坏**（Dayjs 对象 $\rightarrow$ 纯文本字符串）。
 * - **禁止回显**：清洗后的结果**只能用于发送网络请求**，绝对不能重新喂回给表单（如 `form.setFieldsValue`），否则会导致 Antd DatePicker 组件解析非对象类型而引发运行时崩溃。
 *
 * @param {Record<string, any>} fieldsValue - 从表单（如 `form.getFieldsValue()`）或搜索栏中获取的原始键值对数据。
 * @param {Record<string, any>} schema - 当前表单或表格的元数据配置项对象（包含 `widget`, `props` 等）。
 * @returns {Record<string, any>} 清洗且重组后的新参数对象，可直接序列化并交付给 API 请求层。
 *
 * @example
 * // 1. 定义 Schema 与原始表单数据
 * const userSchema = {
 *   birthStart: { title: '生日', props: { showTime: false } },
 *   userName: { title: '用户名' }
 * };
 * const rawValues = { birthStart: dayjs('2026-07-08'), userName: 'fuyongbo' };
 *
 * // 2. 执行清洗
 * const apiParams = serializeFormValues(rawValues, userSchema);
 * // 输出结果: { birthStart: '2026-07-08', userName: 'fuyongbo' }
 *
 * // 3. 交付 API
 * api.user.getList(apiParams);
 */
export function serializeFormValues(
  fieldsValue: Record<string, any>,
  schema: Record<string, any>,
): Record<string, any> {
  if (!fieldsValue || typeof fieldsValue !== 'object') return fieldsValue
  if (!schema || typeof schema !== 'object') return { ...fieldsValue }

  const serializedParams = { ...fieldsValue }

  Object.keys(serializedParams).forEach((key) => {
    const value = serializedParams[key]
    const fieldSchema = schema[key]

    if (!fieldSchema) return

    const isDatePicker =
      (fieldSchema.props && 'showTime' in fieldSchema.props) ||
      (fieldSchema.props && 'format' in fieldSchema.props)

    if (!isDatePicker) return

    if (value === null || value === undefined) {
      serializedParams[key] = undefined
      return
    }

    const d = dayjs(value)
    if (!d.isValid()) return

    let targetFormat = 'YYYY-MM-DD'
    if (fieldSchema.props) {
      const { showTime, format } = fieldSchema.props
      if (format && typeof format === 'object' && format.format) {
        targetFormat = format.format
      } else if (typeof format === 'string') {
        targetFormat = format
      } else if (showTime) {
        targetFormat = 'YYYY-MM-DD HH:mm:ss'
      }
    }

    serializedParams[key] = d.format(targetFormat)
  })

  return serializedParams
}
