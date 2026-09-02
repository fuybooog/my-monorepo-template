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
@Index('mobile_UNIQUE', ['mobile'], { unique: true })
@Index('IDX_7cf15c28d3b169d685d39cbba2', ['mobile'], { unique: true })
@Entity('system_user', { schema: 'mydb' })
export class UserGenerated {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '用户id' })
  id: number

  @Column('varchar', { name: 'user_name', comment: '用户名', length: 255 })
  userName: string

  @Column('varchar', {
    name: 'nick_name',
    nullable: true,
    comment: '昵称',
    length: 100,
  })
  nickName: string | null

  @Column('varchar', {
    name: 'password',
    nullable: true,
    comment: '密码',
    length: 255,
  })
  password: string | null

  @Column('varchar', {
    name: 'gender',
    nullable: true,
    comment: '性别代码',
    length: 2,
  })
  gender: string | null

  @Column('varchar', {
    name: 'gender_name',
    nullable: true,
    comment: '性别名称',
    length: 10,
  })
  genderName: string | null

  @Column('date', { name: 'birth', nullable: true, comment: '生日' })
  birth: string | null

  @Column('varchar', {
    name: 'mobile',
    nullable: true,
    unique: true,
    comment: '手机号',
    length: 45,
  })
  mobile: string | null

  @Column('varchar', {
    name: 'address',
    nullable: true,
    comment: '地址',
    length: 255,
  })
  address: string | null

  @Column('varchar', {
    name: 'address_detail',
    nullable: true,
    comment: '地址详情',
    length: 255,
  })
  addressDetail: string | null

  @Column('varchar', {
    name: 'marital_status',
    nullable: true,
    comment: '婚姻状况代码',
    length: 2,
  })
  maritalStatus: string | null

  @Column('varchar', {
    name: 'marital_status_name',
    nullable: true,
    comment: '婚姻状况名称',
    length: 45,
  })
  maritalStatusName: string | null

  @Column('varchar', {
    name: 'email',
    nullable: true,
    comment: '邮箱',
    length: 100,
  })
  email: string | null

  @Column('int', {
    name: 'status',
    comment: '状态：0-禁用，1-启用',
  })
  status: number

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', nullable: true })
  createdAt: Date | null

  @UpdateDateColumn({ name: 'updated_at', comment: '修改时间', nullable: true })
  updatedAt: Date | null

  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间', nullable: true })
  deletedAt: Date | null

  @Column('varchar', {
    name: 'pinyin',
    nullable: true,
    comment: '全拼',
    length: 100,
  })
  pinyin: string | null

  @Column('varchar', {
    name: 'py',
    nullable: true,
    comment: '拼音首字母',
    length: 10,
  })
  py: string | null
}
