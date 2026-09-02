import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { User } from '@/modules/user/entities/user.entity'
import { createTestApp } from '../../../../test/test-util'

describe('UserController(E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const userRepository = dataSource.getRepository(User)
    await userRepository.clear()
    await userRepository.save([
      { userName: 'test_user_1', password: 'hashed_password_1', status: 1 },
      { userName: 'test_user_2', password: 'hashed_password_2', status: 0 },
      { userName: 'test_user_3', password: 'hashed_password_3', status: 1 },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  let userId: number // 共享变量，用于传递上下文

  it('应新增用户成功', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/user/create')
      .send({
        userName: 'add_test_user_name',
      })
      .expect(201)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)
    expect(data).toStrictEqual(
      expect.objectContaining({
        userName: 'add_test_user_name',
      }),
    )

    // 赋值给共享变量
    userId = data.id
    console.log('userId', userId)
    expect(userId).toBeTruthy() // 确保获取到了 ID，否则后续测试无意义
  })

  it('应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer()).get('/api/user/page').expect(200)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)
    expect(data).toStrictEqual(
      expect.objectContaining({
        total: 4,
        page: 1,
        pageSize: 10,
      }),
    )
    expect(Array.isArray(data.list)).toBe(true)
    expect(data.list.length).toBe(4)
    expect(data.list[0]).not.toHaveProperty('password')
  })

  it('应能根据 ID 查询到对应的用户', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!userId) throw new Error('前置测试未获取到用户 ID')

    const response = await request(app.getHttpServer()).get(`/api/user/find/${userId}`).expect(200)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(userId)
  })

  it('应能根据 ID 修改对应的用户', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!userId) throw new Error('前置测试未获取到用户 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/user/update/${userId}`)
      .send({
        userName: 'update_test_user_name',
      })
      .expect(201)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(userId)
  })

  it('应能根据 ID 修改对应的用户的状态', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!userId) throw new Error('前置测试未获取到用户 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/user/updateStatus/${userId}`)
      .send({
        status: '1',
      })
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('应能成功删除该用户', async () => {
    if (!userId) throw new Error('前置测试未获取到用户 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/user/delete/${userId}`)
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('删除后再次查询应返回 404', async () => {
    if (!userId) throw new Error('前置测试未获取到用户 ID')

    await request(app.getHttpServer()).get(`/api/user/find/${userId}`).expect(404)
  })
})
