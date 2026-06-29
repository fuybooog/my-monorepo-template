import { OmitType } from '@nestjs/swagger'
import { UserBaseDto } from './user.base.dto'
export class UserCreateDto extends OmitType(UserBaseDto, ['id'] as const) {}
