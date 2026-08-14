import { Backend } from '@repo/types'

export interface ResourcePageRespDto extends Omit<Backend.ResourcePageRespDto, 'id'> {
  id?: number
  children?: ResourcePageRespDto[]
  buttons?: Backend.ResourcePageRespDto[]
  columns?: Backend.ResourcePageRespDto[]
  _index?: number
  _isFirst?: boolean
  _isLast?: boolean
}
