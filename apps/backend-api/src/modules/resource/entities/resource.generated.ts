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
@Index('unique_prop_UNIQUE', ['uniqueProp'], { unique: true })
@Index('IDX_104384fbef74170d03b895cc24', ['uniqueProp'], { unique: true })
@Entity('system_resource', { schema: 'mydb' })
export class ResourceGenerated {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '资源id' })
  id: number

  @Column('varchar', {
    name: 'label',
    nullable: true,
    comment: '资源名称',
    length: 100,
  })
  label: string | null

  @Column('varchar', {
    name: 'unique_prop',
    nullable: true,
    unique: true,
    comment: '唯一编码',
    length: 100,
  })
  uniqueProp: string | null

  @Column('varchar', {
    name: 'parent_unique_prop',
    nullable: true,
    comment: '唯一父编码',
    length: 100,
  })
  parentUniqueProp: string | null

  @Column('varchar', {
    name: 'status',
    nullable: true,
    comment: '状态：0-禁用，1-启用',
    length: 2,
  })
  status: string | null

  @Column('varchar', {
    name: 'type',
    nullable: true,
    comment: '资源类型：0-目录 1-页面 2-按钮 3-列',
    length: 2,
  })
  type: string | null

  @Column('varchar', {
    name: 'menu_path',
    nullable: true,
    comment: '菜单路径',
    length: 100,
  })
  menuPath: string | null

  @Column('varchar', {
    name: 'not_in_menu',
    nullable: true,
    comment: '是否在菜单中显示，默认为空，表示显示，设置为1时表示不显示',
    length: 2,
  })
  notInMenu: string | null

  @Column('int', { name: 'sort_number', nullable: true, comment: '排序号' })
  sortNumber: number | null

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', nullable: true })
  createdAt: Date | null

  @UpdateDateColumn({ name: 'updated_at', comment: '修改时间', nullable: true })
  updatedAt: Date | null

  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间', nullable: true })
  deletedAt: Date | null
}
