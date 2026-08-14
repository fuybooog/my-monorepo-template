import { ApiProperty, OmitType } from '@nestjs/swagger'
import { ResourceBaseDto, ResourcePartialDto } from './resource.base.dto'
import { IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
export class ResourceUpdateDto extends OmitType(ResourceBaseDto, ['id'] as const) {}

export class ResourceBatchUpdateDto {
  @ApiProperty({ type: [ResourcePartialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePartialDto)
  list: ResourcePartialDto[]
}
