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
  refresh(): Promise<Backend.PasswordLoginRes> {
    // skipAuthRefresh：刷新请求自身遇 401 不再触发刷新，直接走错误流程
    return http.post('/auth/refresh', {}, { skipAuthRefresh: true })
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
  forgotPassword(params: Backend.ForgotPasswordDto): Promise<Backend.ForgotPasswordRes> {
    return http.post('/auth/forgotPassword', params)
  },
  forgotResetPassword(
    params: Backend.ForgotPasswordResetDto,
  ): Promise<Backend.ForgotResetPasswordRes> {
    return http.post('/auth/forgotResetPassword', params)
  },
}
export default authApi
