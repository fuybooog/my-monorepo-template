import { Entity } from 'typeorm'
import { OperationLogGenerated } from '@/modules/operation-log/entities/operation-log.generated'

@Entity('system_operation_log')
export class OperationLog extends OperationLogGenerated {}
