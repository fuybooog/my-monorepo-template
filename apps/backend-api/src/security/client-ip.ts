/** IPv4-mapped IPv6 地址归一化：::ffff:127.0.0.1 → 127.0.0.1 */
const normalizeIp = (ip?: string | null): string => (ip ?? '').trim().replace(/^::ffff:/i, '')

interface IpCarrier {
  ip?: string
  socket?: { remoteAddress?: string }
}

/**
 * 取客户端真实 IP。
 *
 * 依赖 express 的 `trust proxy` 设置：开启后 express 会按 `TRUST_PROXY` 指定的层数，
 * 从右往左剥离可信代理，取 X-Forwarded-For 中最左侧（最靠近真实客户端）的一跳。
 * 未开启时返回 socket.remoteAddress（即直连对端，通常是 Nginx 的 IP）。
 */
export function resolveClientIp(req?: IpCarrier): string {
  if (!req) return ''
  return normalizeIp(req.ip) || normalizeIp(req.socket?.remoteAddress)
}

const LOOPBACK_IPS = new Set(['127.0.0.1', '::1', 'localhost'])

/** 是否为本机/回环地址。用于收紧开发环境旁路的使用范围 */
export function isLoopbackAddress(ip: string): boolean {
  return LOOPBACK_IPS.has(normalizeIp(ip))
}
