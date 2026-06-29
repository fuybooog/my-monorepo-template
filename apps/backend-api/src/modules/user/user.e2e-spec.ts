import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { User } from '@/modules/user/entities/user.entity'
import { createTestApp } from '../../../test/test-util'

describe('UserController (E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const userRepository = dataSource.getRepository(User)
    await userRepository.clear()
    await userRepository.save([
      { userName: 'test_user_1', password: 'hashed_password_1', status: '1' },
      { userName: 'test_user_2', password: 'hashed_password_2', status: '2' },
      { userName: 'test_user_3', password: 'hashed_password_3', status: '1' },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('【1】/api/user (GET) - 应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/user')
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

  it('【2】/api/user (GET) - 返回的列表数据中绝对不能包含密码字段', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/user')
      .query({ page: 1, pageSize: 5 })
      .expect(200)

    const { data } = response.body

    const firstUser = data.list[0]
    expect(firstUser.userName).toBeDefined()
    expect(firstUser.password).toBeUndefined()
  })
})
