import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Input, Steps } from 'antd'
import authApi from '@/features/auth/api/auth'
import { SmartForm, SmartSchema } from '@/components/common'
import { getMessage } from '@/utils/antd-instance'
import { SUCCESS_MESSAGE } from '@/constants'
import { encryptPassword } from '@/utils'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [step, setStep] = useState(0)
  const [sending, setSending] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [email, setEmail] = useState('')
  const [devCode, setDevCode] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [keyId, setKeyId] = useState('')

  useEffect(() => {
    const init = async () => {
      const publicKeyRes = await authApi.getPublicKey()
      if (publicKeyRes.head.errCode === 0) {
        setPublicKey(publicKeyRes.data.publicKey)
        setKeyId(publicKeyRes.data.keyId)
      }
    }
    void init()
  }, [])

  /** 按步骤动态构建表单 schema（遵循约定：用 useMemo，不 setState schema） */
  const resetFormSchema = useMemo<SmartSchema>(() => {
    const base: SmartSchema = {
      email: {
        title: '邮箱',
        props: {
          placeholder: '请输入注册邮箱',
          maxLength: 64,
          disabled: step === 1,
        },
        itemProps: {
          rules: [
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' },
          ],
        },
      },
    }
    if (step === 0) {
      return base
    }
    return {
      ...base,
      code: {
        title: '邮箱验证码',
        props: {
          placeholder: '请输入 6 位验证码',
          maxLength: 6,
        },
        itemProps: {
          rules: [{ required: true, message: '请输入邮箱验证码' }],
        },
      },
      newPassword: {
        title: '新密码',
        widget: Input.Password,
        props: {
          placeholder: '请输入新密码',
          maxLength: 32,
        },
        itemProps: {
          rules: [{ required: true, message: '请输入新密码' }],
        },
      },
      confirmPassword: {
        title: '确认新密码',
        widget: Input.Password,
        props: {
          placeholder: '请再次输入新密码',
          maxLength: 32,
        },
        itemProps: {
          dependencies: ['newPassword'],
          rules: [
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ],
        },
      },
    }
  }, [step])

  /** 第一步：发送邮箱验证码 */
  const handleSendCode = useCallback(async (values: { email: string }) => {
    setSending(true)
    try {
      const res = await authApi.forgotPassword({ email: values.email })
      if (res.head.errCode === 0) {
        setEmail(values.email)
        // 开发环境后端回显验证码，便于联调（生产环境不返回）
        setDevCode(res.data.devCode ?? '')
        getMessage().success(SUCCESS_MESSAGE.FORGOT_CODE_SENT)
        setStep(1)
      }
    } finally {
      setSending(false)
    }
  }, [])

  /** 第二步：校验验证码并重置密码（disabled 的 email 不在 values 中，用 state 取值） */
  const handleReset = useCallback(
    async (values: { code: string; newPassword: string }) => {
      setResetting(true)
      try {
        const res = await authApi.forgotResetPassword({
          email,
          code: values.code,
          newPassword: encryptPassword(values.newPassword, publicKey),
          keyId,
        })
        if (res.head.errCode === 0) {
          getMessage().success(SUCCESS_MESSAGE.FORGOT_RESET_DONE)
          navigate('/login', { replace: true })
        }
      } finally {
        setResetting(false)
      }
    },
    [email, publicKey, keyId, navigate],
  )

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-[420px] bg-white rounded-t-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-xl font-semibold text-center mb-6">找回密码</h1>
        <div className="mb-6">
          <Steps current={step} items={[{ title: '填写邮箱' }, { title: '重置密码' }]} />
        </div>
        {step === 1 && devCode && (
          <div className="mb-4">
            <Alert type="info" showIcon title={`开发环境验证码：${devCode}`} />
          </div>
        )}
        <SmartForm
          mode={'create'}
          form={form}
          labelCol={{ flex: '100px' }}
          requiredMark={false}
          schema={resetFormSchema}
          onFinish={step === 0 ? handleSendCode : handleReset}
          grid={true}
          colProps={{ span: 24 }}
        >
          <Button type="primary" htmlType="submit" block loading={sending || resetting}>
            {step === 0 ? '发送验证码' : '重置密码'}
          </Button>
        </SmartForm>
        <div className="mt-3 text-center">
          <Link to="/login" className="text-sm text-blue-500 hover:text-blue-600">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}
