import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('v3_news', { schema: 'mydb' })
export class V3News {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string

  @Column('varchar', { name: 'title', length: 100 })
  title: string

  @Column('varchar', { name: 'summary', nullable: true, length: 300 })
  summary: string | null

  @Column('text', {
    name: 'content',
    nullable: true,
    comment: '内容，HTML，或纯文本，或空，为空时，文章以其他形式展现',
  })
  content: string | null

  @Column('varchar', {
    name: 'cover_image',
    nullable: true,
    comment: '封面图片文件ID',
    length: 100,
  })
  coverImage: string | null

  @Column('datetime', {
    name: 'publish_date',
    nullable: true,
    comment: '发布时间',
  })
  publishDate: Date | null

  @Column('tinyint', {
    name: 'status',
    nullable: true,
    comment: '0: 草稿；1: 发布；2: 下架',
  })
  status: number | null

  @Column('bigint', {
    name: 'view_count',
    nullable: true,
    comment: '浏览量',
    default: () => "'0'",
  })
  viewCount: string | null

  @Column('datetime', { name: 'created_at', nullable: true })
  createdAt: Date | null

  @Column('datetime', { name: 'updated_at', nullable: true })
  updatedAt: Date | null

  @Column('varchar', {
    name: 'author',
    nullable: true,
    comment: '作者/署名',
    length: 100,
  })
  author: string | null

  @Column('varchar', {
    name: 'type',
    nullable: true,
    comment: '取值集 V3_NEWS_TYPE',
    length: 100,
  })
  type: string | null

  @Column('varchar', {
    name: 'remark',
    nullable: true,
    comment: '备注；下架原因；',
    length: 200,
  })
  remark: string | null

  @Column('varchar', {
    name: 'created_by_id',
    nullable: true,
    comment: '创建人id',
    length: 100,
  })
  createdById: string | null

  @Column('varchar', {
    name: 'created_by_name',
    nullable: true,
    comment: '创建人姓名',
    length: 100,
  })
  createdByName: string | null

  @Column('varchar', {
    name: 'updated_by_id',
    nullable: true,
    comment: '修改人id',
    length: 100,
  })
  updatedById: string | null

  @Column('varchar', {
    name: 'updated_by_name',
    nullable: true,
    comment: '修改人姓名',
    length: 100,
  })
  updatedByName: string | null

  @Column('varchar', {
    name: 'field1',
    nullable: true,
    comment: '扩展字段1',
    length: 1000,
  })
  field1: string | null

  @Column('varchar', {
    name: 'field2',
    nullable: true,
    comment: '扩展字段2',
    length: 1000,
  })
  field2: string | null

  @Column('text', {
    name: 'field3',
    nullable: true,
    comment: '扩展字段3，存储json数据',
  })
  field3: string | null
}
