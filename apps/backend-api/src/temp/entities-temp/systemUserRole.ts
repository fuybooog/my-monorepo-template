import { Column, Entity, Index } from 'typeorm'

@Index('IDX_8783090d0bc4c31b72754781bb', ['userId'], {})
@Index('IDX_d3fd6e49ad8a2fbde2f871c198', ['roleId'], {})
@Entity('system_user_role', { schema: 'mydb' })
export class SystemUserRole {
  @Column('int', { primary: true, name: 'user_id' })
  userId: number

  @Column('int', { primary: true, name: 'role_id' })
  roleId: number
}
