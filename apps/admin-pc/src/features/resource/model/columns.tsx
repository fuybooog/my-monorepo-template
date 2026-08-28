import { SmartColumnType } from '@/components/common'
import { commonTimeRender, createStatusRender, MetaTreeNode } from '@/utils'
import { MetaItemTagList } from '../components/MetaItemTagList'
import { ResourcePageRespDto } from '../types'
import { PERMISSIONS } from '@repo/shared'

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
      width: 180,
    },
    // {
    //   title: '唯一父编码',
    //   dataIndex: 'parentUniqueProp',
    //   width: 160,
    // },
    {
      title: '菜单路径',
      dataIndex: 'menuPath',
      width: 180,
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
      width: 260,
      render: (buttons?: MetaTreeNode[]) => {
        if (!buttons || buttons.length === 0) return <span style={{ color: '#ccc' }}>-</span>
        return (
          <MetaItemTagList
            items={buttons}
            color="orange"
            maxCount={2}
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
      width: 120,
      render: (cols?: MetaTreeNode[]) => {
        if (!cols || cols.length === 0) return <span style={{ color: '#ccc' }}>-</span>
        return (
          <MetaItemTagList
            items={cols}
            color="orange"
            maxCount={2}
            onEdit={handleEditMeta}
            onDelete={handleDeleteMeta}
          />
        )
      },
    },
    {
      title: '菜单是否隐藏',
      dataIndex: 'notInMenu',
      width: 120,
      render: (value) => <span>{value === '1' ? '是' : ''}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      fixed: 'right',
      render: createStatusRender({
        onStatusChange,
        refreshList,
        permission: [PERMISSIONS.SYS_RESOURCE_LIST_EDIT],
      }),
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
