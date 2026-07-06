import { OmitType } from '@nestjs/swagger'
import { RoleBaseDto } from './role.base.dto'
export class RoleUpdateDto extends OmitType(RoleBaseDto, ['id'] as const) {}
