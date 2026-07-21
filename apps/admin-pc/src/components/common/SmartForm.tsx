import React, { useMemo } from 'react'
import { Button, Form, FormInstance, Space } from 'antd'
import dayjs from 'dayjs'
import {
  SmartFormExtraProps,
  SmartFormItem,
  SmartFormMode,
  SmartFormProps,
  SmartSchema,
} from './smart-types'

// ==========================================
// 1. Custom Hooks 拆分
// ==========================================

/** 响应 URL 参数同步逻辑 */
const useUrlParamsSync = ({
  syncUrlParams,
  mode,
  schema,
  form,
  urlParamsTransform,
}: {
  syncUrlParams?: boolean
  mode: SmartFormMode
  schema: SmartSchema
  form: FormInstance
  urlParamsTransform?: SmartFormProps['urlParamsTransform']
}) => {
  React.useEffect(() => {
    if (!syncUrlParams || mode !== 'query') return

    const searchParams = new URLSearchParams(window.location.search)
    const urlFields: Record<string, unknown> = {}

    Object.keys(schema).forEach((key) => {
      const val = searchParams.get(key)
      if (val !== null) {
        urlFields[key] = val
      }
    })

    if (Object.keys(urlFields).length > 0) {
      const finalFields = urlParamsTransform ? urlParamsTransform(urlFields) : urlFields
      form.setFieldsValue(finalFields)
      form.submit()
    }
  }, [syncUrlParams, schema, form, mode, urlParamsTransform])
}

/** 自动提交判断逻辑 */
const useAutoSubmitHandler = ({
  mode,
  autoSubmit,
  schema,
  form,
  onValuesChange,
}: {
  mode: SmartFormMode
  autoSubmit?: boolean
  schema: SmartSchema
  form: FormInstance
  onValuesChange?: SmartFormProps['onValuesChange']
}) => {
  return (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    onValuesChange?.(changedValues, allValues)

    if (mode !== 'query' || !autoSubmit) return

    const changedKey = Object.keys(changedValues)[0]
    if (!changedKey) return

    const itemSchema = schema[changedKey]
    if (!itemSchema) return

    const val = changedValues[changedKey]
    const widgetName = itemSchema.widget?.displayName || itemSchema.widget?.name || ''

    const isSelectOrPicker =
      /select|picker|radio|checkbox|cascader/i.test(widgetName) ||
      'options' in (itemSchema.props || {}) ||
      dayjs.isDayjs(val)

    const isInputCleared = /input/i.test(widgetName) && (val === undefined || val === '')

    if (isSelectOrPicker || isInputCleared) {
      form.submit()
    }
  }
}

// ==========================================
// 2. 细粒度渲染组件
// ==========================================

/** 针对编辑/新建模式下渲染控件的解析 Hook */
const useWidgetProps = (item: SmartFormItem) => {
  return useMemo(() => {
    const defaultProps: Record<string, unknown> = { allowClear: true }
    const displayName = item.widget?.displayName

    if (displayName === 'Input') {
      defaultProps.placeholder = typeof item.title === 'string' ? `请输入${item.title}` : undefined
      defaultProps.autoComplete = 'off'
    } else if (displayName === 'Select') {
      defaultProps.placeholder = typeof item.title === 'string' ? item.title : undefined
      defaultProps.fieldNames = { value: 'id', label: 'name' }
      defaultProps.style = { width: 80 }
    }

    return { ...defaultProps, ...item.props }
  }, [item])
}

/** 单个表单项渲染组件 */
const FormItemWidget: React.FC<{
  itemKey: string
  item: SmartFormItem
  mode: SmartFormMode
  form: FormInstance
}> = ({ itemKey, item, mode, form }) => {
  const mergedProps = useWidgetProps(item)
  const WidgetComponent = item.widget

  // 1. 详情/查看模式
  if (mode === 'view') {
    return (
      <Form.Item name={itemKey} noStyle>
        {({ getFieldValue }) => {
          const val = getFieldValue(itemKey)
          if (item.viewRender) {
            return item.viewRender(val, form.getFieldsValue())
          }
          if (item.widget?.displayName === 'Select' && item.props?.options) {
            const matched = (item.props.options as Array<Record<string, unknown>>)?.find(
              (opt) => opt.id === val,
            )
            return <span>{matched ? String(matched.name) : (val ?? '-')}</span>
          }
          return <span>{val !== undefined && val !== null ? String(val) : '-'}</span>
        }}
      </Form.Item>
    )
  }

  // 2. 自定义 render 逻辑
  if (item.render) {
    return <>{item.render(form)}</>
  }

  // 3. 基础 Widget 渲染
  return WidgetComponent ? <WidgetComponent {...mergedProps} /> : null
}

/** 操作按钮区域渲染组件 */
const FormActions: React.FC<{
  mode: SmartFormMode
  form: FormInstance
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
}> = ({ mode, form, actionRender, children }) => {
  if (children) return <>{children}</>
  if (actionRender) return <>{actionRender(form, mode)}</>

  if (mode === 'query') {
    return (
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button
            onClick={() => {
              form.resetFields()
              form.submit()
            }}
          >
            重置
          </Button>
        </Space>
      </Form.Item>
    )
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => form.resetFields()}>重置</Button>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Space>
      </Form.Item>
    )
  }

  return null
}

// ==========================================
// 3. 主组件与内容组件
// ==========================================

const SmartFormContent: React.FC<{
  schema: SmartSchema
  mode: SmartFormMode
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
}> = ({ schema, mode, actionRender, children }) => {
  const formInstance = Form.useFormInstance()

  return (
    <>
      {Object.entries(schema).map(([key, item]) => {
        if (item.hiddenModes?.includes(mode)) return null

        return (
          <Form.Item key={key} name={key} label={item.title} {...item.itemProps}>
            <FormItemWidget itemKey={key} item={item} mode={mode} form={formInstance} />
          </Form.Item>
        )
      })}

      <FormActions mode={mode} form={formInstance} actionRender={actionRender}>
        {children}
      </FormActions>
    </>
  )
}

export const SmartForm: React.FC<SmartFormProps> = ({
  schema,
  mode = 'query',
  actionRender,
  children,
  layout,
  form,
  syncUrlParams = false,
  urlParamsTransform,
  initialValues,
  autoSubmit = true,
  onValuesChange,
  ...restFormProps
}) => {
  const [internalForm] = Form.useForm()
  const activeForm = form || internalForm
  const defaultLayout = layout || (mode === 'query' ? 'inline' : 'horizontal')

  // 使用拆分后的 Hook 隔离复杂副作用
  useUrlParamsSync({
    syncUrlParams,
    mode,
    schema,
    form: activeForm,
    urlParamsTransform,
  })

  const handleValuesChange = useAutoSubmitHandler({
    mode,
    autoSubmit,
    schema,
    form: activeForm,
    onValuesChange,
  })

  return (
    <Form
      form={activeForm}
      layout={defaultLayout}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      {...restFormProps}
    >
      <SmartFormContent schema={schema} mode={mode} actionRender={actionRender}>
        {children}
      </SmartFormContent>
    </Form>
  )
}
