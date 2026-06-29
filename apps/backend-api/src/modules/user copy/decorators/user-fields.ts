import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { getMetadataArgsStorage } from 'typeorm'
import { SystemUser } from '../entities/system-user.entity'

const isTargetOrParent = (target: any) => {
  let current = target
  while (current) {
    if (current === SystemUser) return true
    current = Object.getPrototypeOf(current)
  }
  return false
}

export function IsUserFields(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUserFields',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) return false

          if (!value.includes('id')) return false

          const storage = getMetadataArgsStorage()

          // const isTargetOrParent = (target: any) => {
          //   // eslint-disable-next-line @typescript-eslint/no-base-to-string, no-prototype-builtins
          //   return target === SystemUser || Object.prototype.isPrototypeOf.call(SystemUser, target);
          // };

          const columns = storage.columns
            .filter((col) => isTargetOrParent(col.target))
            .map((col) => col.propertyName)

          const generations = storage.generations
            .filter((gen) => isTargetOrParent(gen.target))
            .map((gen) => gen.propertyName)

          const allowedFields = Array.from(new Set([...columns, ...generations]))

          return value.every((field) => allowedFields.includes(field))
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是逗号分隔的合法用户字段字符串，且必须包含 'id'`
        },
      },
    })
  }
}
