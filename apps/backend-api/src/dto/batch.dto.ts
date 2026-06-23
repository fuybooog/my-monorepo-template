import { ToNumericArray } from '@/decorators/to-numeric-array.decrator'

export class BatchDto {
  @ToNumericArray()
  ids: number[]
}
export class BatchUpdateStatusDto {
  @ToNumericArray()
  ids: number[]
  status: string
}
export class BatchResp {
  notFoundIds?: number[]
}
