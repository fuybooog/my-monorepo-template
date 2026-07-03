import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
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
export class TransformInterceptor<T> implements NestInterceptor<T, Response<any>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<any>> {
    return next.handle().pipe(
      map((data) => {
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
