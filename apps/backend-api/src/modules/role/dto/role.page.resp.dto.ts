import { IntersectionType } from '@nestjs/swagger'
import { RoleBaseRespDto } from './role.base.resp.dto'
export class RolePageRespDto extends IntersectionType(RoleBaseRespDto) {}
