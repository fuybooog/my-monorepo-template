import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import dayjs from 'dayjs'

import { ValueSetPageRespDto } from '@/modules/value-set/dto/value-set.page.resp.dto'
import { ValueSetListDto, ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { ValueSetGroupPageDto } from '@/modules/value-set/dto/value-set-set.page.dto'
import { ValueSetGroupPageRespDto } from '@/modules/value-set/dto/value-set-set.page.resp.dto'
import { ValueSetPageOptionDto } from '@/modules/value-set/dto/value-set.page.option.dto'
import { ValueSetRespDto } from '@/modules/value-set/dto/value-set.resp.dto'
import { ValueSetListRespDto } from '@/modules/value-set/dto/value-set.list.resp.dto'
import { ValueSetCreateDto } from '@/modules/value-set/dto/value-set.create.dto'
import { ValueSetUpdateDto } from '@/modules/value-set/dto/value-set.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ValueSetRepository } from '@/modules/value-set/value-set.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { ExcelService } from '@/modules/excel/excel.service'
import { EXCEL_CONTENT_TYPE, ExcelUploadFile, ImportRowResult } from '@/modules/excel/excel.types'
import { ImportFailedRowDto, ImportResultDto } from '@/modules/excel/dto/import-result.dto'
import {
  VALUE_SET_EXPORT_COLUMNS,
  VALUE_SET_IMPORT_DEF,
  ValueSetExportRow,
} from '@/modules/value-set/value-set.import-export'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogAction, OperationLogLevel } from '@/modules/operation-log/operation-log.types'
import { buildCreatedChanges, buildFieldChanges } from '@/modules/operation-log/log-diff'
import { VALUE_SET_FIELD_META } from '@/modules/value-set/value-set.field-meta'

@Injectable()
export class ValueSetService {
  static readonly SEARCHABLE_FIELDS = ['valueSetName']
  constructor(
    private readonly valueSetRepository: ValueSetRepository,
    private readonly dataSource: DataSource,
    private readonly excelService: ExcelService,
    private readonly operationLogService: OperationLogService,
  ) {}
  async pageValueSet(
    valueSetPageDto: ValueSetPageDto,
  ): Promise<PaginatedResult<ValueSetPageRespDto>> {
    const [entities, total] = await this.valueSetRepository.searchValueSetsByPage(valueSetPageDto)
    const list = plainToInstance(ValueSetPageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: valueSetPageDto.page,
      pageSize: valueSetPageDto.pageSize,
    }
  }
  /** 集维度（按 setCode 去重）分页 */
  async pageValueSetGroups(
    valueSetGroupPageDto: ValueSetGroupPageDto,
  ): Promise<PaginatedResult<ValueSetGroupPageRespDto>> {
    const { rows, total } =
      await this.valueSetRepository.searchValueSetGroupsByPage(valueSetGroupPageDto)
    const list = rows.map((row) => ({
      setCode: row.setCode,
      setName: row.setName,
      valueCount: Number(row.valueCount),
      status: Number(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
    return {
      list,
      total,
      page: valueSetGroupPageDto.page,
      pageSize: valueSetGroupPageDto.pageSize,
    }
  }
  async pageOptionValueSet(
    valueSetPageOptionDto: ValueSetPageOptionDto,
  ): Promise<PaginatedResult<ValueSetPageRespDto>> {
    const { keyword, fields, page, pageSize } = valueSetPageOptionDto
    const queryBuilder = this.valueSetRepository.createQueryBuilder('valueSet')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `valueSet.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ValueSetService.SEARCHABLE_FIELDS.map(
        (item) => `valueSet.${item} LIKE :keyword`,
      ).join(' OR ')
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(ValueSetPageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findValueSetById(id: number): Promise<ValueSetRespDto | null> {
    // 直接用 repository 中的 api 进行查询
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new NotFoundException(`未找到id为${id}的值集`)
    }
    return plainToInstance(ValueSetRespDto, valueSetEntity, { excludeExtraneousValues: true })
  }
  async findValueSetListByIds(ids: string): Promise<ValueSetListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<ValueSet> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.valueSetRepository.find(findOptions)
    const list = plainToInstance(ValueSetRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((valueSet) => valueSet.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createValueSet(valueSetCreateDto: ValueSetCreateDto): Promise<ValueSetRespDto | null> {
    // todo 检查是否唯一
    return await this.dataSource
      .transaction(async (manager) => {
        const valueSetEntity = await this.valueSetRepository.createValueSet(
          valueSetCreateDto,
          manager,
        )
        // todo 添加值集角色
        return valueSetEntity
      })
      .then(async (created) => {
        await this.operationLogService.record({
          module: 'value-set',
          businessId: created.id,
          businessText: this.valueSetBusinessText(created),
          operationType: OperationLogAction.CREATE,
          changes: buildCreatedChanges(
            valueSetCreateDto as unknown as Record<string, unknown>,
            VALUE_SET_FIELD_META,
          ),
        })
        return created
      })
  }
  async updateValueSet(
    id: number,
    valueSetUpdateDto: ValueSetUpdateDto,
  ): Promise<ValueSetRespDto | null> {
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new BusinessException(`未找到id为${id}的值集`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        const updatedValueSetEntity = await this.valueSetRepository.updateValueSet(
          valueSetEntity,
          valueSetUpdateDto,
          manager,
        )
        // todo 修改值集角色
        return updatedValueSetEntity
      })
      .then(async (updated) => {
        await this.operationLogService.record({
          module: 'value-set',
          businessId: id,
          businessText: this.valueSetBusinessText(valueSetEntity),
          operationType: OperationLogAction.UPDATE,
          changes: buildFieldChanges(
            valueSetUpdateDto as unknown as Record<string, unknown>,
            valueSetEntity as unknown as Record<string, unknown>,
            VALUE_SET_FIELD_META,
          ),
        })
        return updated
      })
  }
  async removeValueSet(id: number): Promise<null> {
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new BusinessException(`未找到id为${id}的值集`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.valueSetRepository.removeValueSet(valueSetEntity, manager)
        return null
      })
      .then(async () => {
        await this.operationLogService.record({
          module: 'value-set',
          businessId: id,
          businessText: this.valueSetBusinessText(valueSetEntity),
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return null
      })
  }
  async batchRemoveValueSet(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const valueSets = await this.valueSetRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (valueSets.length !== ids.length) {
      missingIds = idList.filter((id) => !valueSets.some((valueSet) => valueSet.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.valueSetRepository.batchRemoveValueSet(valueSets, manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = valueSets.map((valueSet) => this.valueSetBusinessText(valueSet)).join('、')
        await this.operationLogService.record({
          module: 'value-set',
          businessText: `共 ${valueSets.length} 个字典值（${listText.slice(0, 200)}）`,
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async updateValueSetStatus(id: number, valueSetUpdateDto: UpdateStatusDto): Promise<null> {
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new BusinessException(`未找到id为${id}的值集`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.valueSetRepository.updateValueSetStatus(
          valueSetEntity,
          valueSetUpdateDto.status,
          manager,
        )
        return null
      })
      .then(async () => {
        await this.operationLogService.record({
          module: 'value-set',
          businessId: id,
          businessText: this.valueSetBusinessText(valueSetEntity),
          operationType:
            valueSetUpdateDto.status === 1 ? OperationLogAction.ENABLE : OperationLogAction.DISABLE,
          changes: buildFieldChanges(
            valueSetUpdateDto as unknown as Record<string, unknown>,
            valueSetEntity as unknown as Record<string, unknown>,
            VALUE_SET_FIELD_META,
          ),
        })
        return null
      })
  }
  async batchUpdateValueSetStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const valueSets = await this.valueSetRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (valueSets.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !valueSets.some((valueSet) => valueSet.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.valueSetRepository.batchUpdateValueSetStatus(
          valueSets,
          batchUpdateStatusDto.status,
          manager,
        )
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = valueSets.map((valueSet) => this.valueSetBusinessText(valueSet)).join('、')
        await this.operationLogService.record({
          module: 'value-set',
          businessText: `共 ${valueSets.length} 个字典值（${listText.slice(0, 200)}）`,
          operationType:
            batchUpdateStatusDto.status === 1
              ? OperationLogAction.ENABLE
              : OperationLogAction.DISABLE,
        })
        return result
      })
  }

  /** 下载字典值导入模板 */
  async downloadTemplate(): Promise<StreamableFile> {
    const buffer = await this.excelService.buildImportTemplate(VALUE_SET_IMPORT_DEF)
    return this.toExcelStream(buffer, `${VALUE_SET_IMPORT_DEF.fileName}.xlsx`)
  }

  /**
   * 导入字典值（部分成功语义：失败行不影响已成功行落库）。
   * 唯一约束：(setCode, code) 组合在文件中与系统中均须唯一。
   */
  async importValueSet(file: ExcelUploadFile | undefined): Promise<ImportResultDto> {
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BusinessException('请选择要导入的 .xlsx 文件')
    }
    const parsed = await this.excelService.parseImportFile(VALUE_SET_IMPORT_DEF, file.buffer)
    if (parsed.headerErrors.length > 0) {
      throw new BusinessException(parsed.headerErrors.join('；'))
    }
    const rows = parsed.rows
    if (rows.length === 0) {
      throw new BusinessException('文件中没有可导入的数据行')
    }

    await this.checkImportUniqueness(rows)

    const validRows = rows.filter((row) => Object.keys(row.errors).length === 0)
    let successCount = 0
    if (validRows.length > 0) {
      await this.dataSource.transaction(async (manager) => {
        for (const row of validRows) {
          try {
            const sortRaw = String(row.values.sortNumber ?? '').trim()
            const valueSet = manager.create(ValueSet, {
              setCode: String(row.values.setCode ?? '').trim(),
              setName: String(row.values.setName ?? '').trim(),
              code: String(row.values.code ?? '').trim(),
              name: String(row.values.name ?? '').trim(),
              status: row.values.status === 0 ? 0 : 1,
              sortNumber: sortRaw ? Number(sortRaw) : null,
            })
            await manager.save(ValueSet, valueSet)
            successCount += 1
          } catch (error) {
            row.errors['保存'] = error instanceof Error ? error.message : '数据保存失败'
          }
        }
      })
    }

    const failedRows: ImportFailedRowDto[] = rows
      .filter((row) => Object.keys(row.errors).length > 0)
      .sort((a, b) => a.rowNo - b.rowNo)
      .map((row) => ({ rowNo: row.rowNo, errors: row.errors }))

    const failCount = failedRows.length
    await this.operationLogService.record({
      module: 'value-set',
      businessText: `导入字典值：成功 ${successCount} 行，失败 ${failCount} 行`,
      operationType: OperationLogAction.IMPORT,
      level: failCount > 0 ? OperationLogLevel.WARN : OperationLogLevel.INFO,
    })

    return {
      total: rows.length,
      successCount,
      failCount,
      failedRows,
    }
  }

  /** 导出字典值（查询条件与列表一致，循环翻页取全量） */
  async exportValueSet(query: ValueSetPageDto): Promise<StreamableFile> {
    const pageSize = 500
    const all: ValueSet[] = []
    for (let page = 1; ; page += 1) {
      const [list] = await this.valueSetRepository.searchValueSetsByPage({
        ...query,
        page,
        pageSize,
      })
      all.push(...list)
      if (list.length < pageSize) break
    }
    const rows: ValueSetExportRow[] = all.map((item) => ({
      id: item.id,
      setCode: item.setCode ?? '',
      setName: item.setName ?? '',
      code: item.code ?? '',
      name: item.name ?? '',
      statusText: item.status === 0 ? '禁用' : '启用',
      sortNumber: item.sortNumber != null ? String(item.sortNumber) : '',
      createdAtText: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    }))
    const buffer = await this.excelService.buildExportBuffer(
      '字典值数据',
      VALUE_SET_EXPORT_COLUMNS,
      rows,
    )
    const fileName = `字典值列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    await this.operationLogService.record({
      module: 'value-set',
      businessText: `导出字典值 ${rows.length} 条`,
      operationType: OperationLogAction.EXPORT,
    })
    return this.toExcelStream(buffer, fileName)
  }

  /** 文件内与库内 (setCode, code) 组合唯一性校验 */
  private async checkImportUniqueness(rows: ImportRowResult[]): Promise<void> {
    const fileSeen = new Map<string, number>()
    const allCombos: Array<{ setCode: string; code: string }> = []
    for (const row of rows) {
      const setCode = String(row.values.setCode ?? '').trim()
      const code = String(row.values.code ?? '').trim()
      const key = `${setCode}:${code}`
      if (setCode && code) {
        if (fileSeen.has(key)) {
          row.errors['值编码'] =
            `值编码「${code}」与文件内第 ${fileSeen.get(key)} 行在同一集编码下重复`
        } else {
          fileSeen.set(key, row.rowNo)
          allCombos.push({ setCode, code })
        }
      }
    }
    if (allCombos.length === 0) return
    const existRows: Array<{ setCode?: string | null; code?: string | null }> = []
    const setCodes = [...new Set(allCombos.map((combo) => combo.setCode))]
    const chunkSize = 500
    for (let i = 0; i < setCodes.length; i += chunkSize) {
      const chunkCodes = setCodes.slice(i, i + chunkSize)
      const found = await this.valueSetRepository
        .createQueryBuilder('value_set')
        .select(['value_set.setCode', 'value_set.code'])
        .where('value_set.setCode IN (:...setCodes)', { setCodes: chunkCodes })
        .getMany()
      existRows.push(...found)
    }
    if (existRows.length === 0) return
    const existKeys = new Set(existRows.map((r) => `${r.setCode ?? ''}:${r.code ?? ''}`))
    for (const row of rows) {
      const setCode = String(row.values.setCode ?? '').trim()
      const code = String(row.values.code ?? '').trim()
      if (setCode && code && existKeys.has(`${setCode}:${code}`)) {
        row.errors['值编码'] = `值编码「${code}」在集编码「${setCode}」下与系统中已有数据重复`
      }
    }
  }

  /** 生成带附件文件名响应头的文件流 */
  private toExcelStream(buffer: Buffer, fileName: string): StreamableFile {
    return new StreamableFile(buffer, {
      type: EXCEL_CONTENT_TYPE,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    })
  }

  /** 日志业务对象描述：值集 gender：男（M） */
  private valueSetBusinessText(valueSet: {
    id: number
    setCode?: string | null
    code?: string | null
    name?: string | null
  }): string {
    return `值集 ${valueSet.setCode ?? ''}/${valueSet.code ?? ''} ${valueSet.name ?? ''}`.trim()
  }
  async findValueSetBySetCodes(
    valueSetListDto: ValueSetListDto,
  ): Promise<ValueSetListRespDto | null> {
    const setCodeList = valueSetListDto.setCodes.split(',')
    const findOptions: FindManyOptions<ValueSet> = {
      where: {
        setCode: In(setCodeList),
      },
    } as any
    const entities = await this.valueSetRepository.find(findOptions)
    const list = plainToInstance(ValueSetRespDto, entities, { excludeExtraneousValues: true })
    const existSetCodes = new Set(list.map((valueSet) => valueSet.setCode))
    const notFoundIds = setCodeList.filter((setCode) => !existSetCodes.has(setCode))
    return {
      list,
      notFoundIds,
    }
  }
}
