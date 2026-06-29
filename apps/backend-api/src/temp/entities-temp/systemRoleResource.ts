import { Column, Entity, Index } from 'typeorm'

@Index('IDX_00d11014c51586ea70e8f95d02', ['roleId'], {})
@Index('IDX_9544b133c690b6fc0227923f64', ['resourceId'], {})
@Entity('system_role_resource', { schema: 'mydb' })
export class SystemRoleResource {
  @Column('int', { primary: true, name: 'role_id' })
  roleId: number

  @Column('int', { primary: true, name: 'resource_id' })
  resourceId: number
}
