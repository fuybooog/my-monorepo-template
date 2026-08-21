import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [initialValues, setInitialValues] = useState<
    Omit<Backend.RoleRespDto, 'userIds' | 'resourceIds'> & {
      resourceIds: number[]
      userIds: number[]
    }
  >()
  const dynamicSchema = useMemo(() => {
    const schema = getRoleFormSchema()
    // 编辑时，角色编码禁止编辑
    if (mode === 'edit') {
      schema.roleCode = {
        ...schema.roleCode,
        props: {
          ...schema.roleCode.props,
          disabled: true,
        },
      }
    }
    return schema
  }, [])

  const transformResData2Form = useCallback(
    (data: Backend.RoleRespDto) => {
      const formData = filterObjectKeys(data, Object.keys(dynamicSchema)) as Backend.RoleRespDto
      return {
        ...formData,
        resourceIds: formData.resourceIds
          ? formData.resourceIds.split(',').map((id) => Number(id))
          : [],
        userIds: formData.userIds ? formData.userIds.split(',').map((id) => Number(id)) : [],
      }
    },
    [dynamicSchema],
  )

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if ((mode === 'edit' || mode === 'view') && drawerData?.id) {
        setLoading(true)
        try {
          const res = await roleApi.findById(drawerData.id)
          if (isMounted) {
            const tempInitialValues = transformResData2Form(res.data)
            setInitialValues(tempInitialValues)
            form.setFieldsValue(tempInitialValues)
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
  }, [drawerData, mode, form, transformResData2Form])

  /**
   * 将表单数据转化为请求入参
   * @param values
   * @returns
   */
  const transformForm2Params = (values: Backend.RoleRespDto) => {
    // 转化日期格式
    const params = serializeFormValues(values, dynamicSchema)
    // 将 params中的地址进行格式化
    if (params.userIds) {
      params.userIds = params.userIds.join()
    }
    if (params.resourceIds) {
      params.resourceIds = params.resourceIds.join()
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
        initialValues={initialValues}
        schema={dynamicSchema}
        mode={mode}
        onFinish={handleFinish}
        grid={true}
      />
    </Spin>
  )
}
