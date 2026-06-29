import { toCamelCase, toKebabCase, toPascalCase } from './utils'
function generateServiceTemplate(moduleName, moduleNameCn = '') {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)

  return `import { Injectable, NotFoundException } from '@nestjs/common'

import { ${pascalCaseName}PageRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.resp.dto'
import { ${pascalCaseName}PageDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.dto'
import { ${pascalCaseName}PageOptionDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.option.dto'
import { ${pascalCaseName}RespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.resp.dto'
import { ${pascalCaseName}ListRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.list.resp.dto'
import { ${pascalCaseName}CreateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.create.resp.dto'
import { ${pascalCaseName}UpdateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ${pascalCaseName}Repository } from '@/modules/${kebabCaseName}/${kebabCaseName}.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'

@Injectable()
export class ${pascalCaseName}Service {
  static readonly SEARCHABLE_FIELDS = ['${camelCaseName}Name', 'mobile', 'pinyin']
  constructor(private readonly ${camelCaseName}Repository: ${pascalCaseName}Repository) {}
  async page${pascalCaseName}(
    ${camelCaseName}PageDto: ${pascalCaseName}PageDto,
  ): Promise<PaginatedResult<${pascalCaseName}PageRespDto>> {
    const [entities, total] = await this.${camelCaseName}Repository.search${pascalCaseName}sByPage(${camelCaseName}PageDto)
    const list = plainToInstance(${pascalCaseName}PageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: ${camelCaseName}PageDto.page,
      pageSize: ${camelCaseName}PageDto.pageSize,
    }
  }
  async pageOption${pascalCaseName}(
    ${camelCaseName}PageOptionDto: ${pascalCaseName}PageOptionDto,
  ): Promise<PaginatedResult<${pascalCaseName}PageRespDto>> {
    const { keyword, fields, page, pageSize } = ${camelCaseName}PageOptionDto
    const queryBuilder = this.${camelCaseName}Repository.createQueryBuilder('${kebabCaseName}')
    if (fields && fields.length) {
      const selectFields = fields.map((field) => \`${kebabCaseName}.\${field}\`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ${pascalCaseName}Service.SEARCHABLE_FIELDS.map(
        (item) => \`${kebabCaseName}.\${item} LIKE :keyword\`,
      ).join(' OR ')
      queryBuilder.andWhere(\`(\${where})\`, { keyword: \`%\${keyword}%\` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(${pascalCaseName}PageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async find${pascalCaseName}ById(id: number): Promise<${pascalCaseName}RespDto | null> {
    // 直接用 repository 中的 api 进行查询
    const ${camelCaseName}Entity = await this.${camelCaseName}Repository.findOne({
      where: {id},
    })
    if (!${camelCaseName}Entity) {
      throw new NotFoundException(\`未找到id为\${id}的${moduleNameCn}\`)
    }
    return plainToInstance(${pascalCaseName}RespDto, ${camelCaseName}Entity, {excludeExtraneousValues: true})
  }
  async find${pascalCaseName}ListByIds(ids: number[]): Promise<${pascalCaseName}ListRespDto | null> {
    const findOptions: FindManyOptions<${pascalCaseName}> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.${camelCaseName}Repository.find(findOptions)
    const list = plainToInstance(${pascalCaseName}RespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((${camelCaseName}) => ${camelCaseName}.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async create${pascalCaseName}(${camelCaseName}CreateDto: ${pascalCaseName}CreateDto): Promise<${pascalCaseName}RespDto | null> {
    return null
  }
  async update${pascalCaseName}(
    id: number,
    ${camelCaseName}UpdateDto: ${pascalCaseName}UpdateDto,
  ): Promise<${pascalCaseName}RespDto | null> {
    return null
  }
  async remove${pascalCaseName}(id: number): Promise<null> {
    return null
  }
  async batchRemove${pascalCaseName}(ids: number[]): Promise<BatchRespDto | null> {
    return null
  }
  async update${pascalCaseName}Status(
    id: number,
    ${camelCaseName}UpdateDto: Pick<${pascalCaseName}UpdateDto, 'status'>,
  ): Promise<null> {
    return null
  }
  async batchUpdate${pascalCaseName}Status(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return null
  }

  async downloadTemplate() {
    return null
  }
  async import${pascalCaseName}() {
    return null
  }
  async export${pascalCaseName}() {
    return null
  }
}
`
}
export default generateServiceTemplate
