import { IntersectionType } from '@nestjs/swagger'
import { UserBaseRespDto } from './user.base.resp.dto'
export class UserResp extends IntersectionType(UserBaseRespDto) {}
