import { Entity } from 'typeorm'
import { ValueSetGenerated } from '@/modules/value-set/entities/value-set.generated'

@Entity('system_value_set')
export class ValueSet extends ValueSetGenerated {}
