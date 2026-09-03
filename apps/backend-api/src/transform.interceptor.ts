import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  head: {
    errCode: number
    errMsg: string
  }
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 文件下载类接口（StreamableFile）直接透传，不做统一包装
        if (data instanceof StreamableFile) {
          return data
        }
        return {
          head: {
            errCode: 0,
            errMsg: 'success',
          },
          data: data ? instanceToPlain(data) : null,
        }
      }),
    )
  }
}
