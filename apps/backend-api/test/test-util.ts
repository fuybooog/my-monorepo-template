import { jest } from '@jest/globals'
import { Test, TestingModule } from '@nestjs/testing'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { TransformInterceptor } from '../src/transform.interceptor'
import { AuthGuard } from '../src/modules/auth/auth.guard'
import { DataSource } from 'typeorm'

export async function createTestApp() {
  jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context) => {
    const req = context.switchToHttp().getRequest()
    req.user = { id: 1, userName: 'test_user_1' }
    return true
  })

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe())
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
