import { toCamelCase, toKebabCase, toPascalCase } from './utils'
function generateRepositoryTemplate(moduleName) {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import { DataSource, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { ${pascalCaseName}PageDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.dto'


@Injectable()
export class ${pascalCaseName}Repository extends Repository<${pascalCaseName}> {
  constructor(private dataSource: DataSource) {
    super(${pascalCaseName}, dataSource.createEntityManager())
  }

  async search${pascalCaseName}sByPage(query: ${pascalCaseName}PageDto) {
    const { page = 1, pageSize = 10, ${camelCaseName}Name } = query

    const qb = this.createQueryBuilder('${kebabCaseName}')

    if (${camelCaseName}Name) {
      qb.andWhere('${kebabCaseName}.${camelCaseName}Name LIKE :${camelCaseName}Name', { ${camelCaseName}Name })
    }

    // todo 排序应该从前端传入
    qb.orderBy('${kebabCaseName}.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
}
`
}
export default generateRepositoryTemplate
