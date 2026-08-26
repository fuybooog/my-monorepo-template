import React, { useEffect, useState } from 'react'
import { Button, Drawer, Form, Input, Space } from 'antd'
import { SmartForm, SmartFormMode, SmartSchema } from '@/components/common'
import userApi from '@/features/user/api/user'
import { getMessage } from '@/utils/antd-instance'
import authApi from '@/features/auth/api/auth'
import { encryptPassword } from '@/utils'
import { useAuthStore } from '@/store/authStore'

interface UserInfoDrawerProps {
  visible: boolean
  onCancel: () => void
}

export const UserInfoDrawer: React.FC<UserInfoDrawerProps> = ({ visible, onCancel }) => {
  const auth = useAuthStore((state) => state.auth)
  const [updatePasswordFlag, setUpdatePasswordFlag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [baseInfoForm] = Form.useForm()
  const [form] = Form.useForm()
  const [keyInfo, setKeyInfo] = useState({
    oldPasswordKeyId: '',
    newPasswordKeyId: '',
    oldPasswordPublicKey: '',
    newPasswordPublicKey: '',
  })
  const [mode, setMode] = useState<SmartFormMode>('view')
  const [baseInfoMode, setBaseInfoMode] = useState<SmartFormMode>('view')

  const baseInfoSchema: SmartSchema = {
    userName: {
      title: '账号',
      render({ value }) {
        return <span>{value}</span>
      },
    },
    nickName: {
      title: '昵称',
    },
  }

  const resetSchema: SmartSchema = {
    oldPassword: {
      title: '旧密码',
      widget: Input.Password,
      itemProps: {
        rules: [{ required: true, message: '请输入旧密码' }],
      },
    },
    newPassword: {
      title: '新密码',
      widget: Input.Password,
      itemProps: {
        rules: [{ required: true, message: '请输入新密码' }],
      },
    },
    confirmPassword: {
      title: '确认密码',
      widget: Input.Password,
      itemProps: {
        dependencies: ['newPassword'],
        rules: [
          { required: true, message: '请确认密码!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次输入的密码不一致!'))
            },
          }),
        ],
      },
    },
  }

  // 仅在 visible 为 true 时触发异步数据请求及表单初始赋值
  useEffect(() => {
    if (!visible) return

    // 1. 初始化表单默认值
    baseInfoForm.setFieldsValue({
      nickName: auth?.nickName || '',
      userName: auth?.userName,
    })
    form.resetFields()

    // 2. 获取加密公钥
    const fetchKeys = async () => {
      try {
        const [oldRes, newRes] = await Promise.all([authApi.getPublicKey(), authApi.getPublicKey()])
        if (oldRes.head.errCode === 0 && newRes.head.errCode === 0) {
          setKeyInfo({
            oldPasswordKeyId: oldRes.data.keyId,
            newPasswordKeyId: newRes.data.keyId,
            oldPasswordPublicKey: oldRes.data.publicKey,
            newPasswordPublicKey: newRes.data.publicKey,
          })
        } else {
          getMessage().error('获取加密密钥失败，请刷新重试')
        }
      } catch (error) {
        console.error('获取加密密钥失败，请检查网络', error)
        getMessage().error('获取加密密钥失败，请检查网络')
      }
    }

    fetchKeys()
  }, [visible, auth, baseInfoForm, form])

  // 处理关闭弹窗时的状态重置
  const handleClose = () => {
    setUpdatePasswordFlag(false)
    setMode('view')
    setBaseInfoMode('view')
    onCancel()
  }

  const handleFinish = async () => {
    await form.validateFields()
    try {
      const hashedOldPassword = encryptPassword(
        form.getFieldValue('oldPassword'),
        keyInfo.oldPasswordPublicKey,
      )
      const hashedNewPassword = encryptPassword(
        form.getFieldValue('newPassword'),
        keyInfo.newPasswordPublicKey,
      )
      const params = {
        oldPassword: hashedOldPassword,
        newPassword: hashedNewPassword,
        oldPasswordKeyId: keyInfo.oldPasswordKeyId,
        newPasswordKeyId: keyInfo.newPasswordKeyId,
        userId: auth!.id,
      }
      await userApi.resetPassword(params)
      setUpdatePasswordFlag(false)
      setMode('view')
      getMessage().success('密码重置成功！')
      form.resetFields()
      handleClose()
    } catch (error) {
      console.error('密码重置失败，请重试', error)
      getMessage().error('密码重置失败，请重试！')
    }
  }

  const handleSaveBaseInfo = async () => {
    try {
      await baseInfoForm.validateFields()
      setLoading(true)
      await userApi.update(auth!.id!, baseInfoForm.getFieldsValue())
      setBaseInfoMode('view')
      getMessage().success('保存成功！昵称在重新登录后生效！')
    } catch (e) {
      console.error('保存失败', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      title={'账号信息'}
      open={visible}
      onClose={handleClose}
      size={'large'}
      extra={
        baseInfoMode === 'edit' ? (
          <Space>
            <Button
              color={'primary'}
              variant={'link'}
              onClick={() => {
                setBaseInfoMode('view')
                baseInfoForm.resetFields()
              }}
            >
              取消
            </Button>
            <Button color={'primary'} variant={'link'} onClick={handleSaveBaseInfo}>
              保存
            </Button>
          </Space>
        ) : (
          <Button
            color={'primary'}
            variant={'link'}
            onClick={() => {
              setBaseInfoMode('edit')
            }}
          >
            编辑
          </Button>
        )
      }
      destroyOnHidden
    >
      <SmartForm
        form={baseInfoForm}
        schema={baseInfoSchema}
        grid={true}
        colProps={{ span: 24 }}
        mode={baseInfoMode}
        noSubmit={true}
      />
      {updatePasswordFlag ? (
        <div>
          <SmartForm
            form={form}
            schema={resetSchema}
            grid={true}
            colProps={{ span: 24 }}
            mode={mode}
            noSubmit={true}
          />
          <div className={'pl-[85px]'}>
            <Space>
              <Button
                color={'primary'}
                variant={'link'}
                onClick={() => {
                  setMode('view')
                  form.resetFields()
                  setUpdatePasswordFlag(false)
                }}
              >
                取消
              </Button>
              <Button
                color={'primary'}
                variant={'link'}
                onClick={() => handleFinish()}
                loading={loading}
              >
                保存密码
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div className={'pl-[85px]'}>
          <Button
            color={'primary'}
            variant={'link'}
            onClick={() => {
              setMode('edit')
              setUpdatePasswordFlag(true)
            }}
          >
            修改密码
          </Button>
        </div>
      )}
    </Drawer>
  )
}
