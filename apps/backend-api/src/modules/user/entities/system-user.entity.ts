import { Entity, ManyToMany, JoinTable } from "typeorm";
import { SystemUserGenerated } from '@/modules/user/entities/system-user.generated';
import { SystemRoleGenerated } from '@/modules/role/entities/system-role.generated';

@Entity("system_role")
export class SystemUser extends SystemUserGenerated {
  
  @ManyToMany(() => SystemRoleGenerated)
  @JoinTable({
    name: "system_user_role",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" }
  })
  roles!: SystemRoleGenerated[];
}