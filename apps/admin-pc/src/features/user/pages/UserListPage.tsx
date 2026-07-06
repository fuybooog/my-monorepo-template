import { PageLayout } from '@/components/PageLayout'
import TableRender, { ProColumnsType } from 'table-render'
import userApi from '../api/user'
import { commonTimeRender, formatSortParams, transPaginateParams } from '@/utils'
import type { SchemaBase } from 'form-render'
import { FromSchema } from 'json-schema-to-ts'
import { SorterResult } from 'antd/es/table/interface'

export function UserListPage() {
  const schema = {
    type: 'object',
    labelWidth: 80,
    properties: {
      userName: {
        title: '用户名',
        type: 'string',
      },
    },
  } as const satisfies SchemaBase
  const defaultParams = { orgId: localStorage.getItem('orgId') }
  type Params = FromSchema<typeof schema>
  const requestUserPage = async (params: Params, sorter: SorterResult | SorterResult[]) => {
    const sortParams = formatSortParams(sorter)
    const res = await userApi.page(
      transPaginateParams({ ...defaultParams, ...params, ...sortParams }),
    )
    return {
      data: res.data.list,
      total: res.data.total,
    }
  }
  const columns: ProColumnsType = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      sorter: { multiple: 2 },
      valueType: 'text',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: { multiple: 2 },
      valueType: 'text',
      render: commonTimeRender,
    },
  ]
  return (
    <PageLayout>
      <TableRender search={{ schema }} request={requestUserPage} columns={columns}></TableRender>
    </PageLayout>
  )
}
