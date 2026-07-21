import http from '@/api/http'

const commonApi = {
  get: () => {
    return http.get('/common/get')
  },
  update: (data: { json: Record<string, unknown>[] }) => {
    return http.post('/common/update', data)
  },
}

export default commonApi
