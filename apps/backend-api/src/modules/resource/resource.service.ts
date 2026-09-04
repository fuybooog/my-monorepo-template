import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import dayjs from 'dayjs'

import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.dto'
import { ResourceUpdateDto } from '@/modules/resource/dto/resource.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ResourceRepository } from '@/modules/resource/resource.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In } from 'typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { ListResp } from '@/dto/base.dto'
import { ResourcePartialDto } from './dto/resource.base.dto'
import { ExcelService } from '@/modules/excel/excel.service'
import { EXCEL_CONTENT_TYPE, ExcelUploadFile, ImportRowResult } from '@/modules/excel/excel.types'
import { ImportFailedRowDto, ImportResultDto } from '@/modules/excel/dto/import-result.dto'
import {
  RESOURCE_EXPORT_COLUMNS,
  RESOURCE_IMPORT_DEF,
  RESOURCE_TYPE_TEXT,
  ResourceExportRow,
} from '@/modules/resource/resource.import-export'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogAction, OperationLogLevel } from '@/modules/operation-log/operation-log.types'
import { buildCreatedChanges, buildFieldChanges } from '@/modules/operation-log/log-diff'
import { RESOURCE_FIELD_META } from '@/modules/resource/resource.field-meta'

@Injectable()
export class ResourceService {
  static readonly SEARCHABLE_FIELDS = ['resourceName']
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly dataSource: DataSource,
    private readonly excelService: ExcelService,
    private readonly operationLogService: OperationLogService,
  ) {}
  async pageResource(
    resourcePageDto: ResourcePageDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    const [entities, total] = await this.resourceRepository.searchResourcesByPage(resourcePageDto)
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: resourcePageDto.page,
      pageSize: resourcePageDto.pageSize,
    }
  }
  async listAllResource(resourcePageDto: ResourcePageDto): Promise<ListResp<ResourcePageRespDto>> {
    const [entities] = await this.resourceRepository.searchResources(resourcePageDto)
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
    }
  }
  async listByUser(
    userId: number,
    roleCodes: string[] = [],
    types?: string,
    notInMenu?: number,
  ): Promise<ListResp<ResourcePageRespDto>> {
    // todo 判断userId 若非本人，则必须为管理员
    const [entities] = await this.resourceRepository.searchResourcesByUser(
      userId,
      roleCodes,
      types,
      notInMenu,
    )
    const list = plainToInstance(ResourcePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
    }
  }
  async pageOptionResource(
    resourcePageOptionDto: ResourcePageOptionDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    const { keyword, fields, page, pageSize } = resourcePageOptionDto
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `resource.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ResourceService.SEARCHABLE_FIELDS.map(
        (item) => `resource.${item} LIKE :keyword`,
      ).join(' OR ')
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(ResourcePageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findResourceById(id: number): Promise<ResourceRespDto | null> {
    // 直接用 repository 中的 api 进行查询
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new NotFoundException(`未找到id为${id}的资源`)
    }
    return plainToInstance(ResourceRespDto, resourceEntity, { excludeExtraneousValues: true })
  }
  async findResourceListByIds(ids: string): Promise<ResourceListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<Resource> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.resourceRepository.find(findOptions)
    const list = plainToInstance(ResourceRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((resource) => resource.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createResource(resourceCreateDto: ResourceCreateDto): Promise<ResourceRespDto | null> {
    // todo 检查是否唯一
    const resourceEntity = await this.resourceRepository.findOne({
      where: { uniqueProp: resourceCreateDto.uniqueProp! },
      select: { id: true, deletedAt: true },
      withDeleted: true,
    })
    if (resourceEntity) {
      if (!resourceEntity.deletedAt) {
        throw new BusinessException('uniqueProp 重复，无法新增！')
      }
    }
    return await this.dataSource
      .transaction(async (manager) => {
        let createResourceEntity
        if (resourceEntity) {
          // 将此数据恢复
          createResourceEntity = await this.resourceRepository.updateResource(
            resourceEntity,
            {
              ...resourceCreateDto,
              deletedAt: null,
            },
            manager,
          )
        } else {
          createResourceEntity = await this.resourceRepository.createResource(
            resourceCreateDto,
            manager,
          )
        }
        return createResourceEntity
      })
      .then(async (created) => {
        await this.operationLogService.record({
          module: 'resource',
          businessId: created.id,
          businessText: this.resourceBusinessText(created),
          operationType: OperationLogAction.CREATE,
          changes: buildCreatedChanges(
            resourceCreateDto as unknown as Record<string, unknown>,
            RESOURCE_FIELD_META,
          ),
        })
        return created
      })
  }
  async updateResource(
    id: number,
    resourceUpdateDto: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        const updatedResourceEntity = await this.resourceRepository.updateResource(
          resourceEntity,
          resourceUpdateDto,
          manager,
        )
        // todo 修改资源角色
        return updatedResourceEntity
      })
      .then(async (updated) => {
        await this.operationLogService.record({
          module: 'resource',
          businessId: id,
          businessText: this.resourceBusinessText(resourceEntity),
          operationType: OperationLogAction.UPDATE,
          changes: buildFieldChanges(
            resourceUpdateDto as unknown as Record<string, unknown>,
            resourceEntity as unknown as Record<string, unknown>,
            RESOURCE_FIELD_META,
          ),
        })
        return updated
      })
  }
  async batchUpdateResource(list: ResourcePartialDto[]) {
    if (!list || list.length === 0) {
      throw new BusinessException(`参数list不能为空`)
    }
    const updateItems = list.filter((item) => item.id && item.sortNumber !== undefined)
    const insertItems = list.filter((item) => !item.id)
    const ids = updateItems.map((item) => item.id)
    let invalidIds = []
    if (updateItems.length > 0) {
      const existing = await this.resourceRepository.find({
        where: { id: In(ids) },
        select: { id: true },
      })
      const existingIds = new Set(existing.map((r) => r.id))
      invalidIds = ids.filter((id) => !existingIds.has(id!))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        for (const item of list) {
          if (item.id && item.sortNumber) {
            // 更新顺序
            if (!invalidIds.length) {
              // 有部分资源被删除了，无法批量更新顺序
              await manager.update(Resource, item.id, { sortNumber: item.sortNumber })
            }
          } else {
            await this.resourceRepository.createResource(item, manager)
          }
        }
        let messageList = invalidIds.length ? ['有部分资源被删除了，无法批量更新顺序'] : []
        if (insertItems.length && invalidIds.length) {
          messageList.push('数据插入成功，请手动进行排序')
        }
        return {
          info: messageList.length ? messageList.join('，') : null,
        }
      })
      .then(async (result) => {
        const parts: string[] = []
        if (updateItems.length > 0) parts.push(`调整排序 ${updateItems.length} 项`)
        if (insertItems.length > 0) parts.push(`新增资源 ${insertItems.length} 项`)
        await this.operationLogService.record({
          module: 'resource',
          businessText: `资源列表（${parts.join('；') || '无变更'}）`,
          operationType: OperationLogAction.UPDATE,
        })
        return result
      })
  }
  async removeResource(id: number): Promise<null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.resourceRepository.batchUpdateSortNumber(resourceEntity, manager)
        await this.resourceRepository.removeResource(resourceEntity, manager)
        return null
      })
      .then(async () => {
        await this.operationLogService.record({
          module: 'resource',
          businessId: id,
          businessText: this.resourceBusinessText(resourceEntity),
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return null
      })
  }
  async batchRemoveResource(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const resources = await this.resourceRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (resources.length !== ids.length) {
      missingIds = idList.filter((id) => !resources.some((resource) => resource.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.resourceRepository.batchRemoveResource(resources, manager)
        await this.resourceRepository.resetSortNumber(manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = resources.map((resource) => this.resourceBusinessText(resource)).join('、')
        await this.operationLogService.record({
          module: 'resource',
          businessText: `共 ${resources.length} 个资源（${listText.slice(0, 200)}）`,
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async updateResourceStatus(id: number, resourceUpdateDto: UpdateStatusDto): Promise<null> {
    const resourceEntity = await this.resourceRepository.findOne({
      where: { id },
    })
    if (!resourceEntity) {
      throw new BusinessException(`未找到id为${id}的资源`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.resourceRepository.updateResourceStatus(
          resourceEntity,
          resourceUpdateDto.status,
          manager,
        )
        return null
      })
      .then(async () => {
        await this.operationLogService.record({
          module: 'resource',
          businessId: id,
          businessText: this.resourceBusinessText(resourceEntity),
          operationType:
            resourceUpdateDto.status === 1 ? OperationLogAction.ENABLE : OperationLogAction.DISABLE,
          changes: buildFieldChanges(
            resourceUpdateDto as unknown as Record<string, unknown>,
            resourceEntity as unknown as Record<string, unknown>,
            RESOURCE_FIELD_META,
          ),
        })
        return null
      })
  }
  async batchUpdateResourceStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const resources = await this.resourceRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (resources.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !resources.some((resource) => resource.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.resourceRepository.batchUpdateResourceStatus(
          resources,
          batchUpdateStatusDto.status,
          manager,
        )
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = resources.map((resource) => this.resourceBusinessText(resource)).join('、')
        await this.operationLogService.record({
          module: 'resource',
          businessText: `共 ${resources.length} 个资源（${listText.slice(0, 200)}）`,
          operationType:
            batchUpdateStatusDto.status === 1
              ? OperationLogAction.ENABLE
              : OperationLogAction.DISABLE,
        })
        return result
      })
  }

  async resetResourceListSort() {
    const result = await this.dataSource.transaction(async (manager) => {
      await this.resourceRepository.resetSortNumber(manager)
      return null
    })
    // 重置排序留痕
    await this.operationLogService.record({
      module: 'resource',
      businessText: '重置资源列表排序',
      operationType: OperationLogAction.UPDATE,
    })
    return result
  }

  /** 下载资源导入模板 */
  async downloadTemplate(): Promise<StreamableFile> {
    const buffer = await this.excelService.buildImportTemplate(RESOURCE_IMPORT_DEF)
    return this.toExcelStream(buffer, `${RESOURCE_IMPORT_DEF.fileName}.xlsx`)
  }

  /**
   * 导入资源（部分成功语义：失败行不影响已成功行落库）。
   * 父级资源编码可引用本文件内的行（顺序无关）或系统中已有数据。
   */
  async importResource(file: ExcelUploadFile | undefined): Promise<ImportResultDto> {
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BusinessException('请选择要导入的 .xlsx 文件')
    }
    const parsed = await this.excelService.parseImportFile(RESOURCE_IMPORT_DEF, file.buffer)
    if (parsed.headerErrors.length > 0) {
      throw new BusinessException(parsed.headerErrors.join('；'))
    }
    const rows = parsed.rows
    if (rows.length === 0) {
      throw new BusinessException('文件中没有可导入的数据行')
    }

    await this.checkImportUniqueAndParent(rows)

    const validRows = rows.filter((row) => Object.keys(row.errors).length === 0)
    let successCount = 0
    if (validRows.length > 0) {
      await this.dataSource.transaction(async (manager) => {
        for (const row of validRows) {
          try {
            const sortRaw = String(row.values.sortNumber ?? '').trim()
            const resource = manager.create(Resource, {
              uniqueProp: String(row.values.uniqueProp ?? '').trim(),
              label: String(row.values.label ?? '').trim(),
              parentUniqueProp: String(row.values.parentUniqueProp ?? '').trim() || null,
              type:
                row.values.type === undefined || row.values.type === null
                  ? 1
                  : Number(row.values.type),
              status: row.values.status === 0 ? 0 : 1,
              sortNumber: sortRaw ? Number(sortRaw) : null,
            })
            await manager.save(Resource, resource)
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
      module: 'resource',
      businessText: `导入资源：成功 ${successCount} 行，失败 ${failCount} 行`,
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

  /** 导出资源（查询条件与列表一致，复用无分页查询接口） */
  async exportResource(query: ResourcePageDto): Promise<StreamableFile> {
    const [list] = await this.resourceRepository.searchResources(query)
    const rows: ResourceExportRow[] = list.map((resource) => ({
      id: resource.id,
      uniqueProp: resource.uniqueProp ?? '',
      label: resource.label ?? '',
      parentUniqueProp: resource.parentUniqueProp ?? '',
      typeText: RESOURCE_TYPE_TEXT[resource.type ?? 1] ?? '',
      statusText: resource.status === 0 ? '禁用' : '启用',
      sortNumber: resource.sortNumber != null ? String(resource.sortNumber) : '',
      createdAtText: resource.createdAt
        ? dayjs(resource.createdAt).format('YYYY-MM-DD HH:mm:ss')
        : '',
    }))
    const buffer = await this.excelService.buildExportBuffer(
      '资源数据',
      RESOURCE_EXPORT_COLUMNS,
      rows,
    )
    const fileName = `资源列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    await this.operationLogService.record({
      module: 'resource',
      businessText: `导出资源 ${rows.length} 条`,
      operationType: OperationLogAction.EXPORT,
    })
    return this.toExcelStream(buffer, fileName)
  }

  /** 文件内与库内唯一性校验（资源编码）+ 父级资源编码引用校验（文件内或库内存在） */
  private async checkImportUniqueAndParent(rows: ImportRowResult[]): Promise<void> {
    const fileProps = new Set<string>()
    const fileSeen = new Map<string, number>()
    for (const row of rows) {
      const uniqueProp = String(row.values.uniqueProp ?? '').trim()
      if (!uniqueProp) continue
      if (fileSeen.has(uniqueProp)) {
        row.errors['资源编码'] =
          `资源编码「${uniqueProp}」与文件内第 ${fileSeen.get(uniqueProp)} 行重复`
      } else {
        fileSeen.set(uniqueProp, row.rowNo)
        fileProps.add(uniqueProp)
      }
    }
    const keys = [...fileProps]
    const existProps = new Set<string>()
    if (keys.length > 0) {
      const found = await this.resourceRepository
        .createQueryBuilder('resource')
        .select(['resource.uniqueProp'])
        .where('resource.uniqueProp IN (:...keys)', { keys })
        .getMany()
      for (const item of found) {
        if (item.uniqueProp) existProps.add(item.uniqueProp)
      }
    }
    for (const row of rows) {
      const uniqueProp = String(row.values.uniqueProp ?? '').trim()
      if (uniqueProp && existProps.has(uniqueProp)) {
        row.errors['资源编码'] = `资源编码「${uniqueProp}」与系统中已有数据重复`
      }
      const parent = String(row.values.parentUniqueProp ?? '').trim()
      if (parent && !fileProps.has(parent) && !existProps.has(parent)) {
        row.errors['父级资源编码'] =
          `父级资源编码「${parent}」不存在（须为本文件或系统中已有的资源编码）`
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

  /** 日志业务对象描述：资源 #3 用户管理（sys:user:dir） */
  private resourceBusinessText(resource: Pick<Resource, 'id' | 'label' | 'uniqueProp'>): string {
    return `资源 #${resource.id} ${resource.label ?? ''}（${resource.uniqueProp ?? ''}）`.trim()
  }
}
