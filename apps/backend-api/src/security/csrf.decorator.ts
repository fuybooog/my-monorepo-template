import { SetMetadata } from '@nestjs/common'

export const CSRF_SKIP_KEY = 'csrfSkip'

/**
 * 跳过 CSRF 校验。
 * 仅用于确认无 Cookie 凭据可滥用的场景（如第三方回调、开放给服务端的 webhook），
 * 请勿随意加在管理端接口上。
 */
export const CsrfSkip = () => SetMetadata(CSRF_SKIP_KEY, true)
