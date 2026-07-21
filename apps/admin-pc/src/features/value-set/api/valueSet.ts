import http from '@/api/http'
import { Backend } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

const setCodeApi = {
  page(params: Backend.ValueSetPageDto): Promise<Backend.PageValueSetRes> {
    return http.get('/value-set/page', params)
  },
  getValueSetBySetCodes(
    params: Backend.ValueSetListDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.FindValueSetBySetCodesRes> {
    return http.get('/value-set/by-set-codes', params, config)
  },
}
export default setCodeApi
