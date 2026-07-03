import { Entity, ManyToMany, JoinTable, Column } from 'typeorm'
import { UserGenerated } from '@/modules/user/entities/user.generated'
import { Role } from '@/modules/role/entities/role.entity'
import { Exclude } from 'class-transformer'

@Entity('system_user')
export class User extends UserGenerated {
  @ManyToMany(() => Role, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'system_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[]

  @Column('varchar', { name: 'password', nullable: true, length: 255, select: false })
  @Exclude()
  declare password: string | null
}
