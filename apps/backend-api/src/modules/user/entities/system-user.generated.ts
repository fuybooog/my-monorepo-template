/**
 * 🚨🚨🚨 WARNING 🚨🚨🚨
 * 该文件由脚本 db-sync.ts 自动生成，请勿手动修改！
 * 如有字段变更，请修改数据库表结构后，重新运行 pnpm db:sync 命令触发覆盖。
 */

import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Index("mobile_UNIQUE", ["mobile"], { unique: true })
@Entity("system_user", { schema: "mydb" })
export class SystemUserGenerated {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "user_name", nullable: true, length: 255 })
  userName: string | null;

  @Column("varchar", {
    name: "nick_name",
    nullable: true,
    comment: "昵称",
    length: 100,
  })
  nickName: string | null;

  @Column("varchar", { name: "password", nullable: true, length: 255 })
  password: string | null;

  @Column("varchar", { name: "gender", nullable: true, length: 2 })
  gender: string | null;

  @Column("varchar", { name: "gender_name", nullable: true, length: 10 })
  genderName: string | null;

  @Column("date", { name: "birth", nullable: true })
  birth: string | null;

  @Column("varchar", {
    name: "mobile",
    nullable: true,
    unique: true,
    length: 45,
  })
  mobile: string | null;

  @Column("varchar", { name: "address", nullable: true, length: 255 })
  address: string | null;

  @Column("varchar", { name: "address_detail", nullable: true, length: 255 })
  addressDetail: string | null;

  @Column("varchar", { name: "marital_status", nullable: true, length: 2 })
  maritalStatus: string | null;

  @Column("varchar", {
    name: "marital_status_name",
    nullable: true,
    length: 45,
  })
  maritalStatusName: string | null;

  @Column("varchar", { name: "email", nullable: true, length: 100 })
  email: string | null;

  @Column("varchar", { name: "status", nullable: true, length: 2 })
  status: string | null;

  @Column("datetime", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("datetime", { name: "updated_at", nullable: true })
  updatedAt: Date | null;
}
