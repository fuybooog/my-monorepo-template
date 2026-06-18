/**
 * 🚨🚨🚨 WARNING 🚨🚨🚨
 * 该文件由脚本 db-sync.ts 自动生成，请勿手动修改！
 * 如有字段变更，请修改数据库表结构后，重新运行 pnpm db:sync 命令触发覆盖。
 */

import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Index("set_code", ["setCode", "code"], { unique: true })
@Entity("system_value_set", { schema: "mydb" })
export class SystemValueSetGenerated {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "set_code", nullable: true, length: 45 })
  setCode: string | null;

  @Column("varchar", { name: "set_name", nullable: true, length: 45 })
  setName: string | null;

  @Column("varchar", { name: "code", nullable: true, length: 45 })
  code: string | null;

  @Column("varchar", { name: "name", nullable: true, length: 45 })
  name: string | null;

  @Column("varchar", { name: "parent_set_code", nullable: true, length: 45 })
  parentSetCode: string | null;

  @Column("varchar", { name: "parent_set_name", nullable: true, length: 45 })
  parentSetName: string | null;

  @Column("varchar", {
    name: "status",
    nullable: true,
    comment: "状态 空停用 1启用 2停用",
    length: 45,
  })
  status: string | null;

  @Column("datetime", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("datetime", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("int", { name: "created_user_id", nullable: true })
  createdUserId: number | null;

  @Column("varchar", { name: "created_user_name", nullable: true, length: 45 })
  createdUserName: string | null;

  @Column("int", { name: "updated_user_id", nullable: true })
  updatedUserId: number | null;

  @Column("varchar", { name: "updated_user_name", nullable: true, length: 45 })
  updatedUserName: string | null;
}
