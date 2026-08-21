import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { router } from '@/router'
import { useThemeStore } from './store/themStore'
import React from 'react'
import { setAppInstances } from './utils/antd-instance'

const AppInstanceInitializer = () => {
  const { message, notification, modal } = AntdApp.useApp()
  React.useEffect(() => {
    setAppInstances(message, notification, modal)
  }, [message, notification, modal])
  return null
}

function App() {
  const theme = useThemeStore((state) => state.resolvedTheme)
  return (
    <ConfigProvider
      locale={zhCN}
      drawer={{ mask: { closable: false } }}
      modal={{ mask: { closable: false } }}
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AntdApp>
        <AppInstanceInitializer />
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
