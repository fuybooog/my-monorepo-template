import { SmartColumnType } from '@/components/common'
import { Backend } from '@repo/types'
import { PERMISSIONS } from '@repo/shared'
import { commonTimeRender, createStatusRender } from '@/utils'

/** 集维度列表列：集编码 / 集名称 / 状态 / 值数量 / 创建时间 */
export function getValueSetGroupColumns({
  onViewDetail,
  onStatusChange,
  refreshList,
}: {
  onViewDetail: (record: Backend.ValueSetGroupPageRespDto) => void
  onStatusChange: (record: Backend.ValueSetGroupPageRespDto, newStatus: number) => Promise<unknown>
  refreshList: () => void
}): SmartColumnType<Backend.ValueSetGroupPageRespDto>[] {
  return [
    {
      title: '集编码',
      dataIndex: 'setCode',
      key: 'setCode',
      width: 160,
      ellipsis: true,
      link: {
        onClick: (record: Backend.ValueSetGroupPageRespDto) => {
          onViewDetail(record)
        },
      },
    },
    {
      title: '集名称',
      dataIndex: 'setName',
      key: 'setName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: createStatusRender<Backend.ValueSetGroupPageRespDto, number>({
        onStatusChange,
        refreshList,
        permission: [PERMISSIONS.SYS_VALUE_SET_LIST_EDIT],
      }),
    },
    {
      title: '值数量',
      dataIndex: 'valueCount',
      key: 'valueCount',
      width: 100,
      render: (value: number) => value ?? 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: commonTimeRender,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: commonTimeRender,
    },
  ]
}

/** 集下「值」列表列（详情页使用，沿用现有值状态） */
interface GetValueSetValueColumnsParams {
  onStatusChange: (record: Backend.ValueSetPageRespDto, newStatus: number) => Promise<unknown>
  refreshList: () => Promise<void>
}

export function getValueSetValueColumns({
  onStatusChange,
  refreshList,
}: GetValueSetValueColumnsParams): SmartColumnType<Backend.ValueSetPageRespDto>[] {
  return [
    {
      title: '值编码',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      ellipsis: true,
    },
    {
      title: '值名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      ellipsis: true,
    },
    {
      title: '排序号',
      dataIndex: 'sortNumber',
      key: 'sortNumber',
      width: 90,
      render: (value: number) => value ?? 0,
    },
    {
      title: '集编码',
      dataIndex: 'setCode',
      key: 'setCode',
      width: 160,
      ellipsis: true,
    },
    {
      title: '集名称',
      dataIndex: 'setName',
      key: 'setName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: createStatusRender<Backend.ValueSetPageRespDto, number>({
        onStatusChange,
        refreshList,
        permission: [PERMISSIONS.SYS_VALUE_SET_LIST_EDIT],
      }),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: commonTimeRender,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: commonTimeRender,
    },
  ]
}
