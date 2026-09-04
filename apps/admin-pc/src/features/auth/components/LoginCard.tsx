import { Link, useNavigate } from 'react-router-dom'
import authApi from '@/features/auth/api/auth'
import { SmartForm, SmartSchema } from '@/components/common'
import { Button, Form, Input, Space } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { cn, encryptPassword } from '@/utils'

interface LoginCardProps {
  className?: string
}

export function LoginCard({ className }: LoginCardProps) {
  const [form] = Form.useForm()
  const [captchaImg, setCaptchaImg] = useState<string>('')
  const [captchaKey, setCaptchaKey] = useState<string>('')
  const [publicKey, setPublicKey] = useState<string>('')
  const [keyId, setKeyId] = useState<string>('')
  const handleRefreshCaptcha = useCallback(async () => {
    const res = await authApi.getCaptcha()
    if (res.head.errCode === 0) {
      setCaptchaImg(res.data.captchaImg)
      setCaptchaKey(res.data.captchaKey)
    }
  }, [])

  const init = async () => {
    await handleRefreshCaptcha()
    const publicKeyRes = await authApi.getPublicKey()
    if (publicKeyRes.head.errCode === 0) {
      setPublicKey(publicKeyRes.data.publicKey)
      setKeyId(publicKeyRes.data.keyId)
    }
  }
  const loginFormSchema: SmartSchema = {
    userName: {
      title: '用户名',
      itemProps: {
        rules: [{ required: true, message: '请输入用户名' }],
        className: 'center-form-item-label',
      },
    },
    password: {
      title: '密码',
      widget: Input.Password,
      itemProps: {
        rules: [{ required: true, message: '请输入密码' }],
        className: 'center-form-item-label',
      },
    },
    captchaCode: {
      title: '验证码',
      itemProps: {
        rules: [{ required: true, message: '请输入验证码' }],
        className: 'center-form-item-label',
      },
      render({ value, onChange }) {
        return (
          <Space>
            <Input placeholder="请输入验证码" value={value} onChange={onChange} />
            {captchaImg ? (
              <img
                src={captchaImg}
                alt="captcha"
                className={'ml-[10px] align-middle cursor-pointer'}
                onClick={init}
              />
            ) : (
              '加载中...'
            )}
          </Space>
        )
      },
    },
  }
  const navigate = useNavigate()

  useEffect(() => {
    init()
  }, [])

  async function handleLogin() {
    const res = await authApi.passwordLogin({
      userName: form.getFieldValue('userName'),
      password: encryptPassword(form.getFieldValue('password'), publicKey),
      keyId,
      captchaCode: form.getFieldValue('captchaCode'),
      captchaKey,
    })
    if (res.head.errCode === 0) {
      navigate('/dashboard', { replace: true })
    } else {
      handleRefreshCaptcha()
    }
  }
  return (
    <div
      className={cn(
        'w-[400px] bg-white rounded-t-2xl shadow-xl border border-slate-100 p-8 [&_.ant-form-item-label]:text-center [&_.ant-form-item-label>label]:justify-center',
        className,
      )}
    >
      <SmartForm
        mode={'create'}
        form={form}
        labelCol={{ flex: '80px' }}
        requiredMark={false}
        schema={loginFormSchema}
        onFinish={handleLogin}
        grid={true}
        colProps={{ span: 24 }}
      >
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
          登录
        </Button>
      </SmartForm>
      <div className="mt-3 text-right">
        <Link to="/resetPassword" className="text-sm text-blue-500 hover:text-blue-600">
          忘记密码？
        </Link>
      </div>
    </div>
  )
}
