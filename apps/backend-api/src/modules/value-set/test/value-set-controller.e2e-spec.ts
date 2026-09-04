import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { createTestApp } from '../../../../test/test-util'

describe('ValueSetController(E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const valueSetRepository = dataSource.getRepository(ValueSet)
    await valueSetRepository.clear()
    await valueSetRepository.save([
      { setCode: 'e2e_set_1', setName: 'E2E集1', code: 'e2e_code_1', name: 'E2E项1', status: 1 },
      { setCode: 'e2e_set_2', setName: 'E2E集2', code: 'e2e_code_2', name: 'E2E项2', status: 0 },
      { setCode: 'e2e_set_3', setName: 'E2E集3', code: 'e2e_code_3', name: 'E2E项3', status: 1 },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  let valueSetId: number // 共享变量，用于传递上下文

  it('应新增成功', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/value-set/create')
      .send({
        setCode: 'e2e_add_set',
        setName: 'E2E新增集',
        code: 'e2e_add_code',
        name: 'E2E新增项',
      })
      .expect(201)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)
    expect(data).toStrictEqual(
      expect.objectContaining({
        setName: 'E2E新增集',
        code: 'e2e_add_code',
      }),
    )

    // 赋值给共享变量
    valueSetId = data.id
    expect(valueSetId).toBeTruthy() // 确保获取到了 ID，否则后续测试无意义
  })

  it('应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer()).get('/api/value-set/page').expect(200)

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
    if (!valueSetId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .get(`/api/value-set/find/${valueSetId}`)
      .expect(200)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(valueSetId)
  })

  it('应能根据 ID 修改对应的', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!valueSetId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/value-set/update/${valueSetId}`)
      .send({
        setCode: 'e2e_add_set',
        setName: 'E2E新增集',
        code: 'e2e_add_code',
        name: 'update_test_name',
      })
      .expect(201)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(valueSetId)
  })

  it('应能根据 ID 修改对应的的状态', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!valueSetId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/value-set/updateStatus/${valueSetId}`)
      .send({
        status: '1',
      })
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('应能成功删除该', async () => {
    if (!valueSetId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/value-set/delete/${valueSetId}`)
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('删除后再次查询应返回 404', async () => {
    if (!valueSetId) throw new Error('前置测试未获取到 ID')

    await request(app.getHttpServer()).get(`/api/value-set/find/${valueSetId}`).expect(404)
  })
})
