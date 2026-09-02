// @ts-nocheck
import { describe, it, expect } from 'vitest'
import {
  arrayToTree,
  getSiblings,
  getPrevNode,
  getNextNode,
  getPrevNodes,
  getNextNodes,
  treeToArray,
  filterTreeMulti,
  getExpandedKeys,
  getParentNode,
  arrayToTreeWithMeta,
  matchFieldWithMeta,
  filterRealCheckedKeys,
} from './tree-fns'

const flatList = [
  { id: 1, parentId: null, name: '根1', sortNumber: 1 },
  { id: 2, parentId: 1, name: '子1', sortNumber: 2 },
  { id: 3, parentId: 1, name: '子2', sortNumber: 1 },
  { id: 4, parentId: 2, name: '孙1', sortNumber: 1 },
  { id: 5, parentId: 999, name: '孤儿节点', sortNumber: 99 },
]

describe('arrayToTree', () => {
  it('正确构建父子关系并排序', () => {
    const { tree, parentMap } = arrayToTree(flatList)
    expect(tree).toHaveLength(2) // 根1 + 孤儿节点
    const root = tree[0]
    expect(root.id).toBe(1)
    expect(root.children.map((c: any) => c.id)).toEqual([3, 2]) // 按 sortNumber 升序
    expect(root.children[1].children[0].id).toBe(4)
    expect(parentMap.get(2)!.id).toBe(1)
    // 叶子节点清理空 children
    expect(root.children[0].children).toBeUndefined()
  })

  it('支持自定义 idKey / parentKey / childrenKey', () => {
    const list = [
      { uid: 'a', pid: null, label: 'A' },
      { uid: 'b', pid: 'a', label: 'B' },
    ]
    const { tree } = arrayToTree(list as any, {
      idKey: 'uid',
      parentKey: 'pid',
      childrenKey: 'kids',
    })
    expect(tree[0].kids[0].uid).toBe('b')
  })

  it('支持 sortAsc: false 降序与 transformNode', () => {
    const { tree } = arrayToTree(
      [
        { id: 1, parentId: null, sortNumber: 1 },
        { id: 2, parentId: null, sortNumber: 2 },
      ],
      { sortAsc: false, transformNode: (node, children) => ({ key: node.id, children }) },
    )
    expect(tree.map((n: any) => n.key)).toEqual([2, 1])
  })

  it('注入位置元数据 _index / _isFirst / _isLast', () => {
    const { tree } = arrayToTree(flatList)
    expect(tree[0]._index).toBe(0)
    expect(tree[0]._isFirst).toBe(true)
    expect(tree[0]._isLast).toBe(false) // 有两个顶层节点
    expect(tree[0].children[0]._index).toBe(0)
    expect(tree[0].children[0]._isFirst).toBe(true)
    expect(tree[0].children[1]._isLast).toBe(true)
  })
})

describe('兄弟节点操作', () => {
  const { tree, parentMap } = arrayToTree(flatList)
  const root = tree[0]
  const [child3, child2] = root.children

  it('getSiblings 返回同级节点', () => {
    expect(getSiblings(child2 as any, parentMap, tree).map((n: any) => n.id)).toEqual([3, 2])
    expect(getSiblings(root as any, parentMap, tree).map((n: any) => n.id)).toEqual([1, 5])
  })

  it('getPrevNode / getNextNode', () => {
    // 同级按 sortNumber 升序：[3, 2]
    expect(getPrevNode(child3 as any, parentMap, tree)).toBeNull() // 同级第一个无前驱
    expect(getPrevNode(child2 as any, parentMap, tree)!.id).toBe(3)
    expect(getPrevNode(root as any, parentMap, tree)).toBeNull() // 顶层第一个无前驱
    expect(getNextNode(child3 as any, parentMap, tree)!.id).toBe(2)
    expect(getNextNode(child2 as any, parentMap, tree)).toBeNull() // 同级最后一个无后继
  })

  it('getPrevNodes / getNextNodes', () => {
    expect(getPrevNodes(root as any, parentMap, tree)).toBeNull() // index 0
    const prev = getPrevNodes(child2 as any, parentMap, tree)
    expect(prev!.firstNode.id).toBe(3)
    expect(prev!.prevNodes).toHaveLength(0)

    const next = getNextNodes(child3 as any, parentMap, tree)
    expect(next!.lastNode.id).toBe(2)
    expect(next!.nextNodes).toHaveLength(1) // child3 之后还有 child2
    expect(getNextNodes(child2 as any, parentMap, tree)).toBeNull() // 末节点
  })
})

describe('treeToArray', () => {
  it('深度优先平铺并清理 children', () => {
    const { tree } = arrayToTree(flatList)
    const arr = treeToArray(tree)
    expect(arr.map((n: any) => n.id)).toEqual([1, 3, 2, 4, 5])
    expect(arr[0]).not.toHaveProperty('children')
  })

  it('cleanChildren: false 时保留 children', () => {
    const { tree } = arrayToTree(flatList)
    const arr = treeToArray(tree, { cleanChildren: false })
    expect(arr[0]).toHaveProperty('children')
  })
})

describe('filterTreeMulti', () => {
  const { tree } = arrayToTree([
    { id: 1, parentId: null, name: '资源管理', type: 1 },
    { id: 2, parentId: 1, name: 'User 列表', type: 2 },
    { id: 3, parentId: 1, name: '角色管理', type: 2 },
    { id: 4, parentId: 3, name: '角色编辑', type: 3 },
  ])

  it('无有效条件时返回原树', () => {
    expect(filterTreeMulti(tree, { name: '' })).toEqual(tree)
  })

  it('AND 模式：命中父节点时保留整棵子树', () => {
    const result = filterTreeMulti(tree, { name: '资源' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
    expect(result[0].children).toHaveLength(2)
  })

  it('AND 模式：命中子节点时保留父链', () => {
    const result = filterTreeMulti(tree, { name: '角色' })
    expect(result).toHaveLength(1)
    expect(result[0].children.map((c: any) => c.id)).toEqual([3])
    expect(result[0].children[0].children[0].id).toBe(4)
  })

  it('OR 模式：任一条件命中即保留', () => {
    const result = filterTreeMulti(tree, { name: '不存在的', type: 3 }, { mode: 'OR' })
    // 匹配 type=3 的叶子（角色编辑），保留父链
    expect(result[0].children[0].children[0].id).toBe(4)
  })

  it('数组条件使用包含匹配', () => {
    const result = filterTreeMulti(tree, { id: [2, 4] })
    expect(result).toHaveLength(1)
    expect(result[0].children[0].id).toBe(2)
    expect(result[0].children[1].children[0].id).toBe(4)
  })

  it('字符串模糊匹配忽略大小写', () => {
    const result = filterTreeMulti(tree, { name: 'USER' })
    expect(result[0].children[0].id).toBe(2)
  })
})

describe('getExpandedKeys / getParentNode', () => {
  const { tree } = arrayToTree(flatList)

  it('getExpandedKeys 返回含子节点的 key', () => {
    expect(getExpandedKeys(tree)).toEqual([1, 2])
  })

  it('getParentNode 返回父节点或 null', () => {
    expect(getParentNode(tree, 4)!.id).toBe(2)
    expect(getParentNode(tree, 1)).toBeNull()
    expect(getParentNode(tree, 999)).toBeNull()
  })
})

describe('arrayToTreeWithMeta', () => {
  it('将 type=2 归入 buttons、type=3 归入 columns', () => {
    const list = [
      { uniqueProp: 'page1', parentUniqueProp: null, type: '1', label: '页面' },
      { uniqueProp: 'btn1', parentUniqueProp: 'page1', type: '2', label: '新增' },
      { uniqueProp: 'col1', parentUniqueProp: 'page1', type: '3', label: '列' },
    ]
    const { tree } = arrayToTreeWithMeta(list as any)
    const page = tree[0]
    expect(page.buttons.map((b: any) => b.uniqueProp)).toEqual(['btn1'])
    expect(page.columns.map((c: any) => c.uniqueProp)).toEqual(['col1'])
  })
})

describe('matchFieldWithMeta', () => {
  const node = {
    uniqueProp: 'page1',
    label: '用户管理',
    buttons: [{ uniqueProp: 'btn-add', label: '新增用户' }],
    columns: [{ uniqueProp: 'col-op', label: '操作列' }],
  }

  it('匹配自身属性', () => {
    expect(matchFieldWithMeta(node, 'label', '用户')).toBe(true)
  })

  it('匹配按钮 / 列属性', () => {
    expect(matchFieldWithMeta(node, 'label', '新增')).toBe(true)
    expect(matchFieldWithMeta(node, 'label', '操作')).toBe(true)
  })

  it('全部未命中返回 false', () => {
    expect(matchFieldWithMeta(node, 'label', '不存在')).toBe(false)
  })
})

describe('filterRealCheckedKeys', () => {
  const treeData = [
    {
      id: 1,
      children: [
        { id: 2, children: [] },
        { id: 3, children: [] },
      ],
    },
    { id: 4, children: [] },
  ]

  it('父节点全选且所有子节点选中时保留父 key（叶子 key 一并收集）', () => {
    expect(filterRealCheckedKeys([1, 2, 3], treeData)).toEqual([2, 3, 1])
  })

  it('部分选中时只保留叶子 key', () => {
    expect(filterRealCheckedKeys([1, 2], treeData)).toEqual([2])
  })

  it('支持 node.key 兜底', () => {
    const data = [{ key: 'a', children: [{ key: 'a1', children: [] }] }]
    expect(filterRealCheckedKeys(['a', 'a1'], data)).toEqual(['a1', 'a'])
  })
})
