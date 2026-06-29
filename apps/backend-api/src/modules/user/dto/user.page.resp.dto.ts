import { IntersectionType } from '@nestjs/swagger'
import { UserBaseRespDto } from './user.base.resp.dto'
export class UserPageRespDto extends IntersectionType(UserBaseRespDto) {}
