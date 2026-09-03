/**
 * FBI WARNING
 * 该文件由脚本 db-sync.ts 自动生成，请勿手动修改！
 * 如有字段变更，请修改数据库表结构后，重新运行 pnpm db:sync 命令触发覆盖。
 */

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('system_operation_log', { schema: 'mydb' })
export class OperationLogGenerated {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '操作日志id' })
  id: number

  @Column('tinyint', {
    name: 'log_level',
    comment: '日志级别：1-INFO，2-WARN，3-ERROR',
    default: () => "'1'",
  })
  logLevel: number

  @Column('varchar', {
    name: 'module',
    comment: '业务模块编码：user/role/resource/value-set/operation-log',
    length: 45,
  })
  module: string

  @Column('varchar', {
    name: 'module_text',
    comment: '业务模块名称（冗余，防字典变更影响历史）',
    length: 45,
  })
  moduleText: string

  @Column('int', {
    name: 'business_id',
    nullable: true,
    comment: '业务对象id（如用户id；登录等无对象为NULL）',
  })
  businessId: number | null

  @Column('varchar', {
    name: 'business_text',
    comment: '业务对象描述（如：用户 #5 王五）',
    length: 255,
  })
  businessText: string

  @Column('varchar', {
    name: 'operation_type',
    comment: '操作类型：CREATE/UPDATE/DELETE/ENABLE/DISABLE/ASSIGN/RESET_PWD/IMPORT/EXPORT/OTHER',
    length: 20,
  })
  operationType: string

  @Column('varchar', {
    name: 'operation_text',
    comment: '操作类型中文（冗余）：新增/修改/删除...',
    length: 45,
  })
  operationText: string

  @Column('int', { name: 'operator_id', comment: '操作人id（系统任务为0）' })
  operatorId: number

  @Column('varchar', {
    name: 'operator_name',
    comment: '操作人用户名',
    length: 45,
  })
  operatorName: string

  @Column('varchar', {
    name: 'operator_ip',
    nullable: true,
    comment: '操作人IP',
    length: 45,
  })
  operatorIp: string | null

  @Column('varchar', {
    name: 'summary',
    comment: '人话摘要，如：张三 修改了 用户 #5 王五 的昵称',
    length: 500,
  })
  summary: string

  @Column('json', {
    name: 'detail_json',
    nullable: true,
    comment: '字段级变更明细 JSON',
  })
  detailJson: object | null

  @Column('varchar', {
    name: 'request_uri',
    nullable: true,
    comment: '请求路径',
    length: 255,
  })
  requestUri: string | null

  @Column('varchar', {
    name: 'request_method',
    nullable: true,
    comment: '请求方法',
    length: 10,
  })
  requestMethod: string | null

  @CreateDateColumn({ name: 'created_at', comment: '创建时间', nullable: true })
  createdAt: Date | null
}
