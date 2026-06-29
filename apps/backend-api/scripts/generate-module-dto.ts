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
${generateDtoFields(properties, 'req', 'read')}
}`,
    [`${kebabCaseName}.base.resp.dto.ts`]: `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
export class ${pascalCaseName}BaseRespDto {
${generateDtoFields(properties, 'resp', 'read')}
}`,
    [`${kebabCaseName}.page.dto.ts`]: `import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { OmitType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto';
import { PaginationQueryDto } from '@/dto/pagination-query.dto'
export class ${pascalCaseName}PageDto extends IntersectionType(
  OmitType(${pascalCaseName}BaseDto, ['id'] as const), 
  PaginationQueryDto
) {
${getDateFieldsStrByDates(properties)}
}`,
    [`${kebabCaseName}.page.option.dto.ts`]: `import { PaginationQueryDto } from '@/dto/pagination-query.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsOptional } from 'class-validator'
export class ${pascalCaseName}PageOptionDto extends PaginationQueryDto {
  @ApiProperty({ description: '关键字', example: '' })
  keyword?: string
  @ApiPropertyOptional({
    description: '返回的列表字段',
    example: '',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      // 默认返回的字段
      return ['id']
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return value
  })
  @IsArray()
  fields?: string[]
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
export class ${pascalCaseName}ListRespDto extends BatchRespDto {
  list: ${pascalCaseName}RespDto[]
}`,
    [`${kebabCaseName}.create.resp.dto.ts`]: `import { OmitType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto';
export class ${pascalCaseName}CreateDto extends OmitType(${pascalCaseName}BaseDto, ['id'] as const) {
}`,
    [`${kebabCaseName}.update.resp.dto.ts`]: `import { OmitType } from '@nestjs/swagger'
import { ${pascalCaseName}BaseDto } from './${kebabCaseName}.base.dto';
export class ${pascalCaseName}UpdateDto extends OmitType(${pascalCaseName}BaseDto, ['id'] as const) {
}`,
  }
}
export default generateDtoTemplate
