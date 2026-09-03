import { FieldMeta, LogFieldChange } from '@/modules/operation-log/operation-log.types'

/** 把存储值格式化为展示文本（未命中 format 时的兜底规则） */
function toText(value: unknown, format?: (value: unknown) => string | null): string {
  if (format) {
    const formatted = format(value)
    if (formatted != null) return formatted
  }
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/**
 * 字段级 diff 生成器。
 *
 * @param patch     本次修改的字段集合（一般传 update dto 本身）
 * @param oldRecord 修改前的实体（含全部旧字段值）
 * @param metas     该业务模块声明参与 diff 的字段元数据
 * @returns 变更明细；值未变化的字段会被跳过
 *
 * 用例：张三修改了王五的 nickName
 *   -> [{ field: 'nickName', fieldText: '昵称', oldText: '王五', newText: '王六' }]
 */
export function buildFieldChanges(
  patch: Record<string, unknown>,
  oldRecord: Record<string, unknown>,
  metas: FieldMeta[],
): LogFieldChange[] {
  const metaMap = new Map(metas.map((meta) => [meta.field, meta]))
  const changes: LogFieldChange[] = []

  for (const [field, newValue] of Object.entries(patch)) {
    const meta = metaMap.get(field)
    // 未登记元数据的字段不参与 diff（如 password/createdAt 等内部字段）
    if (!meta) continue

    const oldValue = oldRecord[field]
    if (toText(newValue, meta.format) === toText(oldValue, meta.format)) continue

    changes.push({
      field,
      fieldText: meta.label,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      oldText: toText(oldValue, meta.format),
      newText: toText(newValue, meta.format),
    })
  }

  return changes
}

/** 变更明细的人话拼接片段，如：昵称「王五」→「王六」 */
export function formatChangesText(changes: LogFieldChange[]): string {
  return changes
    .map((change) => `${change.fieldText}「${change.oldText}」→「${change.newText}」`)
    .join('；')
}

/**
 * 新增场景的字段明细生成器：把创建入参中有值的字段登记为变更，
 * oldText 为空串（表示"无 → 新值"），用于详情页完整呈现新对象信息。
 */
export function buildCreatedChanges(
  patch: Record<string, unknown>,
  metas: FieldMeta[],
): LogFieldChange[] {
  const metaMap = new Map(metas.map((meta) => [meta.field, meta]))
  const changes: LogFieldChange[] = []

  for (const [field, value] of Object.entries(patch)) {
    const meta = metaMap.get(field)
    if (!meta) continue
    const text = toText(value, meta.format)
    if (text === '') continue

    changes.push({
      field,
      fieldText: meta.label,
      oldValue: null,
      newValue: value ?? null,
      oldText: '',
      newText: text,
    })
  }

  return changes
}

/**
 * 自动摘要：张三 修改了 用户 #5 王五：昵称「王五」→「王六」；邮箱「a@b」→「c@d」
 * 超长时截断并保留"等 N 项字段变更"提示（summary 列上限 500）。
 */
export function buildChangeSummary(
  operatorName: string,
  operationText: string,
  businessText: string,
  changes?: LogFieldChange[],
): string {
  const head = `${operatorName || '系统'} ${operationText}了 ${businessText}`

  if (!changes || changes.length === 0) {
    return head.length > 500 ? `${head.slice(0, 500)}...` : head
  }

  const maxHeadLen = 500
  let text = `${head}：${formatChangesText(changes)}`
  if (text.length <= 500) return text

  // 逐步收缩变更片段，直到放下为止
  const changesCopy = [...changes]
  let rest = ''
  for (;;) {
    text = `${head}：${formatChangesText(changesCopy)}`
    if (text.length <= maxHeadLen) break
    rest = `等 ${changes.length - changesCopy.length + 1} 项字段变更`
    changesCopy.pop()
    if (changesCopy.length === 0) {
      text = `${head}（${rest}）`
      break
    }
  }

  if (text.length > 500) text = `${text.slice(0, 497)}...`
  return text
}
