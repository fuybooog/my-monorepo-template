import React, { useMemo, useEffect, useState } from 'react'
import { Button, Col, ColProps, Form, FormInstance, Input, Row, RowProps, Space } from 'antd'
import dayjs from 'dayjs'
import {
  RenderParams,
  SmartFormExtraProps,
  SmartFormItem,
  SmartFormMode,
  SmartFormProps,
  SmartSchema,
} from './smart-types'
import { ValueSetViewer } from '../value-set-select/ValueSetViewer'

// ==========================================
// 1. Custom Hooks
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
  useEffect(() => {
    if (!syncUrlParams || mode !== 'query') return

    const searchParams = new URLSearchParams(window.location.search)
    const urlFields: Record<string, string> = {}

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

/** 自动提交处理逻辑 */
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

    Object.entries(schema).forEach(([key, item]) => {
      if (item.dependencyField && item.hideWhen !== undefined) {
        const depValue = allValues[item.dependencyField]
        const hide = Array.isArray(item.hideWhen)
          ? item.hideWhen.some((v) => v === depValue)
          : depValue === item.hideWhen
        if (hide) {
          const currentVal = form.getFieldValue(key)
          if (currentVal !== undefined && currentVal !== null) {
            form.setFieldValue(key, undefined)
          }
        }
      }
    })

    if (mode !== 'query' || !autoSubmit) return

    const changedKey = Object.keys(changedValues)[0]
    if (!changedKey) return

    const itemSchema = schema[changedKey]
    if (!itemSchema) return

    const widgetName = itemSchema.widget?.displayName || itemSchema.widget?.name || 'Input'

    const isSelectOrPicker =
      /select|picker|radio|checkbox|cascader/i.test(widgetName) ||
      'options' in (itemSchema.props || {}) ||
      dayjs.isDayjs(changedValues[changedKey])

    if (isSelectOrPicker) {
      form.submit()
    }

    const isInputWidget = /input/i.test(widgetName)
    const isCleared = changedValues[changedKey] === undefined || changedValues[changedKey] === ''

    if (isInputWidget && isCleared) {
      form.submit()
    }
  }
}

// ==========================================
// 2. 细粒度组件
// ==========================================

/** 渲染控件的基础属性解析 Hook */
const useWidgetProps = (item: SmartFormItem, itemKey: string, grid: boolean | RowProps) => {
  return useMemo(() => {
    let defaultProps: Record<string, unknown> = {}
    const WidgetComponent = item.widget || Input

    if (
      ['Input', 'Select', 'Cascader', 'DatePicker', 'TreeSelect'].some(
        (name) => name === WidgetComponent?.displayName,
      )
    ) {
      defaultProps = { ...defaultProps, allowClear: true }
    }
    if (grid) {
      defaultProps = {
        ...defaultProps,
        style: { width: '100%' },
      }
    }
    let options = item.props?.options
    if (options && options.length) {
      if ('id' in options[0] && 'name' in options[0]) {
        options = options.map((optionItem: any) => ({
          ...optionItem,
          label: optionItem.name,
          value: optionItem.id,
        }))
      }
    }

    if (WidgetComponent?.displayName === 'Input') {
      defaultProps = {
        ...defaultProps,
        placeholder: typeof item.title === 'string' ? `请输入${item.title}` : undefined,
        autoComplete: 'off',
        allowClear: true,
      }
    } else if (WidgetComponent?.displayName === 'Select') {
      defaultProps = {
        ...defaultProps,
        ...(typeof item.title === 'string' ? { placeholder: item.title } : {}),
      }
    }

    const valueSetDefault: { actualNameField?: string | boolean } = {}
    if (WidgetComponent?.displayName === 'ValueSetSelect') {
      if (item.props.actualNameField && typeof item.props.actualNameField === 'string') {
        valueSetDefault.actualNameField = item.props.actualNameField
      } else if (item.props.actualNameField !== false) {
        valueSetDefault.actualNameField = `${itemKey}Name`
      }
    }

    return {
      ...defaultProps,
      ...(item.props as Record<string, unknown>),
      ...valueSetDefault,
      ...(options && options.length ? { options } : {}),
    }
  }, [item, itemKey, grid])
}

/** 辅助函数：从对象中提取展示用的 label */
const getItemLabel = (
  obj: Record<string, string | number | boolean>,
  fieldNames?: { label?: string; value?: string },
) => {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  const labelKey = fieldNames?.label || 'label'
  return obj[labelKey] ?? obj.name ?? obj.label ?? obj.title ?? obj.code ?? JSON.stringify(obj)
}

/** 强化版 View 模式值转换工具 */
const formatViewValue = (
  itemKey: string,
  val: any,
  item: SmartFormItem,
  allValues: Record<string, any> = {},
): React.ReactNode => {
  // 1. 空值兜底
  if (val === undefined || val === null || val === '') {
    return '-'
  }

  const { props = {} } = item
  const fieldNames = props.fieldNames

  // =========================================================
  // 处理情况一：值为对象或对象数组 { id: 1, name: '张三' }
  // =========================================================
  if (typeof val === 'object' && !dayjs.isDayjs(val)) {
    // 多选对象数组 [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
    if (Array.isArray(val)) {
      if (val.length === 0) return '-'
      return val.map((item) => getItemLabel(item, fieldNames)).join(', ')
    }
    // 单选对象 { id: 1, name: '张三' }
    return getItemLabel(val, fieldNames)
  }

  // =========================================================
  // 处理情况二：针对 ValueSetSelect 等异步组件的自动 Name 匹配
  // 规则：如果字段叫 roleCode，优先尝试从 allValues 中获取 roleCodeName / roleCodeText
  // =========================================================
  if (typeof itemKey === 'string') {
    const autoNameKeys = [`${itemKey}Name`, `${itemKey}Text`, `${itemKey}_name`]
    for (const key of autoNameKeys) {
      if (allValues[key] !== undefined && allValues[key] !== null) {
        return String(allValues[key])
      }
    }
  }

  // =========================================================
  // 处理常规配置了静态 props.options / props.treeData 的组件
  // =========================================================
  const options = (props.options || props.treeData) as Array<Record<string, any>> | undefined

  if (options && Array.isArray(options)) {
    const valueKey = fieldNames?.value || 'value'
    const valArray = Array.isArray(val)
      ? val
      : typeof val === 'string' && val.includes(',')
        ? val.split(',')
        : [val]

    const matchedLabels = valArray
      .map((targetVal) => {
        const matched = options.find(
          (opt) => String(opt[valueKey] ?? opt.id ?? opt.code) === String(targetVal),
        )
        return matched ? getItemLabel(matched, fieldNames) : targetVal
      })
      .filter((v) => v !== undefined && v !== null)

    return matchedLabels.length > 0 ? matchedLabels.join(', ') : '-'
  }

  // 基础类型兜底直接输出字符串
  return String(val)
}

const RenderCustomField: React.FC<
  {
    renderFn: (props: RenderParams) => React.ReactNode
  } & RenderParams
> = ({ renderFn, form, value, onChange }) => {
  return <>{renderFn({ value, onChange, form })}</>
}

const SmartFormItemField: React.FC<{
  itemKey: string
  item: SmartFormItem
  mode: SmartFormMode
  form: FormInstance
  grid: boolean | RowProps
  dynamicRules?: any[]
}> = ({ itemKey, item, mode, form, grid, dynamicRules }) => {
  const mergedProps = useWidgetProps(item, itemKey, grid)
  const WidgetComponent = item.widget || Input

  const mergeRules = useMemo(() => {
    const baseRules = item.itemProps?.rules || []
    if (dynamicRules && dynamicRules.length) {
      return [...baseRules, ...dynamicRules]
    }
    return baseRules
  }, [item.itemProps?.rules, dynamicRules])

  if (item.hiddenModes?.includes(mode)) return null

  // ==========================================
  // 1. view 模式
  // ==========================================
  if (mode === 'view') {
    return (
      // ⚠️ 关键点：外层 Form.Item 绝对不能传 name 属性！
      <Form.Item key={itemKey} label={item.title} {...item.itemProps}>
        {/* 内层 Form.Item 加 shouldUpdate，保证 setFieldsValue 时精准重新渲染 */}
        <Form.Item noStyle shouldUpdate>
          {() => {
            // 注意 shouldUpdate 内必须是函数子元素 直接通过传入的 form 实例实时获取最新的值
            const val = form.getFieldValue(itemKey)

            if (item.viewRender) {
              return item.viewRender(val, form.getFieldsValue())
            }
            if (WidgetComponent.displayName === 'ValueSetSelect' && item.props?.setCode) {
              return <ValueSetViewer setCode={item.props.setCode} value={val} />
            }
            if (WidgetComponent.displayName === 'DatePicker' && val) {
              const formatPattern = item.props?.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'

              const displayVal = dayjs.isDayjs(val)
                ? val.format(formatPattern)
                : dayjs(val).format(formatPattern)

              return <span>{displayVal}</span>
            }
            return <span>{formatViewValue(itemKey, val, item, form.getFieldsValue())}</span>
          }}
        </Form.Item>
      </Form.Item>
    )
  }

  // ==========================================
  // 2. edit / create / query 模式
  // ==========================================

  return (
    <>
      {mergedProps.actualNameField && mode !== 'query' && (
        <Form.Item name={mergedProps.actualNameField} hidden style={{ display: 'none' }}>
          <Input hidden />
        </Form.Item>
      )}
      <Form.Item
        key={itemKey}
        name={itemKey}
        label={item.title}
        {...item.itemProps}
        rules={mergeRules}
      >
        {item.render ? (
          <RenderCustomField renderFn={item.render} form={form} />
        ) : WidgetComponent ? (
          <WidgetComponent {...mergedProps} />
        ) : null}
      </Form.Item>
    </>
  )
}

/** 操作按钮组组件 */
const FormActions: React.FC<{
  mode: SmartFormMode
  form: FormInstance
  grid: boolean | RowProps
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
  loading?: boolean
  noSubmit?: boolean
  buttonDisabled?: boolean
  handleCancel?: () => void
}> = ({
  mode,
  form,
  actionRender,
  children,
  grid,
  loading,
  noSubmit,
  buttonDisabled,
  handleCancel,
}) => {
  if (noSubmit) return null
  if (children) return <>{children}</>
  if (actionRender) return <>{actionRender(form, mode)}</>

  if (mode === 'query') {
    return (
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} disabled={buttonDisabled}>
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
  const buttonsRender = () => {
    return (
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {handleCancel && <Button onClick={() => handleCancel()}>取消</Button>}
          <Button onClick={() => form.resetFields()}>重置</Button>
          <Button type="primary" htmlType="submit" loading={loading} disabled={buttonDisabled}>
            提交
          </Button>
        </Space>
      </Form.Item>
    )
  }

  if (mode === 'create' || mode === 'edit') {
    if (grid) {
      return <Col span={24}>{buttonsRender()}</Col>
    }
    return buttonsRender()
  }

  return null
}

// ==========================================
// 3. 主组件及内容组件
// ==========================================

const SmartFormContent: React.FC<{
  schema: SmartSchema
  mode: SmartFormMode
  form: FormInstance
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
  grid?: boolean | RowProps
  colProps: ColProps
  loading?: boolean
  buttonDisabled?: boolean
  noSubmit?: boolean
  handleCancel?: () => void
}> = ({
  schema,
  mode,
  actionRender,
  children,
  form,
  grid = false,
  colProps,
  loading,
  noSubmit,
  buttonDisabled,
  handleCancel,
}) => {
  const renderField = (key: string, item: SmartFormItem) => {
    const hasDependency =
      item.dependencyField && (item.hideWhen !== undefined || item.requiredWhen !== undefined)
    const colSpan = item.colProps || colProps

    const renderFieldContent = (dynamicRules?: any[]) => {
      const fieldElement = (
        <SmartFormItemField
          key={key}
          itemKey={key}
          item={item}
          mode={mode}
          form={form}
          grid={grid}
          dynamicRules={dynamicRules}
        />
      )
      return grid ? (
        <Col key={key} {...colSpan}>
          {fieldElement}
        </Col>
      ) : (
        fieldElement
      )
    }

    // 无依赖：直接渲染，不包裹 shouldUpdate
    if (!hasDependency) {
      return renderFieldContent()
    }

    // 有依赖：用 shouldUpdate 包裹，仅当依赖变化时重新渲染
    return (
      <Form.Item
        key={key}
        noStyle
        shouldUpdate={(prev, cur) => {
          // 当任意一个依赖字段的值发生变化时返回 true
          return prev[item.dependencyField!] !== cur[item.dependencyField!]
        }}
      >
        {() => {
          // 检查是否应该隐藏
          const depValue = form.getFieldValue(item.dependencyField) // 假设只取第一个
          let hide
          if (depValue === undefined || depValue === null) {
            hide = true
          } else if (Array.isArray(item.hideWhen)) {
            hide = item.hideWhen.some((val) => val === depValue)
          } else {
            hide = depValue === item.hideWhen || depValue === undefined || depValue === null
          }

          if (hide) {
            return null // 不渲染 Col
          }
          let required = false
          if (item.requiredWhen !== undefined) {
            if (Array.isArray(item.requiredWhen)) {
              required = item.requiredWhen.some((v) => v === depValue)
            } else {
              required = depValue === item.requiredWhen
            }
          }
          const dynamicRules = required ? [{ required: true, message: '必填项不能为空' }] : []

          return renderFieldContent(dynamicRules)
        }}
      </Form.Item>
    )
  }

  return (
    <>
      {Object.entries(schema).map(([key, item]) => {
        if (item.hiddenModes?.includes(mode)) return null
        return renderField(key, item)
      })}
      <FormActions
        mode={mode}
        form={form}
        actionRender={actionRender}
        grid={grid}
        loading={loading}
        noSubmit={noSubmit}
        buttonDisabled={buttonDisabled}
        handleCancel={handleCancel}
      >
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
  grid = false,
  labelWidth = 100,
  colProps = { span: 12 },
  handleCancel,
  noSubmit = false,
  ...restFormProps
}) => {
  const [internalForm] = Form.useForm()
  const activeForm = form || internalForm
  const [submitting, setSubmitting] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const rowProp = typeof grid === 'object' ? grid : { gutter: 16 }
  const formattedLabelWidth = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth
  const defaultProps = {
    labelAlign: restFormProps.labelAlign || (mode === 'query' ? 'left' : 'right'),
    layout: layout || (mode === 'query' ? 'inline' : 'horizontal'),
    ...(mode !== 'query'
      ? {
          labelCol: { flex: `0 0 ${formattedLabelWidth}` },
          wrapperCol: { flex: '1' },
        }
      : {}),
  }

  // 副作用 Hook
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

  const renderContent = () => (
    <SmartFormContent
      schema={schema}
      mode={mode}
      actionRender={actionRender}
      form={activeForm}
      grid={grid}
      colProps={colProps}
      loading={submitting}
      buttonDisabled={disabled}
      handleCancel={handleCancel}
      noSubmit={noSubmit}
    >
      {children}
    </SmartFormContent>
  )

  const formContent = () => {
    return grid ? <Row {...rowProp}>{renderContent()}</Row> : renderContent()
  }
  const handleFinish = async (values: any) => {
    if (submitting) return
    if (disabled) return
    if (restFormProps.onFinish) {
      setSubmitting(true)
      setDisabled(true)
      setTimeout(() => {
        setDisabled(false)
      }, 2000)
      try {
        await restFormProps.onFinish(values)
      } catch (error) {
        console.error('表单提交错误', error)
      } finally {
        setSubmitting(false)
      }
    }
  }
  const handleFinishFailed = (errorInfo: any) => {
    if (restFormProps.onFinishFailed) {
      restFormProps.onFinishFailed(errorInfo)
    }
    setSubmitting(false)
  }
  return (
    <Form
      form={activeForm}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      {...defaultProps}
      {...restFormProps}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      {formContent()}
    </Form>
  )
}
