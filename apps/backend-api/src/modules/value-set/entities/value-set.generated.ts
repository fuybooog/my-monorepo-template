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
@Index('set_code', ['setCode', 'code'], { unique: true })
@Entity('system_value_set', { schema: 'mydb' })
export class ValueSetGenerated {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '字典id' })
  id: number

  @Column('varchar', { name: 'set_code', comment: '集编码', length: 45 })
  setCode: string

  @Column('varchar', { name: 'set_name', comment: '集名称', length: 45 })
  setName: string

  @Column('varchar', { name: 'code', comment: '字典编码', length: 45 })
  code: string

  @Column('varchar', { name: 'name', comment: '字典名称', length: 45 })
  name: string

  @Column('varchar', {
    name: 'parent_set_code',
    nullable: true,
    comment: '父编码',
    length: 45,
  })
  parentSetCode: string | null

  @Column('varchar', {
    name: 'parent_set_name',
    nullable: true,
    comment: '父名称',
    length: 45,
  })
  parentSetName: string | null

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', nullable: true })
  createdAt: Date | null

  @UpdateDateColumn({ name: 'updated_at', comment: '修改时间', nullable: true })
  updatedAt: Date | null

  @Column('int', {
    name: 'created_user_id',
    nullable: true,
    comment: '创建人id',
  })
  createdUserId: number | null

  @Column('varchar', {
    name: 'created_user_name',
    nullable: true,
    comment: '创建人名称',
    length: 45,
  })
  createdUserName: string | null

  @Column('int', {
    name: 'updated_user_id',
    nullable: true,
    comment: '修改人id',
  })
  updatedUserId: number | null

  @Column('varchar', {
    name: 'updated_user_name',
    nullable: true,
    comment: '修改人姓名',
    length: 45,
  })
  updatedUserName: string | null

  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间', nullable: true })
  deletedAt: Date | null

  @Column('int', {
    name: 'status',
    comment: '状态：0-禁用，1-启用',
    default: () => "'1'",
  })
  status: number

  @Column('int', { name: 'sort_number', nullable: true, comment: '排序号' })
  sortNumber: number | null
}
