import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Index("unique_prop_UNIQUE", ["uniqueProp"], { unique: true })
@Entity("system_resource", { schema: "mydb" })
export class SystemResource {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "label", nullable: true, length: 100 })
  label: string | null;

  @Column("varchar", {
    name: "unique_prop",
    nullable: true,
    unique: true,
    length: 100,
  })
  uniqueProp: string | null;

  @Column("varchar", {
    name: "parent_unique_prop",
    nullable: true,
    length: 100,
  })
  parentUniqueProp: string | null;

  @Column("varchar", { name: "status", nullable: true, length: 2 })
  status: string | null;

  @Column("varchar", {
    name: "type",
    nullable: true,
    comment: "资源类型，1页面 2按钮",
    length: 2,
  })
  type: string | null;

  @Column("int", { name: "sort_number", nullable: true })
  sortNumber: number | null;

  @Column("datetime", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("datetime", { name: "updated_at", nullable: true })
  updatedAt: Date | null;
}
