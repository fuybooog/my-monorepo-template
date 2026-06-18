export class BatchDto {
  ids: string
}
export class BatchUpdateStatusDto {
  ids: string
  status: string
}
export class BatchResp {
  notFoundIds?: string
}