import { OmitType } from '@nestjs/swagger'
import { ResourceBaseDto } from './resource.base.dto'
export class ResourceUpdateDto extends OmitType(ResourceBaseDto, ['id'] as const) {}
