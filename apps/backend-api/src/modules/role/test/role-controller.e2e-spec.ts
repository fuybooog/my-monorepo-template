import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { Role } from '@/modules/role/entities/role.entity'
import { createTestApp } from '../../../../test/test-util'

describe('RoleController(E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const roleRepository = dataSource.getRepository(Role)
    await roleRepository.clear()
    await roleRepository.save([
      { roleName: 'test_role_1', roleCode: 'test_role_code_1', level: 1, status: 1 },
      { roleName: 'test_role_2', roleCode: 'test_role_code_2', level: 2, status: 0 },
      { roleName: 'test_role_3', roleCode: 'test_role_code_3', level: 3, status: 1 },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  let roleId: number // 共享变量，用于传递上下文

  it('应新增成功', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/role/create')
      .send({
        roleName: 'add_test_role_name',
        roleCode: 'add_test_role_code',
        level: 4,
        status: 1,
      })
      .expect(201)

    const { head, data } = response.body

    expect(head.errCode).toBe(0)
    expect(data).toStrictEqual(
      expect.objectContaining({
        roleName: 'add_test_role_name',
        roleCode: 'add_test_role_code',
      }),
    )

    // 赋值给共享变量
    roleId = data.id
    expect(roleId).toBeTruthy() // 确保获取到了 ID，否则后续测试无意义
  })

  it('应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer()).get('/api/role/page').expect(200)

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
    if (!roleId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer()).get(`/api/role/find/${roleId}`).expect(200)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(roleId)
  })

  it('应能根据 ID 修改对应的', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!roleId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/role/update/${roleId}`)
      .send({
        roleName: 'update_test_role_name',
      })
      .expect(201)

    const { head, data } = response.body
    expect(head.errCode).toBe(0)
    expect(data).toHaveProperty('id')
    expect(data).not.toHaveProperty('password')
    expect(data.id).toBe(roleId)
  })

  it('应能根据 ID 修改对应的的状态', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!roleId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/role/updateStatus/${roleId}`)
      .send({
        status: '1',
      })
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('应能成功删除该', async () => {
    if (!roleId) throw new Error('前置测试未获取到 ID')

    const response = await request(app.getHttpServer())
      .post(`/api/role/delete/${roleId}`)
      .expect(201)

    const { head } = response.body
    expect(head.errCode).toBe(0)
  })

  it('删除后再次查询应返回 404', async () => {
    if (!roleId) throw new Error('前置测试未获取到 ID')

    await request(app.getHttpServer()).get(`/api/role/find/${roleId}`).expect(404)
  })
})
