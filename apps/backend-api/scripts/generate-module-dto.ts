import path from 'path'
import {
  generateDtoFields,
  getDateFieldsStrByDates,
  parseEntityProperties,
  toKebabCase,
  toPascalCase,
} from './utils'

function generateDtoTemplate(moduleName: string) {
  const kebabCaseName = toKebabCase(moduleName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  const properties = parseEntityProperties(
    path.resolve(
      __dirname,
      `../src/modules/${kebabCaseName}/entities/${toKebabCase(moduleName)}.generated.ts`,
    ),
  )
  return {
    [`${kebabCaseName}.base.dto.ts`]: `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ${pascalCaseName}BaseDto {
${generateDtoFields(properties, 'req')}
}`,
    [`${kebabCaseName}.base.resp.dto.ts`]: `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ${pascalCaseName}BaseRespDto {
${generateDtoFields(properties, 'resp')}
}`,
    [`${kebabCaseName}.page.dto.ts`]: `import { ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto'
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
export class ${pascalCaseName}PageDto extends IntersectionType(
  OmitType(${pascalCaseName}BaseDto, ['id'] as const),
  PaginationQueryDto,
) {
${getDateFieldsStrByDates(properties)}
}`,
    [`${kebabCaseName}.page.option.dto.ts`]: `import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
export class ${pascalCaseName}PageOptionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '关键字', example: '' })
  @IsOptional()
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的列表字段',
    example: '',
  })
  @IsOptional()
  fields?: string = 'id'
}`,
    [`${kebabCaseName}.resp.dto.ts`]: `import { ${pascalCaseName}BaseRespDto } from './${kebabCaseName}.base.resp.dto'
export class ${pascalCaseName}RespDto extends ${pascalCaseName}BaseRespDto {
}`,
    [`${kebabCaseName}.page.resp.dto.ts`]: `import { IntersectionType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseRespDto } from './${kebabCaseName}.base.resp.dto'
export class ${pascalCaseName}PageRespDto extends IntersectionType(${pascalCaseName}BaseRespDto) {
}`,
    [`${kebabCaseName}.list.resp.dto.ts`]: `import { BatchRespDto } from '@/dto/batch.dto'
import { ${pascalCaseName}RespDto } from './${kebabCaseName}.resp.dto';
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
export class ${pascalCaseName}ListRespDto extends BatchRespDto {
  @ApiProperty({ description: '列表' })
  @Expose()
  list: ${pascalCaseName}RespDto[]
}`,
    [`${kebabCaseName}.create.dto.ts`]: `import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

class ${pascalCaseName}CreateRequiredDto {
  
}

export class ${pascalCaseName}CreateDto extends IntersectionType(
  OmitType(${pascalCaseName}BaseDto, ['id'] as const),
  ${pascalCaseName}CreateRequiredDto
) {
}
`,
    [`${kebabCaseName}.update.dto.ts`]: `import { OmitType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto';
export class ${pascalCaseName}UpdateDto extends OmitType(${pascalCaseName}BaseDto, ['id'] as const) {
}`,
  }
}
export default generateDtoTemplate
