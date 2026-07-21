import { HttpClient } from '@repo/api'
import { message } from 'antd'

const http = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  onBusinessError(errMsg) {
    message.error('【系统错误】' + errMsg)
  },
  onError(error) {
    // 鉴权错误，跳转登录
    // 系统错误，对应处理
    console.error('onError', error)
  },
})

export default http
