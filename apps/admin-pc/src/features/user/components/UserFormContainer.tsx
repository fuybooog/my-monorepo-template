import React, { useEffect, useState } from 'react'
import { Form, Spin, message } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { serializeFormValues } from '@/components/common/smart-utils'
import userApi from '../api/user'
import { Backend } from '@repo/types'
import { userFormSchema } from '../model'

interface UserFormContainerProps {
  id?: string | number
  mode: SmartFormEditMode
  onSuccess: () => void
}

export const UserFormContainer: React.FC<UserFormContainerProps> = ({ id, mode, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dynamicSchema, setDynamicSchema] = useState(userFormSchema)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if ((mode === 'edit' || mode === 'view') && id) {
        setLoading(true)
        try {
          const res = await userApi.findById(id)
          if (isMounted) {
            form.setFieldsValue(transformValue(res.data))
          }
        } finally {
          if (isMounted) setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [id, mode, form])

  function transformValue(values: Backend.UserRespDto) {
    // todo 将日期转化为dayjs类型
    return values
  }

  const handleFinish = async (values: Backend.UserRespDto) => {
    const cleanParams = serializeFormValues(values, dynamicSchema)

    try {
      if (mode === 'create') {
        await userApi.create(cleanParams as Backend.UserCreateDto)
        message.success('创建用户成功')
      } else if (mode === 'edit') {
        await userApi.update(id!, cleanParams as Backend.UserUpdateDto)
        message.success('更新用户成功')
      }
      onSuccess()
    } catch (err) {
      message.error('保存失败')
      console.error(err)
    }
  }

  return (
    <Spin spinning={loading}>
      <SmartForm
        form={form}
        schema={dynamicSchema}
        mode={mode}
        autoSubmit={false}
        onFinish={handleFinish}
      />
    </Spin>
  )
}
