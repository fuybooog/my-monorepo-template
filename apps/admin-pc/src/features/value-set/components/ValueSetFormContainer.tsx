import { useEffect, useMemo, useState } from 'react'
import { Form } from 'antd'
import { SmartForm, SmartFormEditMode } from '@/components/common'
import { Backend } from '@repo/types'
import valueSetApi from '../api/value-set'
import { valueSetFormSchema } from '../model'
import { getMessage } from '@/utils/antd-instance'
import { SUCCESS_MESSAGE } from '@/constants'

interface ValueSetFormContainerProps {
  id?: number | null
  mode: SmartFormEditMode
  /** edit 模式下编辑目标：'set' 编辑集（仅集编码/名称），'value' 编辑单个值（值编码/名称/状态/排序号） */
  editTarget?: 'set' | 'value'
  closeDrawer: () => void
  onSuccess?: () => void
  /** 创建模式下的预填值（如从集详情页带入 setCode / setName） */
  presetValues?: Record<string, unknown>
}

export function ValueSetFormContainer({
  id,
  mode,
  editTarget = 'value',
  closeDrawer,
  onSuccess,
  presetValues,
}: ValueSetFormContainerProps) {
  const [form] = Form.useForm()
  const [editData, setEditData] = useState<Backend.ValueSetRespDto | null>(null)

  useEffect(() => {
    if (mode === 'edit' && id) {
      let cancelled = false
      valueSetApi.findById(id).then((res) => {
        if (cancelled) return
        // 回显取值兼容响应包裹：部分接口 data 可能为 { data } 结构
        const data = (res.data as { data?: Backend.ValueSetRespDto }).data ?? res.data
        setEditData(data ?? null)
      })
      return () => {
        cancelled = true
      }
    }
  }, [mode, id])

  // 编辑集：仅保留 setCode / setName；编辑值 / 新增：保留值字段 + 排序号
  const dynamicSchema = useMemo(() => {
    if (mode === 'edit' && editTarget === 'set') {
      const { code, name, status, sortNumber, ...rest } = valueSetFormSchema
      void code
      void name
      void status
      void sortNumber
      return rest
    }
    if (mode === 'edit' && editTarget === 'value') {
      const { setCode, setName, ...rest } = valueSetFormSchema
      void setCode
      void setName
      return rest
    }
    return valueSetFormSchema
  }, [mode, editTarget])

  const initialValues = useMemo(() => {
    if (mode === 'edit' && editData && editData.id === id) {
      if (editTarget === 'set') {
        return { setCode: editData.setCode, setName: editData.setName }
      }
      return {
        code: editData.code,
        name: editData.name,
        status: editData.status,
        sortNumber: editData.sortNumber,
      }
    }
    if (mode === 'create') {
      return { status: 1, ...presetValues }
    }
    return undefined
  }, [id, mode, editData, editTarget, presetValues])

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [initialValues, form])

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (mode === 'edit' && id) {
      if (editTarget === 'set') {
        // 编辑集：仅更新 setCode / setName
        await valueSetApi.update(id, {
          setCode: values.setCode,
          setName: values.setName,
        } as Backend.ValueSetUpdateDto)
        getMessage().success(SUCCESS_MESSAGE.VALUE_SET_UPDATE)
      } else {
        // 编辑值：提交完整值信息（setCode / setName 不在表单中展示，需从回显数据补齐，否则后端必填校验失败）
        await valueSetApi.update(id, {
          setCode: editData?.setCode,
          setName: editData?.setName,
          ...values,
        } as Backend.ValueSetUpdateDto)
        getMessage().success(SUCCESS_MESSAGE.VALUE_SET_UPDATE)
      }
    } else {
      // 新增：需同时创建一个值
      await valueSetApi.create(values as Backend.ValueSetCreateDto)
      getMessage().success(SUCCESS_MESSAGE.VALUE_SET_CREATE)
    }
    onSuccess?.()
  }

  return (
    <SmartForm
      form={form}
      schema={dynamicSchema}
      mode={mode}
      initialValues={initialValues}
      onFinish={handleSubmit}
      handleCancel={closeDrawer}
    />
  )
}
