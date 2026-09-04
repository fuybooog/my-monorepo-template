/**
 * 安全相关配置（全部可通过环境变量覆盖，默认值偏保守）
 *
 * 说明：这里直接读 process.env 而不是注入 ConfigService，
 * 因为这些值同时被守卫/中间件等「非 DI 生命周期」的位置消费（如 main.ts）。
 */

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value.trim() === '') return fallback
  return value.trim() === 'true' || value.trim() === '1'
}

const toTrustProxy = (value: string | undefined): boolean | number | string => {
  if (value === undefined || value.trim() === '') return 1
  const raw = value.trim()
  if (/^\d+$/.test(raw)) return Number(raw)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return raw
}

/** 当前运行环境（已去除空白，未设置时为空串） */
const nodeEnv = (process.env.NODE_ENV ?? '').trim()

/** 允许暴露 Swagger 文档的环境。仅本地开发与 e2e，其余（含未设置 NODE_ENV 的生产部署）一律关闭 */
const SWAGGER_ALLOWED_ENVS = new Set(['development', 'test'])

/** CSRF 令牌 Cookie 名（非 httpOnly，供前端读取后回放到请求头） */
export const CSRF_COOKIE_NAME = 'csrf_token'
/** CSRF 令牌请求头名 */
export const CSRF_HEADER_NAME = 'x-csrf-token'
/** CSRF Cookie 有效期（毫秒）：12 小时 */
export const CSRF_COOKIE_MAX_AGE = 12 * 60 * 60 * 1000
/** 不产生状态变更的安全方法，无需 CSRF 校验 */
export const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const securityConfig = {
  /** 反向代理层数。未部署在 Nginx/CDN 之后请显式设为 0/false，否则客户端可伪造 X-Forwarded-For */
  trustProxy: toTrustProxy(process.env.TRUST_PROXY),

  /** 是否启用 CSRF（双 Cookie + 自定义请求头）校验 */
  csrfEnabled: toBoolean(process.env.CSRF_ENABLED, true),

  /**
   * 是否挂载 Swagger 文档路由（/api-docs）。
   *
   * 采用「默认拒绝」而非「仅 production 关闭」：start:prod（node dist/main）并不设置 NODE_ENV，
   * 若只判断 NODE_ENV === 'production'，漏配环境变量时文档会静默对外暴露，等于没关。
   * 因此未显式配置 ENABLE_SWAGGER 时，仅 development / test 开启。
   *
   * 需要在预发/联调环境临时开放文档时，显式设置 ENABLE_SWAGGER=true。
   */
  swaggerEnabled: toBoolean(process.env.ENABLE_SWAGGER, SWAGGER_ALLOWED_ENVS.has(nodeEnv)),

  /** 全局默认限流：窗口（毫秒）*/
  throttleTtl: toNumber(process.env.THROTTLE_TTL, 60_000),
  /** 全局默认限流：窗口内允许的请求数 */
  throttleLimit: toNumber(process.env.THROTTLE_LIMIT, 300),

  /** 登录类接口限流：窗口（毫秒）*/
  loginThrottleTtl: toNumber(process.env.LOGIN_THROTTLE_TTL, 60_000),
  /** 登录类接口限流：窗口内允许的请求数 */
  loginThrottleLimit: toNumber(process.env.LOGIN_THROTTLE_LIMIT, 5),

  /** 公钥/验证码接口限流：窗口（毫秒）（RSA 2048 密钥生成 CPU 开销高，是低成本 DoS 点）*/
  credentialThrottleTtl: toNumber(process.env.CREDENTIAL_THROTTLE_TTL, 60_000),
  /** 公钥/验证码接口限流：窗口内允许的请求数 */
  credentialThrottleLimit: toNumber(process.env.CREDENTIAL_THROTTLE_LIMIT, 20),

  /** 账号维度：连续失败多少次后锁定 */
  loginMaxFail: toNumber(process.env.LOGIN_MAX_FAIL, 5),
  /** 账号维度：失败计数的统计窗口（秒），超时未再失败则重新计数 */
  loginFailWindowSeconds: toNumber(process.env.LOGIN_FAIL_WINDOW_SECONDS, 15 * 60),
  /** 账号维度：锁定持续时间（秒）*/
  loginLockSeconds: toNumber(process.env.LOGIN_LOCK_SECONDS, 15 * 60),

  /** IP 维度：连续失败多少次后锁定（跨账号撞库防护，阈值需显著高于账号维度）*/
  loginIpMaxFail: toNumber(process.env.LOGIN_IP_MAX_FAIL, 30),
  /** IP 维度：失败计数的统计窗口（秒）*/
  loginIpFailWindowSeconds: toNumber(process.env.LOGIN_IP_FAIL_WINDOW_SECONDS, 10 * 60),
  /** IP 维度：锁定持续时间（秒）*/
  loginIpLockSeconds: toNumber(process.env.LOGIN_IP_LOCK_SECONDS, 15 * 60),
}
