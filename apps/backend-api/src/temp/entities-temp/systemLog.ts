import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('system_log', { schema: 'mydb' })
export class SystemLog {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number

  @Column('varchar', { name: 'type', nullable: true, length: 45 })
  type: string | null

  @Column('varchar', { name: 'content', nullable: true, length: 450 })
  content: string | null

  @Column('varchar', { name: 'operator', nullable: true, length: 45 })
  operator: string | null

  @Column('datetime', { name: 'createTime', nullable: true })
  createTime: Date | null

  @Column('varchar', { name: 'familyId', nullable: true, length: 45 })
  familyId: string | null

  @Column('varchar', { name: 'ext_1', nullable: true, length: 45 })
  ext_1: string | null

  @Column('varchar', { name: 'ext_2', nullable: true, length: 45 })
  ext_2: string | null

  @Column('varchar', { name: 'ext_3', nullable: true, length: 45 })
  ext_3: string | null

  @Column('varchar', { name: 'ext_4', nullable: true, length: 45 })
  ext_4: string | null

  @Column('varchar', { name: 'ext_5', nullable: true, length: 450 })
  ext_5: string | null
}
