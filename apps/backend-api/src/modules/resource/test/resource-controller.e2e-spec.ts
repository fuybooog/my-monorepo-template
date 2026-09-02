import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { createTestApp } from '../../../../test/test-util'

describe('ResourceController(E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const resourceRepository = dataSource.getRepository(Resource)
    await resourceRepository.clear()
    await resourceRepository.save([
      { resourceName: 'test_resource_1', password: 'hashed_password_1', status: 1 },
      { resourceName: 'test_resource_2', password: 'hashed_password_2', status: 0 },
      { resourceName: 'test_resource_3', password: 'hashed_password_3', status: 1 },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  let resourceId: number // 共享变量，用于传递上下文

  it('应新增成功', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/resource/create')
      .send({
        resourceName: 'add_test_resource_name',
      })
      .expect(201)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)
    expect(data).toStrictEqual(
      expect.objectContaining({
        resourceName: 'add_test_resource_name',
      }),
    )

    // 赋值给共享变量
    resourceId = data.id
    expect(resourceId).toBeTruthy() // 确保获取到了 ID，否则后续测试无意义
  })

  it('应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer()).get('/api/resource/page').expect(200)

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

  it('应能根据 ID 查询到对应的', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!resourceId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .get(`/api/resource/find/${resourceId}`)
      .expect(200)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(resourceId)
  })

  it('应能根据 ID 修改对应的', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!resourceId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/resource/update/${resourceId}`)
      .send({
        resourceName: 'update_test_resource_name',
      })
      .expect(201)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(resourceId)
  })

  it('应能根据 ID 修改对应的的状态', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!resourceId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/resource/updateStatus/${resourceId}`)
      .send({
        status: '1',
      })
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('应能成功删除该', async () => {
    if (!resourceId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/resource/delete/${resourceId}`)
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('删除后再次查询应返回 404', async () => {
    if (!resourceId) throw new Error('前置测试未获取到 ID')

    await request(app.getHttpServer()).get(`/api/resource/find/${resourceId}`).expect(404)
  })
})
