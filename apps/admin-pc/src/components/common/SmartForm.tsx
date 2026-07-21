import React, { useEffect } from 'react'
import { Button, Form, Space } from 'antd'
import { SmartFormExtraProps, SmartFormMode, SmartFormProps, SmartSchema } from './smart-types'
import dayjs from 'dayjs'

const SmartFormContent: React.FC<{
  schema: SmartSchema
  mode: SmartFormMode
  actionRender?: SmartFormExtraProps['actionRender']
  children?: React.ReactNode
}> = ({ schema, mode, actionRender, children }) => {
  const formInstance = Form.useFormInstance()

  const renderDefaultActions = () => {
    if (children) return children

    if (actionRender) return actionRender(formInstance, mode)

    if (mode === 'query') {
      return (
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button
              onClick={() => {
                formInstance.resetFields()
                formInstance.submit()
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
            <Button onClick={() => formInstance.resetFields()}>重置</Button>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Space>
        </Form.Item>
      )
    }

    return null
  }

  return (
    <>
      {Object.entries(schema).map(([key, item]) => {
        if (item.hiddenModes?.includes(mode)) return null

        return (
          <Form.Item key={key} name={key} label={item.title} {...item.itemProps}>
            {mode === 'view' ? (
              <Form.Item name={key} noStyle>
                {({ getFieldValue }) => {
                  const val = getFieldValue(key)
                  if (item.viewRender) {
                    return item.viewRender(val, formInstance.getFieldsValue())
                  }
                  if (item.widget?.displayName === 'Select' && item.props?.options) {
                    const matched = item.props.options.find(
                      (opt: Record<string, unknown>) => opt.id === val,
                    )
                    return <span>{matched ? matched.name : (val ?? '-')}</span>
                  }
                  return <span>{val !== undefined && val !== null ? String(val) : '-'}</span>
                }}
              </Form.Item>
            ) : item.render ? (
              item.render(formInstance)
            ) : (
              (() => {
                const WidgetComponent = item.widget
                let defaultProps: Record<string, unknown> = {
                  allowClear: true,
                }
                if (item.widget?.displayName === 'Input') {
                  defaultProps = {
                    ...defaultProps,
                    placeholder: typeof item.title === 'string' ? `请输入${item.title}` : undefined,
                    autoComplete: 'off',
                  }
                } else if (item.widget?.displayName === 'Select') {
                  defaultProps = {
                    ...defaultProps,
                    ...(typeof item.title === 'string' ? { placeholder: item.title } : {}),
                    fieldNames: { value: 'id', label: 'name' },
                    style: { width: 80 },
                  }
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <WidgetComponent {...defaultProps} {...(item.props as any)} />
              })()
            )}
          </Form.Item>
        )
      })}

      {renderDefaultActions()}
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

      activeForm.setFieldsValue(finalFields)

      activeForm.submit()
    }
  }, [syncUrlParams, schema, activeForm, mode, urlParamsTransform])

  const handleValuesChange = (
    changedValues: Record<string, unknown>,
    allValues: Record<string, unknown>,
  ) => {
    onValuesChange?.(changedValues, allValues)

    if (mode !== 'query' || !autoSubmit) return

    const changedKey = Object.keys(changedValues)[0]
    if (!changedKey) return

    const itemSchema = schema[changedKey]
    if (!itemSchema) return

    const widgetName = itemSchema.widget?.displayName || itemSchema.widget?.name || ''

    const isSelectOrPicker =
      /select|picker|radio|checkbox|cascader/i.test(widgetName) ||
      'options' in (itemSchema.props || {}) ||
      dayjs.isDayjs(changedValues[changedKey])

    if (isSelectOrPicker) {
      activeForm.submit()
    }

    const isInputWidget = /input/i.test(widgetName)
    const isCleared = changedValues[changedKey] === undefined || changedValues[changedKey] === ''

    if (isInputWidget && isCleared) {
      activeForm.submit()
    }
  }

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
