import { OmitType } from '@nestjs/swagger'
import { UserBaseDto } from './user.base.dto'
export class UserUpdateDto extends OmitType(UserBaseDto, ['id'] as const) {}
