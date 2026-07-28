import React, { useEffect, useState } from 'react'
import { Form, Spin, message } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { serializeFormValues } from '@/components/common/smart-utils'
import userApi from '../api/user'
import { Backend } from '@repo/types'
import { userFormSchema } from '../model'
import { transformDateFieldsValue } from '@/utils/fns'

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
            console.log('触发 setFieldsValue')
            form.setFieldsValue(transformResData2Form(res.data))
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

  /**
   * 将接口返回结果转化为表单
   * @param resData
   * @returns
   */
  const transformResData2Form = (resData: Backend.UserRespDto) => {
    const formData = transformDateFieldsValue(resData, ['birth'])
    if (formData.address) {
      try {
        formData.address = JSON.parse(formData.address as string)
      } catch (e) {
        console.error('address 转换错误')
      }
    }
    return formData
  }

  /**
   * 将表单数据转化为请求入参
   * @param values
   * @returns
   */
  const transformForm2Params = (values: Backend.UserRespDto) => {
    // 转化日期格式
    const params = serializeFormValues(values, dynamicSchema)
    // 将 params中的地址进行格式化
    if (params.address) {
      params.address = JSON.stringify(params.address)
    }
    return params
  }

  const handleFinish = async (values: Backend.UserRespDto) => {
    const cleanParams = transformForm2Params(values)

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
        onFinish={handleFinish}
        grid={true}
      />
    </Spin>
  )
}
