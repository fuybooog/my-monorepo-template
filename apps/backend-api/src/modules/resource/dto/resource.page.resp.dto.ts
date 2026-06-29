import { IntersectionType } from '@nestjs/swagger'
import { ResourceBaseRespDto } from './resource.base.resp.dto'
export class ResourcePageRespDto extends IntersectionType(ResourceBaseRespDto) {}
