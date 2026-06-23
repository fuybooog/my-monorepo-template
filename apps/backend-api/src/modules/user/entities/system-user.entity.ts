import { Entity, ManyToMany, JoinTable, Column } from 'typeorm'
import { SystemUserGenerated } from '@/modules/user/entities/system-user.generated'
import { SystemRole } from '@/modules/role/entities/system-role.entity'

@Entity('system_user')
export class SystemUser extends SystemUserGenerated {
  @ManyToMany(() => SystemRole, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'system_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: SystemRole[]

  @Column('varchar', { name: 'password', nullable: true, length: 255, select: false })
  declare password: string | null
}
