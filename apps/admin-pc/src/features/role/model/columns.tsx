import { SmartColumnType } from '@/components/common'
import { Backend } from '@repo/types'
import { commonTimeRender, createStatusRender } from '@/utils'
import { PERMISSIONS } from '@repo/shared'

/**
 * 获取角色列表表格列配置
 * @param callbacks - 页面传入的回调函数
 * @returns 列配置数组
 */
export const getRoleColumns = (callbacks: {
  onNameClick: (record: Backend.RolePageRespDto) => void
  onStatusChange: (record: Backend.RolePageRespDto, newStatus: string) => Promise<unknown>
  refreshList: () => void
}): SmartColumnType<Backend.RolePageRespDto>[] => {
  const { onNameClick, onStatusChange, refreshList } = callbacks

  return [
    {
      title: '角色名',
      dataIndex: 'roleName',
      sorter: { multiple: 2 },
      width: 120,
      ellipsis: true,
      link: {
        onClick: (record) => {
          onNameClick(record)
        },
      },
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      width: 120,
      ellipsis: true,
    },
    {
      title: '资源数',
      dataIndex: 'resourceCount',
      width: 120,
    },
    {
      title: '人员数',
      dataIndex: 'userCount',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: createStatusRender({
        onStatusChange,
        refreshList,
        disabled: (record) => record.roleCode === 'admin',
        permission: [PERMISSIONS.SYS_ROLE_LIST_EDIT],
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
