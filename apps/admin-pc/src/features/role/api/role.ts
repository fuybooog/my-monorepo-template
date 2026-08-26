import http from '@/api/http'
import { Backend } from '@repo/types'
import { AxiosRequestConfig } from 'axios'

const roleApi = {
  page(
    params: Partial<Backend.RolePageDto>,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageRoleRes> {
    return http.get('/role/page', params, config)
  },
  pageOptionRole(
    params: Partial<Backend.RolePageOptionDto>,
    config?: AxiosRequestConfig,
  ): Promise<Backend.PageOptionRoleRes> {
    return http.get('/role/option', params, config)
  },
  findById(id: string | number): Promise<Backend.FindRoleByIdRes> {
    return http.get('/role/find/' + id)
  },
  findByIds(ids: string | number): Promise<Backend.FindRoleListByIdsRes> {
    return http.get('/role/batch/query', { ids })
  },
  create(params: Backend.RoleCreateDto): Promise<Backend.CreateRoleRes> {
    return http.post('/role/create', params)
  },
  update(id: string | number, params: Backend.RoleUpdateDto): Promise<Backend.UpdateRoleRes> {
    return http.post('/role/update/' + id, params)
  },
  delete(id: string | number): Promise<Backend.RemoveRoleRes> {
    return http.post('/role/delete/' + id)
  },
  batchDelete(ids: string): Promise<Backend.BatchRemoveRoleRes> {
    return http.post('/role/batch/delete', { ids })
  },
  updateStatus(id: string | number, status: string): Promise<Backend.UpdateRoleStatusRes> {
    return http.post('/role/updateStatus/' + id, { status })
  },
}
export default roleApi
