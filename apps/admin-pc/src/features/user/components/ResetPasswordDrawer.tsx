import React, { useEffect, useState } from 'react'
import { Drawer, Form } from 'antd'
import { SmartForm, SmartSchema } from '@/components/common'
import userApi from '../api/user'
import { generateStrongPassword } from '@/utils/fns'
import { getMessage } from '@/utils/antd-instance'
import authApi from '@/features/auth/api/auth'
import { SUCCESS_MESSAGE, ERROR_MESSAGE } from '@/constants'
import { encryptPassword } from '@/utils'

interface ResetPasswordDrawerProps {
  visible: boolean
  onCancel: () => void
  userId: number
}

export const ResetPasswordDrawer: React.FC<ResetPasswordDrawerProps> = ({
  visible,
  onCancel,
  userId,
}) => {
  const [form] = Form.useForm()
  const [publicKey, setPublicKey] = useState('')
  const [keyId, setKeyId] = useState('')
  const resetSchema: SmartSchema = {
    newPassword: {
      title: '新密码',
      itemProps: {
        rules: [{ required: true, message: '请输入新密码' }],
      },
    },
    confirmPassword: {
      title: '确认密码',
      itemProps: {
        dependencies: ['newPassword'],
        rules: [
          { required: true, message: '请确认密码!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              // 如果确认密码为空，或与密码字段值相同，则校验通过
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              // 否则，校验失败，返回错误
              return Promise.reject(new Error('两次输入的密码不一致!'))
            },
          }),
        ],
      },
    },
  }

  useEffect(() => {
    const init = async () => {
      const publicKeyRes = await authApi.getPublicKey()
      if (publicKeyRes.head.errCode === 0) {
        setPublicKey(publicKeyRes.data.publicKey)
        setKeyId(publicKeyRes.data.keyId)
      }
    }
    if (visible) {
      init()
      const password = generateStrongPassword()
      form.setFieldsValue({
        newPassword: password,
        confirmPassword: password,
      })
    }
  }, [visible, form])

  const handleFinish = async (values: { newPassword: string }) => {
    // setLoading(true)
    try {
      const hashedPassword = encryptPassword(values.newPassword, publicKey)
      // 调用API，将新密码和用户ID发送给后端
      await userApi.adminResetPassword({ newPassword: hashedPassword, keyId, userId })
      getMessage().success(SUCCESS_MESSAGE.PASSWORD_RESET)
      form.resetFields() // 成功后再次重置
      onCancel() // 关闭弹窗
    } catch (error) {
      console.error('密码重置失败，请重试', error)
      getMessage().error(ERROR_MESSAGE.PASSWORD_RESET)
    } finally {
      // setLoading(false)
    }
  }

  return (
    <Drawer
      title={'重置密码'}
      open={visible}
      onClose={() => onCancel()}
      size={'large'}
      destroyOnHidden
    >
      <SmartForm
        form={form}
        schema={resetSchema}
        grid={true}
        onFinish={handleFinish}
        colProps={{ span: 24 }}
        mode={'create'}
      ></SmartForm>
    </Drawer>
  )
}
