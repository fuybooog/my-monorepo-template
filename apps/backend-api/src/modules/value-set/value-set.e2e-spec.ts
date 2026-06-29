import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { createTestApp } from '../../../test/test-util'

describe('ValueSetController (E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    // const valueSetRepository = dataSource.getRepository(ValueSet)
    // await valueSetRepository.clear()
    // await valueSetRepository.save([
    //   { valueSetName: 'test_valueSet_1', password: 'hashed_password_1', status: '1' },
    //   { valueSetName: 'test_valueSet_2', password: 'hashed_password_2', status: '2' },
    //   { valueSetName: 'test_valueSet_3', password: 'hashed_password_3', status: '1' },
    // ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('【1】/api/value-set (GET) - 应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/value-set')
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

  it('【2】/api/value-set (GET) - 返回的列表数据中绝对不能包含密码字段', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/value-set')
      .query({ page: 1, pageSize: 5 })
      .expect(200)

    const { data } = response.body

    const firstUser = data.list[0]
    expect(firstUser.valueSetName).toBeDefined()
    expect(firstUser.password).toBeUndefined()
  })
})
