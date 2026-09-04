import { jest } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { TransformInterceptor } from '../src/transform.interceptor'
import { AuthGuard } from '../src/modules/auth/auth.guard'
import { PermissionsGuard } from '../src/modules/auth/auth-permission.guard'
import { DataSource } from 'typeorm'
import cookieParser from 'cookie-parser'

export async function createTestApp() {
  jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context) => {
    const req = context.switchToHttp().getRequest()
    req.user = { id: 1, userName: 'test_user_1', maxLevel: 100 }
    return true
  })
  // 与 AuthGuard 一致：跳过权限点校验（CRUD spec 聚焦接口/业务行为本身）
  jest.spyOn(PermissionsGuard.prototype, 'canActivate').mockReturnValue(true)

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 必须开启克隆转换
      whitelist: true,
    }),
  )
  // 与 main.ts 对齐：解析 cookie（logout 等 @Public 接口需从 cookie 中解码操作人）
  app.use(cookieParser())
  app.useGlobalInterceptors(new TransformInterceptor())
  await app.init()

  // 2. 统一做数据库熔断强校验
  const dataSource = moduleFixture.get<DataSource>(DataSource)
  const currentDb = dataSource.driver.database
  if (currentDb !== 'mydb_test') {
    console.error(`\n🛑 [危险] 测试脚本连接到了库: ${currentDb}，已自动熔断！`)
    await dataSource.destroy()
    await app.close()
    process.exit(1)
  }

  return { app, dataSource }
}
