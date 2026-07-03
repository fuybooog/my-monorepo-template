import http from '@/api/http'
import { Backend } from '@repo/types'

const userApi = {
  page(params: Backend.UserPageDto): Promise<Backend.PageUserRes> {
    return http.post('/user/page', params)
  },
}
export default userApi
