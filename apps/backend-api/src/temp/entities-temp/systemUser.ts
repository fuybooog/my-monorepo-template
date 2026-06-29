import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Index('id_UNIQUE', ['id'], { unique: true })
@Index('mobile_UNIQUE', ['mobile'], { unique: true })
@Index('IDX_7cf15c28d3b169d685d39cbba2', ['mobile'], { unique: true })
@Entity('system_user', { schema: 'mydb' })
export class SystemUser {
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

  @Column('varchar', {
    name: 'status',
    nullable: true,
    comment: '状态：0-禁用，1-启用',
    length: 2,
  })
  status: string | null

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    comment: '创建日期',
  })
  createdAt: Date | null

  @Column('datetime', { name: 'updated_at', nullable: true })
  updatedAt: Date | null
}
