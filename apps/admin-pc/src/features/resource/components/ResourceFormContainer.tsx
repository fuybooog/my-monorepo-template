import React, { useCallback, useEffect, useMemo } from 'react'
import { Form } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { serializeFormValues } from '@/components/common/smart-utils'
import userApi from '../api/resource'
import { Backend } from '@repo/types'
import { getResourceFormSchema } from '../model'
import { getMessage } from '@/utils/antd-instance'
import { ResourcePageRespDto } from '../types'
import { typeList } from '../model/model'

interface ResourceFormContainerProps {
  drawerData?: ResourcePageRespDto
  mode: SmartFormEditMode
  defaultValue?: ResourcePageRespDto
  formType?: string
  sameLevelList?: ResourcePageRespDto[]
  closeDrawer: () => void
  onSuccess: () => void
}

export const ResourceFormContainer: React.FC<ResourceFormContainerProps> = ({
  drawerData,
  mode,
  formType,
  sameLevelList,
  closeDrawer,
  onSuccess,
}) => {
  const [form] = Form.useForm()

  const dynamicSchema = useMemo(() => {
    let filterdOptions = [...typeList]
    const schema = getResourceFormSchema()
    if (formType === 'createSub' && drawerData) {
      const parentType = drawerData.type
      let allowedTypes: string[] = []
      if (parentType === '0') {
        allowedTypes = ['0', '1']
      } else if (parentType === '1') {
        allowedTypes = ['2', '3']
      } else {
        allowedTypes = []
      }
      filterdOptions = typeList.filter((typeItem) => allowedTypes.includes(typeItem.id))
    } else if (formType === 'createLast' || formType === 'createPrev' || formType === 'copyPrev') {
      filterdOptions = typeList.filter((typeItem) => ['0', '1'].includes(typeItem.id))
    }
    schema.type = {
      ...schema.type,
      props: {
        ...schema.type.props,
        options: filterdOptions,
        disabled: mode === 'edit',
      },
    }
    return schema
  }, [formType, drawerData, mode])

  /**
   * 将接口返回结果转化为表单
   * @param resData
   * @returns
   */
  const transformResData2Form = useCallback((resData: ResourcePageRespDto) => {
    const formData = { ...resData }
    formData.notInMenu = resData.notInMenu === '1' ? '1' : '0'
    return formData
  }, [])

  // 1. 顶层直接计算派生值（不需要 useState，也不需要在 effect 里 setInitialValues）
  const initialValues = useMemo(() => {
    if (drawerData) {
      const { children, buttons, columns, ...restData } = drawerData
      if (mode === 'edit' || formType === 'copyPrev') {
        return transformResData2Form(restData)
      }
      if (formType === 'createSub') {
        return {
          notInMenu: '0',
          parentUniqueProp: restData.uniqueProp,
        }
      }
      if (formType === 'createPrev') {
        return {
          notInMenu: '0',
          parentUniqueProp: restData.parentUniqueProp,
        }
      }
    } else if (formType === 'createLast') {
      return {
        notInMenu: '0',
        parentUniqueProp: '',
      }
    }
    return undefined
  }, [drawerData, mode, formType, transformResData2Form])

  // 2. useEffect 只负责与 Form（外部系统/DOM）同步
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [initialValues, form])

  /**
   * 将表单数据转化为请求入参
   * @param values
   * @returns
   */
  const transformForm2Params = (values: ResourcePageRespDto) => {
    // 转化日期格式
    const params = serializeFormValues(values, dynamicSchema)
    // 将 params中的地址进行格式化
    if (params.address) {
      params.address = JSON.stringify(params.address)
    }
    return params
  }

  const handleFinish = async (values: ResourcePageRespDto) => {
    const cleanParams = transformForm2Params(values)
    try {
      if (formType === 'createLast' || formType === 'createSub') {
        await userApi.create({
          ...cleanParams,
          sortNumber: (sameLevelList?.length ?? 0) + 1,
          status: '1',
        } as Backend.ResourceCreateDto)
        getMessage().success('创建资源成功')
      } else if (formType === 'edit') {
        await userApi.update(drawerData!.id!, cleanParams as Backend.ResourceUpdateDto)
        getMessage().success('更新资源成功')
      } else if (formType === 'createPrev' || formType === 'copyPrev') {
        let index = 0
        let rest: Backend.ResourcePartialDto[] = []
        if (sameLevelList?.length) {
          index = sameLevelList?.findIndex((item) => item.uniqueProp === drawerData?.uniqueProp)
          rest =
            sameLevelList
              ?.slice(index)
              .map((item) => ({ id: item.id, sortNumber: item.sortNumber! + 1 })) || []
        }
        const paramList: Backend.ResourcePartialDto[] = [
          { ...cleanParams, sortNumber: index + 1 },
          ...rest,
        ]
        await userApi.batchUpdate({ list: paramList })
      }
      onSuccess()
    } catch (e) {
      console.error('表单提交失败', e)
    }
  }

  return (
    <SmartForm
      form={form}
      initialValues={initialValues}
      schema={dynamicSchema}
      mode={mode}
      onFinish={handleFinish}
      grid={true}
      handleCancel={closeDrawer}
    />
  )
}
