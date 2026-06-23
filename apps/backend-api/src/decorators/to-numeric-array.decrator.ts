import { applyDecorators } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { IsArray, IsInt } from 'class-validator'

export function ToNumericArray() {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      }
      if (Array.isArray(value)) {
        return value.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      }
      return value
    }),
    IsArray(),
    IsInt({ each: true }),
  )
}
