import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { BusinessException } from '@/exceptions/business-exception'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let errMsg = 'Internal Server Error'
    let errCode = -1

    if (exception instanceof BusinessException) {
      errMsg = exception.getErrMsg()
      errCode = exception.getErrCode()
    } else if (exception instanceof HttpException) {
      const res = exception.getResponse() as any
      
      errMsg = typeof res === 'object' ? res.message || res.error : res
      
      errCode = status === HttpStatus.UNAUTHORIZED ? -2 : status 
    } else {
      console.error('Unhandled System Exception:', exception)
      errMsg = process.env.NODE_ENV === 'production' ? '服务器开小差了，请稍后再试' : (exception.message || 'Server Internal Error')
      errCode = -1
    }

    response.status(status).json({
      head: {
        errCode: errCode, 
        errMsg: Array.isArray(errMsg) ? errMsg.join(', ') : errMsg, 
      },
      data: null, 
    })
  }
}