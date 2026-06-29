import { OmitType } from '@nestjs/swagger'
import { ResourceBaseDto } from './resource.base.dto'
export class ResourceCreateDto extends OmitType(ResourceBaseDto, ['id'] as const) {}
