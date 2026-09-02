import http from '@/api/http'
import { Backend } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

const resourceApi = {
  page(
    params: Backend.ResourcePageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageResourceRes> {
    return http.get('/resource/page', params, config)
  },
  list(
    params: Backend.ResourcePageDto,
    config?: AxiosRequestConfig,
  ): Promise<Backend.ListAllResourceRes> {
    return http.get('/resource/list', params, config)
  },
  listByUser(params?: {
    userId?: number
    types: string
    notInMenu?: 0 | 1
  }): Promise<Backend.ListResourceByUserRes> {
    return http.get('/resource/listByUser', params)
  },
  findById(id: string | number): Promise<Backend.FindResourceByIdRes> {
    return http.get('/resource/find/' + id)
  },
  create(params: Backend.ResourceCreateDto): Promise<Backend.CreateResourceRes> {
    return http.post('/resource/create', params)
  },
  update(
    id: string | number,
    params: Backend.ResourceUpdateDto,
  ): Promise<Backend.UpdateResourceRes> {
    return http.post('/resource/update/' + id, params)
  },
  batchUpdate(params: Backend.ResourceBatchUpdateDto): Promise<Backend.BatchUpdateResourceRes> {
    return http.post('/resource/batchUpdate', params)
  },
  delete(id: string | number): Promise<Backend.RemoveResourceRes> {
    return http.post('/resource/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveResourceRes> {
    return http.post('/resource/batch/delete', { ids })
  },
  updateStatus(id: string | number, status: string): Promise<Backend.UpdateResourceStatusRes> {
    return http.post('/resource/updateStatus/' + id, { status })
  },
  resetSort() {
    return http.post('/resource/resetSort')
  },
}
export default resourceApi
