import { SmartColumnType } from '@/components/common'
import { Backend } from '@repo/types'
import { commonTimeRender, createStatusRender } from '@/utils'
import { PERMISSIONS } from '@repo/shared'
import { ADMIN_USER_NAME } from '@/constants'

/**
 * 获取用户列表表格列配置
 * @param callbacks - 页面传入的回调函数
 * @returns 列配置数组
 */
export const getUserColumns = (callbacks: {
  onNameClick: (record: Backend.UserPageRespDto) => void
  onStatusChange: (record: Backend.UserPageRespDto, newStatus: string) => Promise<unknown>
  refreshList: () => void
}): SmartColumnType<Backend.UserPageRespDto>[] => {
  const { onNameClick, onStatusChange, refreshList } = callbacks

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
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
      title: '昵称',
      dataIndex: 'nickName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 130,
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'genderName',
      width: 80,
    },
    {
      title: '生日',
      dataIndex: 'birth',
      width: 120,
      render: commonTimeRender('YYYY-MM-DD'),
    },
    {
      title: '婚姻状况',
      dataIndex: 'maritalStatusName',
      width: 100,
    },
    {
      title: '家庭住址',
      dataIndex: 'address',
      ellipsis: true,
      width: 200,
      render: (text: string, record: Backend.UserPageRespDto) => {
        const detail = record.addressDetail || ''
        let addres = ''
        if (text) {
          try {
            addres = JSON.parse(text)
              .map((item: { name: string }) => item.name)
              .join(' ')
          } catch (e) {
            console.error('地址转化错误', e)
          }
        }
        return `${addres || ''}${detail ? ` ${detail}` : ''}` || '-'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: createStatusRender({
        onStatusChange,
        refreshList,
        disabled(record) {
          return record.userName === ADMIN_USER_NAME
        },
        permission: [PERMISSIONS.SYS_USER_LIST_EDIT],
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
