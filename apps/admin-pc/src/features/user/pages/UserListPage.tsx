import { PageLayout } from "@/components/PageLayout";
import TableRender, { ProColumnsType } from "table-render";
import userApi from "../api/user";
import { transPaginateParams } from "@/utils";
import type { SchemaBase } from "form-render";
import { FromSchema } from 'json-schema-to-ts';

export function UserListPage() {
  const schema = {
    type: 'object',
    labelWidth: 80,
    properties: {
      userName: {
        title: '用户名',
        type: 'string',
      }
    }
  } as const satisfies SchemaBase
  const defaultParams = {orgId: localStorage.getItem('orgId')}
  type Params = FromSchema<typeof schema>
  const requestUserPage = async (params: Params) => {
    const res = await userApi.page(transPaginateParams({...defaultParams, ...params}))
    return {
      data: res.data.list,
      total: res.data.total
    }
  }
  const columns: ProColumnsType = [
    {
      title: 'id',
      dataIndex: 'id',
      valueType: 'text',
    },
    {
      title: 'userName',
      dataIndex: 'userName',
      valueType: 'text',
    },
  ]
  return (<PageLayout>
    <TableRender
      search={{schema}}
      request={requestUserPage}
      columns={columns}
    ></TableRender>
  </PageLayout>)
}