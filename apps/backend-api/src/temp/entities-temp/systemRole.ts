import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Index('id_UNIQUE', ['id'], { unique: true })
@Index('role_name_UNIQUE', ['roleName'], { unique: true })
@Index('IDX_dd20796fc381f5b9e73bb093a4', ['roleName'], { unique: true })
@Index('IDX_cd5fa36c162068fe234656a7f0', ['roleCode'], { unique: true })
@Index('role_code_UNIQUE', ['roleCode'], { unique: true })
@Entity('system_role', { schema: 'mydb' })
export class SystemRole {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '角色id' })
  id: number

  @Column('varchar', {
    name: 'role_name',
    unique: true,
    comment: '角色名称',
    length: 45,
  })
  roleName: string

  @Column('int', {
    name: 'status',
    comment: '状态：0-禁用，1-启用',
    default: () => "'1'",
  })
  status: number

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    comment: '创建时间',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt: Date | null

  @Column('datetime', {
    name: 'updated_at',
    nullable: true,
    comment: '修改时间',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  updatedAt: Date | null

  @Column('datetime', {
    name: 'deleted_at',
    nullable: true,
    comment: '删除时间',
  })
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
}
