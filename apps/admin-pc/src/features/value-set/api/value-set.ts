import http from '@/api/http'
import { Backend } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

const valueSetApi = {
  page(
    params: Backend.ValueSetPageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageValueSetRes> {
    return http.get('/value-set/page', params, config)
  },
  findById(id: string | number): Promise<Backend.FindValueSetByIdRes> {
    return http.get('/value-set/find/' + id)
  },
  findByIds(ids: string): Promise<Backend.FindValueSetListByIdsRes> {
    return http.get('/value-set/batch/query', { ids })
  },
  create(params: Backend.ValueSetCreateDto): Promise<Backend.CreateValueSetRes> {
    return http.post('/value-set/create', params)
  },
  update(
    id: string | number,
    params: Backend.ValueSetUpdateDto,
  ): Promise<Backend.UpdateValueSetRes> {
    return http.post('/value-set/update/' + id, params)
  },
  delete(id: string | number): Promise<Backend.RemoveValueSetRes> {
    return http.post('/value-set/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveValueSetRes> {
    return http.post('/value-set/batch/delete', { ids })
  },
  updateStatus(
    id: string | number,
    status: number | string,
  ): Promise<Backend.UpdateValueSetStatusRes> {
    return http.post('/value-set/updateStatus/' + id, { status })
  },
  batchUpdateStatus(
    ids: string,
    status: number | string,
  ): Promise<Backend.BatchUpdateValueSetStatusRes> {
    return http.post('/value-set/batch/status', { ids, status })
  },
  resetPassword(params: Backend.ResetPasswordDto): Promise<Backend.ResetPasswordRes> {
    return http.post('/value-set/resetPassword', params)
  },
  getValueSetBySetCodes(
    params: Backend.ValueSetListDto,
  ): Promise<Backend.FindValueSetBySetCodesRes> {
    return http.get('/value-set/by-set-codes', params)
  },
  /** 集维度分页（按 setCode 去重，含值数量） */
  pageGroups(
    params: Backend.ValueSetGroupPageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageValueSetGroupsRes> {
    return http.get('/value-set/sets/page', params, config)
  },
}
export default valueSetApi
