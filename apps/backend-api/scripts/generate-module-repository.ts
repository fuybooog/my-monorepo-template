import { toCamelCase, toKebabCase, toPascalCase } from './utils'
function generateRepositoryTemplate(moduleName) {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { ${pascalCaseName}PageDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { ${pascalCaseName}CreateDto } from './dto/${kebabCaseName}.create.dto'
import { ${pascalCaseName}UpdateDto } from './dto/${kebabCaseName}.update.dto'

@Injectable()
export class ${pascalCaseName}Repository extends Repository<${pascalCaseName}> {
  constructor(private dataSource: DataSource) {
    super(${pascalCaseName}, dataSource.createEntityManager())
  }

  async search${pascalCaseName}sByPage(query: ${pascalCaseName}PageDto) {
    const { page = 1, pageSize = 10 } = query

    const qb = this.createQueryBuilder('${camelCaseName}')

    // todo 排序应该从前端传入
    qb.orderBy('${camelCaseName}.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
  async find${pascalCaseName}ById(id: number) {
    const queryBuilder = this.createQueryBuilder('${camelCaseName}')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, ${pascalCaseName})
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => \`${camelCaseName}.\${col.propertyName}\`)

    safeFields.unshift('${camelCaseName}.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    queryBuilder.leftJoinAndSelect('${camelCaseName}.roles', 'role')

    return await queryBuilder.where('${camelCaseName}.id = :id', { id }).getOne()
  }

  async create${pascalCaseName}(${camelCaseName}CreateDto: ${pascalCaseName}CreateDto, manager: EntityManager) {
    const ${camelCaseName}Instance = manager.create(${pascalCaseName}, ${camelCaseName}CreateDto)
    const saved${pascalCaseName} = await manager.save(${pascalCaseName}, ${camelCaseName}Instance)
    return saved${pascalCaseName}
  }
  
  async update${pascalCaseName}(${camelCaseName}: ${pascalCaseName}, ${camelCaseName}UpdateDto: ${pascalCaseName}UpdateDto, manager: EntityManager) {
    const updated${pascalCaseName} = Object.assign(${camelCaseName}, ${camelCaseName}UpdateDto)
    return await manager.save(${pascalCaseName}, updated${pascalCaseName})
  }
  async remove${pascalCaseName}(${camelCaseName}: ${pascalCaseName}, manager: EntityManager) {
    ${camelCaseName}.deletedAt = new Date()
    return await manager.save(${pascalCaseName}, ${camelCaseName})
  }
  async batchRemove${pascalCaseName}(${camelCaseName}s: ${pascalCaseName}[], manager: EntityManager) {
    
    ${camelCaseName}s.forEach(${camelCaseName} => {
      ${camelCaseName}.deletedAt = new Date()
    })
    return await manager.save(${camelCaseName}s)
  }
  async update${pascalCaseName}Status(${camelCaseName}: ${pascalCaseName}, status: string, manager: EntityManager) {
    ${camelCaseName}.status = status
    return await manager.save(${pascalCaseName}, ${camelCaseName})
  }
  async batchUpdate${pascalCaseName}Status(${camelCaseName}s: ${pascalCaseName}[], status: string, manager: EntityManager) {
    ${camelCaseName}s.forEach(${camelCaseName} => {
      ${camelCaseName}.status = status
    })
    return await manager.save(${camelCaseName}s)
  }
}

`
}
export default generateRepositoryTemplate
