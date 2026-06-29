import { toCamelCase, toKebabCase, toPascalCase } from './utils'
function generateE2eSpecTemplate(moduleName) {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { createTestApp } from '../../../test/test-util'

describe('${pascalCaseName}Controller (E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    // const ${camelCaseName}Repository = dataSource.getRepository(${pascalCaseName})
    // await ${camelCaseName}Repository.clear()
    // await ${camelCaseName}Repository.save([
    //   { ${camelCaseName}Name: 'test_${camelCaseName}_1', password: 'hashed_password_1', status: '1' },
    //   { ${camelCaseName}Name: 'test_${camelCaseName}_2', password: 'hashed_password_2', status: '2' },
    //   { ${camelCaseName}Name: 'test_${camelCaseName}_3', password: 'hashed_password_3', status: '1' },
    // ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('【1】/api/${kebabCaseName} (GET) - 应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/${kebabCaseName}')
      .query({ page: 1, pageSize: 10 })
      .expect(200)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)

    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('pageSize')
    expect(data).toHaveProperty('list')

    expect(data.total).toBe(3)
    expect(Array.isArray(data.list)).toBe(true)
    expect(data.list.length).toBe(3)
  })

  it('【2】/api/${kebabCaseName} (GET) - 返回的列表数据中绝对不能包含密码字段', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/${kebabCaseName}')
      .query({ page: 1, pageSize: 5 })
      .expect(200)

    const { data } = response.body

    const firstUser = data.list[0]
    expect(firstUser.${camelCaseName}Name).toBeDefined()
    expect(firstUser.password).toBeUndefined()
  })
})
`
}
export default generateE2eSpecTemplate
