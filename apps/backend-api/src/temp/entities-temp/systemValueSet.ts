import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Index('id_UNIQUE', ['id'], { unique: true })
@Index('set_code', ['setCode', 'code'], { unique: true })
@Entity('system_value_set', { schema: 'mydb' })
export class SystemValueSet {
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

  @Column('varchar', {
    name: 'status',
    nullable: true,
    comment: '状态  0-禁用 1-启用',
    length: 45,
  })
  status: string | null

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    comment: '创建时间',
  })
  createdAt: Date | null

  @Column('datetime', {
    name: 'updated_at',
    nullable: true,
    comment: '修改时间',
  })
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

  @Column('varchar', { name: 'updated_user_name', nullable: true, length: 45 })
  updatedUserName: string | null
}
