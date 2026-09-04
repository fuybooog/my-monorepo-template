import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { getMetadataArgsStorage } from 'typeorm'
import { User } from '../entities/user.entity'
import { isTargetOrParent } from '@/utils/fns'

export function IsUserFields(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUserFields',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (!value.includes('id')) return false

          const storage = getMetadataArgsStorage()

          const columns = storage.columns
            .filter((col) => isTargetOrParent(col.target, User))
            .map((col) => col.propertyName)

          const allowedFields = Array.from(new Set([...columns]))
          return value.split(',').every((field) => allowedFields.includes(field))
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是逗号分隔的合法用户字段字符串，且必须包含 'id'`
        },
      },
    })
  }
}
