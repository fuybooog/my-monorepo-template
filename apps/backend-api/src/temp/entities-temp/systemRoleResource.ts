import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Entity("system_role_resource", { schema: "mydb" })
export class SystemRoleResource {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "role_id", nullable: true, length: 45 })
  roleId: string | null;

  @Column("varchar", { name: "resource_id", nullable: true, length: 45 })
  resourceId: string | null;
}
