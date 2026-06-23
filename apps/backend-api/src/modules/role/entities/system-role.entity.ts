import { Entity, ManyToMany, JoinTable } from 'typeorm'
import { SystemRoleGenerated } from '@/modules/role/entities/system-role.generated'
import { SystemResourceGenerated } from '@/modules/resource/entities/system-resource.generated'

@Entity('system_role')
export class SystemRole extends SystemRoleGenerated {
  @ManyToMany(() => SystemResourceGenerated, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'system_role_resource',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'resource_id', referencedColumnName: 'id' },
  })
  resources!: SystemResourceGenerated[]
}
