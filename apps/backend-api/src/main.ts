import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './transform.interceptor'
import { OperationLogContextInterceptor } from './modules/operation-log/operation-log.interceptor'
import { HttpExceptionFilter } from './exceptions/http-exception.filter'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import qs from 'qs'
import type { NextFunction, Request, Response } from 'express'
import { csrfTokenMiddleware } from './security/csrf.middleware'
import { securityConfig } from './security/security.constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.set('query parser', (str: string) => qs.parse(str))
  // 限流/登录锁定按客户端 IP 计数，必须正确解析反代传递的 X-Forwarded-For
  expressApp.set('trust proxy', securityConfig.trustProxy)

  app.setGlobalPrefix('api')
  const configService = app.get(ConfigService)
  const allowedDomainsStr = configService.get<string>('CORS_ALLOWED_DOMAINS') || ''
  const allowedDomains = allowedDomainsStr.split(',').filter(Boolean)
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true)
      }

      // 1. 匹配 localhost 及其任意端口 (如 http://localhost:5173)
      const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin)

      // 2. 匹配 127.0.0.1 及其任意端口 (如 http://127.0.0.1:3000)
      const isLoopbackIp = /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)

      // 3. 匹配 192.168.x.x 局域网段及其任意端口 (如 http://192.168.1.50:5173)
      const isLanIp = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)

      if (isLocalhost || isLoopbackIp || isLanIp) {
        return callback(null, true)
      }

      // 4. 公司线上生产/测试泛域名
      const isAllowedDomain = allowedDomains.some((domain) => {
        // 匹配 domain 本身 (如 http://yourdomain.com) 或其子域名 (如 http://admin.yourdomain.com)
        return (
          origin === `http://${domain}` ||
          origin === `https://${domain}` ||
          origin.endsWith(`.${domain}`)
        )
      })

      if (isAllowedDomain) {
        callback(null, true)
      } else {
        callback(new Error('CORS Policy: This origin is not allowed.'))
      }
    },
    credentials: true,
  })
  const swaggerEnabled = securityConfig.swaggerEnabled

  // 安全响应头：Swagger 页面依赖内联脚本与样式，需对其放宽 CSP，其余路径启用完整策略
  app.use((req: Request, res: Response, next: NextFunction) => {
    const relaxCsp = swaggerEnabled && req.path.startsWith('/api-docs')
    return helmet({ contentSecurityPolicy: relaxCsp ? false : undefined })(req, res, next)
  })

  app.use(cookieParser())
  // 必须在 cookieParser 之后：读取/下发 CSRF 令牌 Cookie
  app.use(csrfTokenMiddleware)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  // 先写入操作人上下文（AsyncLocalStorage），再交由响应转换拦截器处理
  app.useGlobalInterceptors(new OperationLogContextInterceptor(), new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  // 默认拒绝：仅当 securityConfig.swaggerEnabled 为真时才挂载 /api-docs。
  // 生产环境（NODE_ENV 未显式开放或 ENABLE_SWAGGER 未开启）一律不暴露文档路由。
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('管理系统 - API 文档')
      .setDescription('接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)

    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  }
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
