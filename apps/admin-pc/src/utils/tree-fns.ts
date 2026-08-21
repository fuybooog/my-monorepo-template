export type TreeNode = Record<string, any>

/**
 * 转换树配置项
 */
export interface TreeConfig<T extends TreeNode = TreeNode> {
  idKey?: keyof T
  parentKey?: keyof T
  childrenKey?: string
  sortKey?: keyof T
  sortAsc?: boolean
  rootParentValues?: any[] // 标识根节点的 parentId 集合
}

/**
 * 平铺转树返回值结构
 */
export interface TreeResult<T extends TreeNode = TreeNode> {
  tree: T[]
  nodeMap: Map<string | number, T>
  idNodeMap: Map<string | number, T>
  parentMap: Map<string | number, T>
  idParentMap: Map<string | number, T>
}

export interface MetaTreeNode extends TreeNode {
  type?: '0' | '1' | '2' | '3' | string // 0: 目录, 1: 页面, 2: 按钮, 3: 列
  buttons?: MetaTreeNode[]
  columns?: MetaTreeNode[]
}

/**
 * 1. 平铺数组转树结构 (Array -> Tree)
 */
export function arrayToTree<T extends TreeNode = TreeNode>(
  list: T[],
  config: TreeConfig<T> = {},
): TreeResult<T> {
  const {
    idKey = 'id',
    parentKey = 'parentId',
    childrenKey = 'children',
    sortKey = 'sortNumber',
    sortAsc = true,
    rootParentValues = [null, undefined, 0, '0', ''],
  } = config

  const tree: T[] = []
  const nodeMap = new Map<string | number, T>()
  const idNodeMap = new Map<string | number, T>()
  const parentMap = new Map<string | number, T>()
  const idParentMap = new Map<string | number, T>()
  const rootValueSet = new Set(rootParentValues)

  // 第一遍遍历：深拷贝节点并建立节点映射表
  for (const item of list) {
    const id = item[idKey]
    if (id !== undefined && id !== null) {
      const nodeCopy = { ...item, [childrenKey]: [] }
      nodeMap.set(id, nodeCopy)

      // 新增：如果原始数据有 'id' 字段，则同时存入 idNodeMap
      if (item.id !== undefined && item.id !== null) {
        idNodeMap.set(item.id, nodeCopy)
      }
    }
  }

  // 第二遍遍历：构建树形关系与父子节点映射
  for (const item of list) {
    const id = item[idKey]
    const parentId = item[parentKey]
    const currentNode = nodeMap.get(id)

    if (!currentNode) continue

    const isRoot = rootValueSet.has(parentId)
    const parentNode = isRoot ? undefined : nodeMap.get(parentId)

    if (parentNode) {
      parentNode[childrenKey].push(currentNode)
      parentMap.set(id, parentNode)
      if (item.id) {
        idParentMap.set(item.id, parentNode)
      }
    } else {
      tree.push(currentNode)
    }
  }

  // 递归处理节点排序、计算层级位置与清理空的 children 字段
  const processNode = (nodes: T[]) => {
    // 1. 先进行当前层级的排序
    if (sortKey) {
      nodes.sort((a, b) => {
        const valA = a[sortKey] ?? Infinity
        const valB = b[sortKey] ?? Infinity
        return sortAsc ? valA - valB : valB - valA
      })
    }

    const total = nodes.length

    // 2. 遍历当前层级，计算并注入位置属性，然后递归处理子节点
    for (let i = 0; i < total; i++) {
      const node = nodes[i]

      // 注入位置信息：索引、是否第一位、是否最后一位
      Object.assign(node, {
        _index: i,
        _isFirst: i === 0,
        _isLast: i === total - 1,
      })

      const children = node[childrenKey]
      if (Array.isArray(children) && children.length === 0) {
        delete node[childrenKey]
      } else if (children && children.length > 0) {
        processNode(children)
      }
    }
  }

  processNode(tree)

  return { tree, nodeMap, parentMap, idNodeMap, idParentMap }
}

/**
 * 获取所有兄弟节点
 */
export function getSiblings<T extends TreeNode = TreeNode>(
  record: T,
  parentMap: Map<string | number, T>,
  tree: T[],
  config: TreeConfig<T> = {},
): T[] {
  const { idKey = 'id' } = config
  const parentNode = parentMap.get(record[idKey])
  // 如果有父节点，返回父节点的 children；如果没有，说明是根节点，返回顶级 tree 数组
  return parentNode ? parentNode.children : tree
}

/**
 * 获取上一个兄弟节点
 */
export function getPrevNode<T extends TreeNode = TreeNode>(
  record: T,
  parentMap: Map<string | number, T>,
  tree: T[],
  config: TreeConfig<T> = {},
) {
  const siblings = getSiblings(record, parentMap, tree, config)
  const prevNode = siblings[record._index - 1]

  if (!prevNode) return null

  return prevNode
}

/**
 * 获取下一个兄弟节点
 */
export function getNextNode<T extends TreeNode = TreeNode>(
  record: T,
  parentMap: Map<string | number, T>,
  tree: T[],
  config: TreeConfig<T> = {},
) {
  const siblings = getSiblings(record, parentMap, tree, config)
  const nextNode = siblings[record._index + 1]

  if (!nextNode) return null

  return nextNode
}

/**
 * 获取排在其之前的所有兄弟节点
 */
export function getPrevNodes<T extends TreeNode = TreeNode>(
  record: T,
  parentMap: Map<string | number, T>,
  tree: T[],
  config: TreeConfig<T> = {},
) {
  if (record._index === 0) return null
  const siblings = getSiblings(record, parentMap, tree, config)

  const firstNode = siblings[0]
  const prevNodes = siblings.slice(1, record._index)
  return {
    firstNode,
    prevNodes,
  }
}
/**
 * 获取排在其之后的所有兄弟节点
 */
export function getNextNodes<T extends TreeNode = TreeNode>(
  record: T,
  parentMap: Map<string | number, T>,
  tree: T[],
  config: TreeConfig<T> = {},
) {
  if (record._isLast) return null
  const siblings = getSiblings(record, parentMap, tree, config)

  const lastNode = siblings[siblings.length - 1]
  const nextNodes = siblings.slice(record._index + 1)
  return {
    lastNode,
    nextNodes,
  }
}

/**
 * 2. 树结构转平铺数组 (Tree -> Array)
 */
export interface TreeToArrayOptions {
  childrenKey?: string
  cleanChildren?: boolean
}

export function treeToArray<T extends TreeNode = TreeNode>(
  tree: T[],
  options: TreeToArrayOptions = {},
): T[] {
  const { childrenKey = 'children', cleanChildren = true } = options
  const result: T[] = []

  function dfs(nodes: T[]) {
    for (const node of nodes) {
      const item = { ...node }
      const children = item[childrenKey]

      if (cleanChildren) {
        delete item[childrenKey]
      }

      result.push(item)

      if (Array.isArray(children) && children.length > 0) {
        dfs(children)
      }
    }
  }

  dfs(tree)
  return result
}

/**
 * 3. 多条件树形过滤 (含“匹配子显父、匹配父显子”核心逻辑)
 */
export type FilterCondition<T> = {
  [K in keyof T]?: any
}

export interface MultiSearchOptions {
  childrenKey?: string
  mode?: 'AND' | 'OR'
}

export function filterTreeMulti<T extends TreeNode = TreeNode>(
  tree: T[],
  conditions: FilterCondition<T>,
  options: MultiSearchOptions = {},
): T[] {
  const { childrenKey = 'children', mode = 'AND' } = options

  // 提取有效的筛选条件（过滤掉 undefined, null, ''）
  const activeEntries = Object.entries(conditions).filter(
    ([_, value]) => value !== undefined && value !== null && value !== '',
  )

  if (activeEntries.length === 0) return tree

  // 检查单个节点自身是否匹配
  const checkSelfMatched = (node: T): boolean => {
    const matchFn = ([key, targetValue]: [string, any]) => matchField(node[key], targetValue)
    return mode === 'AND' ? activeEntries.every(matchFn) : activeEntries.some(matchFn)
  }

  // 字段比对方法
  function matchField(nodeValue: any, targetValue: any): boolean {
    if (nodeValue === undefined || nodeValue === null) return false

    // 字符串：忽略大小写的模糊匹配
    if (typeof targetValue === 'string' && typeof nodeValue === 'string') {
      return nodeValue.toLowerCase().includes(targetValue.trim().toLowerCase())
    }
    // 数组类型条件：包含匹配
    if (Array.isArray(targetValue)) {
      return targetValue.includes(nodeValue)
    }
    // 其他类型：精确匹配
    return nodeValue === targetValue
  }

  // DFS 递归保留匹配逻辑
  function dfs(nodes: T[], isParentMatched = false): T[] {
    const result: T[] = []

    for (const node of nodes) {
      const selfMatched = checkSelfMatched(node)
      const currentMatched = isParentMatched || selfMatched

      const children = node[childrenKey]
      let filteredChildren: T[] = []

      // 只要祖先节点匹配，isParentMatched 即为 true，所有子孙节点都会保留
      if (Array.isArray(children) && children.length > 0) {
        filteredChildren = dfs(children, currentMatched)
      }

      // 保留条件：自身/祖先匹配，或者其子树中有匹配节点
      if (currentMatched || filteredChildren.length > 0) {
        const newNode: any = { ...node }
        if (filteredChildren.length > 0) {
          newNode[childrenKey] = filteredChildren
        } else if (selfMatched && !isParentMatched) {
          delete newNode[childrenKey]
        }
        result.push(newNode)
      }
    }

    return result
  }

  return dfs(tree)
}

/**
 * 4. 收集搜索后需要展开的父节点 Key 列表
 */
export function getExpandedKeys<T extends TreeNode = TreeNode>(
  tree: T[],
  idKey: keyof T = 'id',
  childrenKey: string = 'children',
): (string | number)[] {
  const keys: (string | number)[] = []

  function collect(nodes: T[]) {
    for (const node of nodes) {
      const children = node[childrenKey]
      if (Array.isArray(children) && children.length > 0) {
        keys.push(node[idKey])
        collect(children)
      }
    }
  }

  collect(tree)
  return keys
}
export function getParentNode<T extends TreeNode = TreeNode>(
  tree: T[],
  id: string | number,
  config: TreeConfig<T> = {},
): T | null {
  const { idKey = 'id', childrenKey = 'children' } = config

  // 递归查找父节点
  function search(nodes: T[], parent: T | null = null): T | null {
    for (const node of nodes) {
      // 如果当前节点的 id 匹配目标，返回其父节点
      if (node[idKey] === id) {
        return parent
      }
      // 获取子节点数组（可能为 undefined）
      const children = node[childrenKey] as T[] | undefined
      if (Array.isArray(children) && children.length > 0) {
        const result = search(children, node)
        if (result !== null) {
          return result
        }
      }
    }
    return null
  }

  return search(tree, null)
}

/**
 * 5. 将平铺数据转为带有 buttons / columns 的树（基于你的 arrayToTree 改造）
 */
export function arrayToTreeWithMeta<T extends MetaTreeNode = MetaTreeNode>(
  list: T[],
  config: TreeConfig<T> = {},
): TreeResult<T> {
  const {
    idKey = 'uniqueProp', // 默认对应你的业务字段
    parentKey = 'parentUniqueProp',
    childrenKey = 'children',
  } = config

  // 1. 分离常规节点（目录/页面）与 按钮(type=2)/列(type=3)
  const buttonsMap = new Map<string | number, T[]>()
  const columnsMap = new Map<string | number, T[]>()
  const regularList: T[] = []

  for (const item of list) {
    const typeStr = String(item.type)
    const parentVal = item[parentKey]

    if (typeStr === '2') {
      if (parentVal) {
        const group = buttonsMap.get(parentVal) || []
        group.push(item)
        buttonsMap.set(parentVal, group)
      }
    } else if (typeStr === '3') {
      if (parentVal) {
        const group = columnsMap.get(parentVal) || []
        group.push(item)
        columnsMap.set(parentVal, group)
      }
    } else {
      regularList.push({ ...item })
    }
  }

  // 2. 将按钮和列作为子属性（buttons / columns）挂载到页面节点上
  for (const item of regularList) {
    const nodeKey = item[idKey]
    if (buttonsMap.has(nodeKey)) {
      item.buttons = buttonsMap.get(nodeKey)
    }
    if (columnsMap.has(nodeKey)) {
      item.columns = columnsMap.get(nodeKey)
    }
  }

  // 3. 直接复用你现有的 arrayToTree 方法
  return arrayToTree(regularList, {
    idKey,
    parentKey,
    childrenKey,
    ...config,
  })
}

export function matchFieldWithMeta(node: TreeNode, key: string, targetValue: any): boolean {
  const nodeValue = node[key]

  // 1. 尝试直接匹配当前节点的属性（例如：匹配页面自身的 label）
  if (matchField(nodeValue, targetValue)) {
    return true
  }

  // 2. 如果当前节点有 buttons 数组，检查内部是否有按钮满足此条件
  if (Array.isArray(node.buttons) && node.buttons.length > 0) {
    const hasMatchButton = node.buttons.some((btn) => matchField(btn[key], targetValue))
    if (hasMatchButton) return true
  }

  // 3. 如果当前节点有 columns 数组，检查内部是否有列满足此条件
  if (Array.isArray(node.columns) && node.columns.length > 0) {
    const hasMatchColumn = node.columns.some((col) => matchField(col[key], targetValue))
    if (hasMatchColumn) return true
  }

  return false
}

// 提取原有的 matchField 基础判断逻辑
function matchField(nodeValue: any, targetValue: any): boolean {
  if (nodeValue === undefined || nodeValue === null) return false

  if (typeof targetValue === 'string' && typeof nodeValue === 'string') {
    return nodeValue.toLowerCase().includes(targetValue.trim().toLowerCase())
  }
  if (Array.isArray(targetValue)) {
    return targetValue.includes(nodeValue)
  }
  return nodeValue === targetValue
}
export function filterRealCheckedKeys(allKeys: React.Key[], treeData: any[]): React.Key[] {
  const checkedKeySet = new Set(allKeys)
  const realCheckedKeys: React.Key[] = []

  function checkNode(node: any): boolean {
    // 1. 改为获取 node.id (兼容 node.key)
    const key = node.id ?? node.key

    const children = node.children || []

    // 2. 如果是叶子节点
    if (children.length === 0) {
      if (checkedKeySet.has(key)) {
        realCheckedKeys.push(key)
        return true
      }
      return false
    }

    // 3. 如果是父节点，递归检查子节点
    const childrenStatus = children.map((child: any) => checkNode(child))
    const isAllChildrenChecked = childrenStatus.every((status: boolean) => status === true)

    // 只有当父节点本身在列表里，且“所有子节点也都全选”时，才视该父节点为全选
    if (checkedKeySet.has(key) && isAllChildrenChecked) {
      realCheckedKeys.push(key)
      return true
    }

    return isAllChildrenChecked
  }

  treeData.forEach((node) => checkNode(node))
  return realCheckedKeys
}
