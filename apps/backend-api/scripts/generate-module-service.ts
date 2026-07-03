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
import { ${pascalCaseName}CreateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.create.dto'
import { ${pascalCaseName}UpdateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ${pascalCaseName}Repository } from '@/modules/${kebabCaseName}/${kebabCaseName}.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'

@Injectable()
export class ${pascalCaseName}Service {
  static readonly SEARCHABLE_FIELDS = ['${camelCaseName}Name']
  constructor(private readonly ${camelCaseName}Repository: ${pascalCaseName}Repository, private readonly dataSource: DataSource) {}
  async page${pascalCaseName}(${camelCaseName}PageDto: ${pascalCaseName}PageDto): Promise<PaginatedResult<${pascalCaseName}PageRespDto>> {
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
    const queryBuilder = this.${camelCaseName}Repository.createQueryBuilder('${camelCaseName}')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => \`${camelCaseName}.\${field}\`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ${pascalCaseName}Service.SEARCHABLE_FIELDS.map((item) => \`${camelCaseName}.\${item} LIKE :keyword\`).join(
        ' OR ',
      )
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
      where: { id },
    })
    if (!${camelCaseName}Entity) {
      throw new NotFoundException(\`未找到id为\${id}的${moduleNameCn}\`)
    }
    return plainToInstance(${pascalCaseName}RespDto, ${camelCaseName}Entity, { excludeExtraneousValues: true })
  }
  async find${pascalCaseName}ListByIds(ids: string): Promise<${pascalCaseName}ListRespDto | null> {
    const idList = ids.split(',').map(id => Number.parseInt(id))
    const findOptions: FindManyOptions<${pascalCaseName}> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.${camelCaseName}Repository.find(findOptions)
    const list = plainToInstance(${pascalCaseName}RespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((${camelCaseName}) => ${camelCaseName}.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async create${pascalCaseName}(${camelCaseName}CreateDto: ${pascalCaseName}CreateDto): Promise<${pascalCaseName}RespDto | null> {
    // todo 检查是否唯一
    return await this.dataSource.transaction(async (manager) => {
      const ${camelCaseName}Entity = await this.${camelCaseName}Repository.create${pascalCaseName}(${camelCaseName}CreateDto, manager)
      // todo 添加${moduleNameCn}角色
      return ${camelCaseName}Entity
    })
  }
  async update${pascalCaseName}(id: number, ${camelCaseName}UpdateDto: ${pascalCaseName}UpdateDto): Promise<${pascalCaseName}RespDto | null> {
    const ${camelCaseName}Entity = await this.${camelCaseName}Repository.findOne({
      where: { id },
    })
    if (!${camelCaseName}Entity) {
      throw new BusinessException(\`未找到id为\${id}的${moduleNameCn}\`)
    }
    return await this.dataSource.transaction(async (manager) => {
      const updated${pascalCaseName}Entity = await this.${camelCaseName}Repository.update${pascalCaseName}(${camelCaseName}Entity, ${camelCaseName}UpdateDto, manager)
      // todo 修改${moduleNameCn}角色
      return updated${pascalCaseName}Entity
    })
  }
  async remove${pascalCaseName}(id: number): Promise<null> {
    const ${camelCaseName}Entity = await this.${camelCaseName}Repository.findOne({
      where: { id },
    })
    if (!${camelCaseName}Entity) {
      throw new BusinessException(\`未找到id为\${id}的${moduleNameCn}\`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.${camelCaseName}Repository.remove${pascalCaseName}(${camelCaseName}Entity, manager)
      return null
    })
  }
  async batchRemove${pascalCaseName}(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map(id => Number.parseInt(id))
    const ${camelCaseName}s = await this.${camelCaseName}Repository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (${camelCaseName}s.length !== ids.length) {
      missingIds = idList.filter(id => !${camelCaseName}s.some(${camelCaseName} => ${camelCaseName}.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.${camelCaseName}Repository.batchRemove${pascalCaseName}(${camelCaseName}s, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }
  async update${pascalCaseName}Status(id: number, ${camelCaseName}UpdateDto: UpdateStatusDto): Promise<null> {
    const ${camelCaseName}Entity = await this.${camelCaseName}Repository.findOne({
      where: { id },
    })
    if (!${camelCaseName}Entity) {
      throw new BusinessException(\`未找到id为\${id}的${moduleNameCn}\`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.${camelCaseName}Repository.update${pascalCaseName}Status(${camelCaseName}Entity, ${camelCaseName}UpdateDto.status, manager)
      return null
    })
  }
  async batchUpdate${pascalCaseName}Status(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map(id => Number.parseInt(id))
    const ${camelCaseName}s = await this.${camelCaseName}Repository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (${camelCaseName}s.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter(id => !${camelCaseName}s.some(${camelCaseName} => ${camelCaseName}.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.${camelCaseName}Repository.batchUpdate${pascalCaseName}Status(${camelCaseName}s, batchUpdateStatusDto.status, manager)
      return {
        notFoundIds: missingIds,
      }
    })
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
