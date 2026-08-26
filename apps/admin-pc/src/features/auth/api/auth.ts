import http from '@/api/http'
import { Backend } from '@repo/types'

const authApi = {
  passwordLogin(params: Backend.PasswordLoginDto): Promise<Backend.PasswordLoginRes> {
    return http.post('/auth/passwordLogin', params)
  },
  phoneLogin(params: Backend.PhoneLoginDto) {
    return http.post('/auth/phoneLogin', params)
  },
  currentLogin(): Promise<Backend.CurrentLoginRes> {
    return http.get('/auth/currentLogin')
  },
  logout(): Promise<Backend.LogoutRes> {
    return http.post('/auth/logout')
  },
  getCaptcha(): Promise<Backend.CreateCaptchaRes> {
    return http.get('/auth/captcha')
  },
  getPublicKey(): Promise<Backend.GetPublicKeyRes> {
    return http.get(
      '/auth/publicKey',
      {},
      {
        cacheOptions: {
          enable: false,
        },
      },
    )
  },
}
export default authApi
