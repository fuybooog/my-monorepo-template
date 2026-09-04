import { randomUUID } from 'crypto'

/**
 * uuid@14 为 ESM-only 包，jest(CJS) 无法直接加载（详见 auth.service.spec.ts 顶部注释）。
 * 此处提供 CJS 版 stub，供 e2e 通过 jest moduleNameMapper 全局替换，
 * 避免每个 e2e spec 加载 AppModule 时因 import uuid 而报 ERR_REQUIRE_ESM。
 * 随机性由 Node 内置 crypto.randomUUID 保证，与 uuid v4 等价。
 */
export const v4 = randomUUID
export default { v4: randomUUID }
