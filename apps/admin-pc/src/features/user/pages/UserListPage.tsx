import { useState } from 'react'
import { Form, Input } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartSchema } from '@/components/common'
import userApi from '../api/user'
import { commonStatusRender, commonTimeRender } from '@/utils'
import { Backend } from '@repo/types'

export function UserListPage() {
  const [form] = Form.useForm()

  const [searchParams, setSearchParams] = useState<Backend.UserPageDto>({})

  const handleFetchData = async (params: Backend.UserPageDto) => {
    const res = await userApi.page({
      ...params,
    })
    return {
      data: res.data.list,
      total: res.data.total,
    }
  }

  const columns = [
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
      alignment: 'center',
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
      render: (text: string, record: Record<string, unknown>) => {
        const detail = record.addressDetail || ''
        return `${text || ''}${detail ? ` - ${detail}` : ''}` || '-'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: commonStatusRender,
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

  const triggerSearch = () => {
    setSearchParams(form.getFieldsValue())
  }

  const schema: SmartSchema = {
    userName: {
      title: '用户名',
      widget: Input,
      props: {
        // 默认是true，可以用false覆盖
        // allowClear: false,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.value) triggerSearch()
        },
      },
    },
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={schema}
        layout="inline"
        onFinish={triggerSearch}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.UserPageRespDto>
        searchParams={searchParams}
        request={handleFetchData}
        columns={columns}
      />
    </PageLayout>
  )
}
