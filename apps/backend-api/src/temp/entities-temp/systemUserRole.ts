import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Entity("system_user_role", { schema: "mydb" })
export class SystemUserRole {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "user_id", nullable: true, length: 45 })
  userId: string | null;

  @Column("varchar", { name: "role_id", nullable: true, length: 45 })
  roleId: string | null;
}
