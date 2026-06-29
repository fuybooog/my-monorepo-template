import { Entity, ManyToMany, JoinTable } from 'typeorm'
import { RoleGenerated } from '@/modules/role/entities/role.generated'
import { Resource } from '@/modules/resource/entities/resource.entity'

@Entity('system_role')
export class Role extends RoleGenerated {
  @ManyToMany(() => Resource, { createForeignKeyConstraints: false })
  @JoinTable({
    name: 'system_role_resource',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'resource_id', referencedColumnName: 'id' },
  })
  resources!: Resource[]
}
