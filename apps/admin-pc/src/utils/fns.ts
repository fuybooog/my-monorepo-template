/**
 * 字典项对象的基础类型约束
 */
export type DictItem = Record<string, string | number | boolean>

/**
 * 在字典列表 (Array) 中查找指定键的值，并返回对应的映射文本或属性。
 * 常用于将后端的枚举 ID（如 1）转换为前端展示的文本（如 '启用'）。
 *
 * @param dictList     - 字典源数组，例如：`[{ id: '1', name: '启用' }]`
 * @param targetValue  - 需要匹配的目标键值，例如：`1` 或 `'1'`
 * @param matchKey     - 用于匹配的键名，默认值为 `'id'`
 * @param resultKey    - 需要返回的目标属性名，默认值为 `'name'`
 * @returns            - 找到则返回目标属性值；若未找到或发生异常，则安全地返回 `targetValue` 本身
 *
 * @example
 * const statusList = [{ id: 0, name: '禁用' }, { id: 1, name: '启用' }];
 * getDictLabel(statusList, 1); // 返回: '启用'
 * getDictLabel(statusList, 99); // 边界情况：未找到，安全返回: 99
 */
export function getDictLabel(
  dictList: DictItem[],
  targetValue: string | number | boolean,
  matchKey: string = 'id',
  resultKey: string = 'name',
): string | number | boolean {
  // 边界防御 1：拦截可能导致的 NullPointer 异常 (如传入了 null, undefined 或非数组)
  if (!Array.isArray(dictList) || dictList.length === 0) {
    return targetValue
  }

  // 边界防御 2：拦截无效的查询键名（防止 item[matchKey] 抛出异常或逻辑错误）
  if (targetValue === null || targetValue === undefined || !matchKey || !resultKey) {
    return targetValue
  }

  try {
    // 执行查找：使用严格相等 (===)
    const matchedItem = dictList.find((item) => {
      // 边界防御 3：确保当前遍历项是一个有效对象，且包含我们要对比的 matchKey
      if (!item || typeof item !== 'object') {
        return false
      }
      return item[matchKey] === targetValue
    })

    // 如果找到了匹配项，并且该项中存在我们要获取的 resultKey，则返回对应值
    if (matchedItem && resultKey in matchedItem) {
      return matchedItem[resultKey]
    }
  } catch (error) {
    // 边界防御 4：生产环境容错，即使发生意料之外的错误（如 Proxy 拦截器报错），也绝不阻塞主线程
    console.error('[getDictLabel] 字典解析运行时异常:', error)
  }

  // 兜底处理：未匹配到或发生异常时，保持原样输出
  return targetValue
}
