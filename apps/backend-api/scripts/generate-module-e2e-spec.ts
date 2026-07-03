import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from './utils'

function generateSpecTemplate(moduleName: string, moduleNameCn: string = '') {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  const snakeCaseName = toSnakeCase(kebabCaseName)
  return `import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { createTestApp } from '../../../../test/test-util'

describe('${pascalCaseName}Controller(E2E)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())

    // 假数据注入
    const ${camelCaseName}Repository = dataSource.getRepository(${pascalCaseName})
    await ${camelCaseName}Repository.clear()
    await ${camelCaseName}Repository.save([
      { ${camelCaseName}Name: 'test_${snakeCaseName}_1', password: 'hashed_password_1', status: '1' },
      { ${camelCaseName}Name: 'test_${snakeCaseName}_2', password: 'hashed_password_2', status: '2' },
      { ${camelCaseName}Name: 'test_${snakeCaseName}_3', password: 'hashed_password_3', status: '1' },
    ])
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  let ${camelCaseName}Id: number; // 共享变量，用于传递上下文


  it('应新增${moduleNameCn}成功', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/${kebabCaseName}/create')
      .send({
        ${camelCaseName}Name: 'add_test_${snakeCaseName}_name'
      })
      .expect(201);

    const { head, data } = response.body;

    expect(head.errCode).toBe(0);
    expect(data).toStrictEqual(expect.objectContaining({
      ${camelCaseName}Name: 'add_test_${snakeCaseName}_name',
    }));

    // 赋值给共享变量
    ${camelCaseName}Id = data.id;
    expect(${camelCaseName}Id).toBeTruthy(); // 确保获取到了 ID，否则后续测试无意义
  });

  it('应成功返回完整的分页结构', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/${kebabCaseName}/page')
      .expect(200);

    const { head, data } = response.body;

    expect(head.errCode).toBe(0);
    expect(data).toStrictEqual(expect.objectContaining({
      total: 4,
      page: 1,
      pageSize: 10,
    }));
    expect(Array.isArray(data.list)).toBe(true);
    expect(data.list.length).toBe(4);
    expect(data.list[0]).not.toHaveProperty('password');

  });


  it('应能根据 ID 查询到对应的${moduleNameCn}', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!${camelCaseName}Id) throw new Error('前置测试未获取到${moduleNameCn} ID');

    const response = await request(app.getHttpServer())
      .get(\`/api/${kebabCaseName}/find/\${${camelCaseName}Id}\`)
      .expect(200);

    const { head, data } = response.body;
    expect(head.errCode).toBe(0);
    expect(data).toHaveProperty('id');
    expect(data).not.toHaveProperty('password');
    expect(data.id).toBe(${camelCaseName}Id);
  });

  it('应能根据 ID 修改对应的${moduleNameCn}', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!${camelCaseName}Id) throw new Error('前置测试未获取到${moduleNameCn} ID');

    const response = await request(app.getHttpServer())
      .post(\`/api/${kebabCaseName}/update/\${${camelCaseName}Id}\`)
      .send({
        ${camelCaseName}Name: 'update_test_${snakeCaseName}_name'
      })
      .expect(201);

    const { head, data } = response.body;
    expect(head.errCode).toBe(0);
    expect(data).toHaveProperty('id');
    expect(data).not.toHaveProperty('password');
    expect(data.id).toBe(${camelCaseName}Id);
  });

  it('应能根据 ID 修改对应的${moduleNameCn}的状态', async () => {
    // 如果上一步失败没拿到 ID，直接跳过或报错
    if (!${camelCaseName}Id) throw new Error('前置测试未获取到${moduleNameCn} ID');

    const response = await request(app.getHttpServer())
      .post(\`/api/${kebabCaseName}/updateStatus/\${${camelCaseName}Id}\`)
      .send({
        status: '1'
      })
      .expect(201);

    const { head } = response.body;
    expect(head.errCode).toBe(0);
  });

  it('应能成功删除该${moduleNameCn}', async () => {
    if (!${camelCaseName}Id) throw new Error('前置测试未获取到${moduleNameCn} ID');

    const response = await request(app.getHttpServer())
      .post(\`/api/${kebabCaseName}/delete/\${${camelCaseName}Id}\`)
      .expect(201);

    const { head } = response.body;
    expect(head.errCode).toBe(0);
  });

  it('删除后再次查询应返回 404', async () => {
    if (!${camelCaseName}Id) throw new Error('前置测试未获取到${moduleNameCn} ID');

    await request(app.getHttpServer())
      .get(\`/api/${kebabCaseName}/find/\${${camelCaseName}Id}\`)
      .expect(404);
  });
})
`
}
export default generateSpecTemplate
