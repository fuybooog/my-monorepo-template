import { Column, Entity } from 'typeorm'

@Entity('mini_family', { schema: 'mydb' })
export class MiniFamily {
  @Column('int', { primary: true, name: 'id' })
  id: number

  @Column('varchar', { name: 'family_id', nullable: true, length: 45 })
  familyId: string | null

  @Column('varchar', { name: 'row_type', nullable: true, length: 45 })
  rowType: string | null

  @Column('varchar', { name: 'field1', nullable: true, length: 100 })
  field1: string | null

  @Column('varchar', { name: 'field2', nullable: true, length: 100 })
  field2: string | null

  @Column('varchar', { name: 'field3', nullable: true, length: 100 })
  field3: string | null

  @Column('varchar', { name: 'field4', nullable: true, length: 100 })
  field4: string | null

  @Column('varchar', { name: 'field5', nullable: true, length: 100 })
  field5: string | null

  @Column('varchar', { name: 'field6', nullable: true, length: 100 })
  field6: string | null

  @Column('varchar', { name: 'field7', nullable: true, length: 100 })
  field7: string | null

  @Column('varchar', { name: 'field8', nullable: true, length: 100 })
  field8: string | null

  @Column('varchar', { name: 'field9', nullable: true, length: 100 })
  field9: string | null

  @Column('varchar', { name: 'field10', nullable: true, length: 100 })
  field10: string | null

  @Column('varchar', { name: 'field11', nullable: true, length: 100 })
  field11: string | null

  @Column('varchar', { name: 'field12', nullable: true, length: 100 })
  field12: string | null

  @Column('varchar', { name: 'field13', nullable: true, length: 100 })
  field13: string | null

  @Column('varchar', { name: 'field14', nullable: true, length: 100 })
  field14: string | null

  @Column('varchar', { name: 'field15', nullable: true, length: 100 })
  field15: string | null

  @Column('varchar', { name: 'field16', nullable: true, length: 100 })
  field16: string | null

  @Column('varchar', { name: 'field17', nullable: true, length: 500 })
  field17: string | null

  @Column('varchar', { name: 'field18', nullable: true, length: 1000 })
  field18: string | null

  @Column('varchar', { name: 'field19', nullable: true, length: 2500 })
  field19: string | null

  @Column('varchar', { name: 'field20', nullable: true, length: 4500 })
  field20: string | null
}
