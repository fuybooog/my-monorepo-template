import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Index("role_code_UNIQUE", ["roleCode"], { unique: true })
@Index("role_name_UNIQUE", ["roleName"], { unique: true })
@Entity("system_role", { schema: "mydb" })
export class SystemRole {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "role_name",
    nullable: true,
    unique: true,
    length: 45,
  })
  roleName: string | null;

  @Column("varchar", {
    name: "role_code",
    nullable: true,
    unique: true,
    length: 45,
  })
  roleCode: string | null;

  @Column("varchar", { name: "status", nullable: true, length: 2 })
  status: string | null;

  @Column("datetime", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("datetime", { name: "updated_at", nullable: true })
  updatedAt: Date | null;
}
