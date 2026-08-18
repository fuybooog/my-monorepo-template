import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('v3_cos', { schema: 'mydb' })
export class V3Cos {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', comment: '主键' })
  id: string

  @Column('varchar', {
    name: 'bucket',
    nullable: true,
    comment: '存储桶',
    length: 100,
  })
  bucket: string | null

  @Column('varchar', {
    name: 'obj_key',
    nullable: true,
    comment: '对象key',
    length: 512,
  })
  objKey: string | null

  @Column('varchar', {
    name: 'file_id',
    nullable: true,
    comment: '文件id',
    length: 32,
  })
  fileId: string | null

  @Column('varchar', {
    name: 'type',
    nullable: true,
    comment: '存储类型 AWZ',
    length: 16,
  })
  type: string | null

  @Column('varchar', {
    name: 'file_name',
    nullable: true,
    comment: '文件名',
    length: 256,
  })
  fileName: string | null

  @Column('varchar', {
    name: 'tenant_id',
    nullable: true,
    comment: '租户ID',
    length: 100,
  })
  tenantId: string | null

  @Column('varchar', {
    name: 'org_id',
    nullable: true,
    comment: '机构ID',
    length: 100,
  })
  orgId: string | null

  @Column('tinyint', {
    name: 'del_flag',
    comment: '删除状态：0=否，1=是',
    default: () => "'0'",
  })
  delFlag: number

  @Column('int', {
    name: 'upload_flag',
    comment: '上传到S3标记 0 未上传 1 已上传',
    default: () => "'0'",
  })
  uploadFlag: number

  @Column('varchar', {
    name: 'business',
    nullable: true,
    comment: '业务域',
    length: 32,
  })
  business: string | null

  @Column('varchar', {
    name: 'content_type',
    nullable: true,
    comment: '文档类型',
    length: 100,
  })
  contentType: string | null

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    comment: '创建时间',
  })
  createdAt: Date | null

  @Column('datetime', {
    name: 'updated_at',
    nullable: true,
    comment: '更新时间',
  })
  updatedAt: Date | null
}
