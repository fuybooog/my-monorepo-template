import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 🎯 业务自定义异常
 */
export class BusinessException extends HttpException {
  constructor(
    private readonly errMsg: string,
    private readonly errCode: number = 10001,
  ) {
    super({ errCode, errMsg }, HttpStatus.BAD_REQUEST)
  }

  getErrCode() {
    return this.errCode
  }
  getErrMsg() {
    return this.errMsg
  }
}
