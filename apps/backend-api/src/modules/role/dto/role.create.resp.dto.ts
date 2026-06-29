import { OmitType } from '@nestjs/swagger'
import { RoleBaseDto } from './role.base.dto'
export class RoleCreateDto extends OmitType(RoleBaseDto, ['id'] as const) {}
