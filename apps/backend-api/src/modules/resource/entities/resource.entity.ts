import { Entity } from 'typeorm'
import { ResourceGenerated } from '@/modules/resource/entities/resource.generated'

@Entity('system_resource')
export class Resource extends ResourceGenerated {}
