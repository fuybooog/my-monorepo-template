import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('system_user_role', { schema: 'mydb' })
export class SystemUserRole {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number

  @Column('int', { name: 'user_id', nullable: true })
  userId: number | null

  @Column('int', { name: 'role_id', nullable: true })
  roleId: number | null
}
