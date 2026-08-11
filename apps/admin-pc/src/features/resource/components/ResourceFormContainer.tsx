import React, { useEffect, useState } from 'react'
import { Form, Spin } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { serializeFormValues } from '@/components/common/smart-utils'
import userApi from '../api/resource'
import { Backend } from '@repo/types'
import { getResourceFormSchema } from '../model'
import { transformDateFieldsValue } from '@/utils/fns'
import { getMessage } from '@/utils/antd-instance'

interface ResourceFormContainerProps {
  id?: string | number
  mode: SmartFormEditMode
  isSub?: boolean
  defaultValue?: Backend.ResourceRespDto
  onSuccess: () => void
}

export const ResourceFormContainer: React.FC<ResourceFormContainerProps> = ({
  id,
  mode,
  isSub,
  defaultValue,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dynamicSchema] = useState(getResourceFormSchema())

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if ((mode === 'edit' || mode === 'view') && id) {
        setLoading(true)
        try {
          const res = await userApi.findById(id)
          if (isMounted) {
            form.setFieldsValue(transformResData2Form(res.data))
          }
        } finally {
          if (isMounted) setLoading(false)
        }
      } else {
        if (isMounted) {
          // 新增时，将是否隐藏设置为 '0'
          form.setFieldsValue({ notInMenu: '0' })
        }
      }
      if (isMounted) {
        if (defaultValue) {
          form.setFieldsValue(defaultValue)
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
  const transformResData2Form = (resData: Backend.ResourceRespDto) => {
    const formData = transformDateFieldsValue(resData, ['birth'])
    if (formData.address) {
      try {
        formData.address = JSON.parse(formData.address as string)
      } catch (e) {
        console.error('address 转换错误')
      }
    }
    formData.notInMenu = resData.notInMenu === '1' ? '1' : '0'
    return formData
  }

  /**
   * 将表单数据转化为请求入参
   * @param values
   * @returns
   */
  const transformForm2Params = (values: Backend.ResourceRespDto) => {
    // 转化日期格式
    const params = serializeFormValues(values, dynamicSchema)
    // 将 params中的地址进行格式化
    if (params.address) {
      params.address = JSON.stringify(params.address)
    }
    return params
  }

  const handleFinish = async (values: Backend.ResourceRespDto) => {
    const cleanParams = transformForm2Params(values)

    try {
      if (mode === 'create') {
        await userApi.create(cleanParams as Backend.ResourceCreateDto)
        getMessage().success('创建资源成功')
      } else if (mode === 'edit') {
        await userApi.update(id!, cleanParams as Backend.ResourceUpdateDto)
        getMessage().success('更新资源成功')
      }
      onSuccess()
    } catch (err) {
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
