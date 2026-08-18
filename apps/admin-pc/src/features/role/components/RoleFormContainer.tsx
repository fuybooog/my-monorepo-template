import React, { useEffect, useState } from 'react'
import { Form, Spin } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { serializeFormValues } from '@/components/common/smart-utils'
import roleApi from '../api/role'
import { Backend } from '@repo/types'
import { getRoleFormSchema } from '../model'
import { getMessage } from '@/utils/antd-instance'
import { filterObjectKeys } from '@/utils/fns'

interface RoleFormContainerProps {
  drawerData?: Backend.RolePageRespDto
  mode: SmartFormEditMode
  onSuccess: () => void
}

export const RoleFormContainer: React.FC<RoleFormContainerProps> = ({
  drawerData,
  mode,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dynamicSchema] = useState(getRoleFormSchema())

  useEffect(() => {
    if (drawerData) {
      const result = filterObjectKeys(drawerData, Object.keys(dynamicSchema))
      form.setFieldsValue(result)
    }
  }, [drawerData, form, dynamicSchema])

  /**
   * 将表单数据转化为请求入参
   * @param values
   * @returns
   */
  const transformForm2Params = (values: Backend.RoleRespDto) => {
    // 转化日期格式
    const params = serializeFormValues(values, dynamicSchema)
    // 将 params中的地址进行格式化
    if (params.address) {
      params.address = JSON.stringify(params.address)
    }
    return params
  }

  const handleFinish = async (values: Backend.RoleRespDto) => {
    const cleanParams = transformForm2Params(values)

    try {
      setLoading(true)
      if (mode === 'create') {
        await roleApi.create(cleanParams as Backend.RoleCreateDto)
        getMessage().success('创建角色成功')
      } else if (mode === 'edit') {
        await roleApi.update(drawerData!.id!, cleanParams as Backend.RoleUpdateDto)
        getMessage().success('更新角色成功')
      }
      setLoading(false)
      onSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Spin spinning={loading}>
      <SmartForm
        form={form}
        initialValues={drawerData}
        schema={dynamicSchema}
        mode={mode}
        onFinish={handleFinish}
        grid={true}
      />
    </Spin>
  )
}
