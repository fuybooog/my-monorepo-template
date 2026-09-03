/**
 * FBI WARNING
 * 该文件由脚本 db-sync.ts 自动生成，请勿手动修改！
 * 如有字段变更，请修改数据库表结构后，重新运行 pnpm db:sync 命令触发覆盖。
 */

import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Index('id_UNIQUE', ['id'], { unique: true })
@Index('role_name_UNIQUE', ['roleName'], { unique: true })
@Index('IDX_dd20796fc381f5b9e73bb093a4', ['roleName'], { unique: true })
@Index('IDX_cd5fa36c162068fe234656a7f0', ['roleCode'], { unique: true })
@Index('role_code_UNIQUE', ['roleCode'], { unique: true })
@Entity('system_role', { schema: 'mydb' })
export class RoleGenerated {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '角色id' })
  id: number

  @Column('varchar', {
    name: 'role_name',
    unique: true,
    comment: '角色名称',
    length: 45,
  })
  roleName: string

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', nullable: true })
  createdAt: Date | null

  @UpdateDateColumn({ name: 'updated_at', comment: '修改时间', nullable: true })
  updatedAt: Date | null

  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间', nullable: true })
  deletedAt: Date | null

  @Column('varchar', {
    name: 'role_code',
    unique: true,
    comment: '角色编码',
    length: 45,
  })
  roleCode: string

  @Column('int', { name: 'level', comment: '角色等级' })
  level: number

  @Column('int', { name: 'status', comment: '状态：0-禁用，1-启用' })
  status: number
}
