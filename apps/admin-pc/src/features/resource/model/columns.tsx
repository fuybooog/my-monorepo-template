import { SmartColumnType } from '@/components/common'
import { Backend } from '@repo/types'
import { commonTimeRender, createStatusRender, MetaTreeNode } from '@/utils'
import { MetaItemTagList } from '../components/MetaItemTagList'
import { ResourcePageRespDto } from '../types'

/**
 * 获取用户列表表格列配置
 * @param callbacks - 页面传入的回调函数
 * @returns 列配置数组
 */
export const getResourceColumns = (callbacks: {
  handleEditMeta: (item: MetaTreeNode) => void
  handleDeleteMeta: (item: MetaTreeNode) => void
  onStatusChange: (record: ResourcePageRespDto, newStatus: string) => Promise<unknown>
  refreshList: () => void
}): SmartColumnType<ResourcePageRespDto>[] => {
  const { onStatusChange, refreshList, handleEditMeta, handleDeleteMeta } = callbacks

  return [
    {
      title: '资源名称',
      dataIndex: 'label',
      width: 180,
      ellipsis: true,
    },
    {
      title: '唯一编码',
      dataIndex: 'uniqueProp',
      width: 160,
    },
    {
      title: '唯一父编码',
      dataIndex: 'parentUniqueProp',
      width: 160,
    },
    {
      title: '菜单路径',
      dataIndex: 'menuPath',
      width: 160,
      ellipsis: true,
    },
    // {
    //   title: '类型',
    //   dataIndex: 'type',
    //   width: 100,
    //   render: (value) => <span>{getDictLabel(typeList, value)}</span>
    // },
    {
      title: '包含按钮',
      dataIndex: 'buttons',
      key: 'buttons',
      render: (buttons?: MetaTreeNode[]) => {
        if (!buttons || buttons.length === 0) return <span style={{ color: '#ccc' }}>-</span>
        return (
          <MetaItemTagList
            items={buttons}
            color="orange"
            maxCount={3}
            onEdit={handleEditMeta}
            onDelete={handleDeleteMeta}
          />
        )
      },
    },
    {
      title: '包含数据列',
      dataIndex: 'columns',
      key: 'columns',
      render: (cols?: MetaTreeNode[]) => {
        if (!cols || cols.length === 0) return <span style={{ color: '#ccc' }}>-</span>
        return (
          <MetaItemTagList
            items={cols}
            color="orange"
            maxCount={3}
            onEdit={handleEditMeta}
            onDelete={handleDeleteMeta}
          />
        )
      },
    },
    {
      title: '菜单是否隐藏',
      dataIndex: 'notInMenu',
      width: 160,
      render: (value) => <span>{value === '1' ? '是' : ''}</span>,
    },
    // {
    //   title: '排序号',
    //   dataIndex: 'sortNumber',
    //   width: 80,
    // },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      fixed: 'right',
      render: createStatusRender({ onStatusChange, refreshList }),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: { multiple: 2 },
      width: 180,
      render: commonTimeRender,
    },
    {
      title: '修改时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: commonTimeRender,
    },
  ]
}
