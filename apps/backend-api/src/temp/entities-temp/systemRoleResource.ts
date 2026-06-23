import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('system_role_resource', { schema: 'mydb' })
export class SystemRoleResource {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number

  @Column('int', { name: 'role_id', nullable: true })
  roleId: number | null

  @Column('int', { name: 'resource_id', nullable: true })
  resourceId: number | null
}
