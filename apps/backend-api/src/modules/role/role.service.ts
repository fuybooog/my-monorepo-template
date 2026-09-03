import {
  Injectable,
  NotFoundException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common'
import dayjs from 'dayjs'

import { RolePageRespDto } from '@/modules/role/dto/role.page.resp.dto'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { RolePageOptionDto } from '@/modules/role/dto/role.page.option.dto'
import { RoleRespDto } from '@/modules/role/dto/role.resp.dto'
import { RoleListRespDto } from '@/modules/role/dto/role.list.resp.dto'
import { RoleCreateDto } from '@/modules/role/dto/role.create.dto'
import { RoleUpdateDto } from '@/modules/role/dto/role.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { RoleRepository } from '@/modules/role/role.repository'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogAction, OperationLogLevel } from '@/modules/operation-log/operation-log.types'
import { buildCreatedChanges, buildFieldChanges } from '@/modules/operation-log/log-diff'
import { ROLE_FIELD_META } from '@/modules/role/role.field-meta'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { Role } from '@/modules/role/entities/role.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'
import { MAX_ROLE_LEVEL } from '@/constants'
import { ExcelService } from '@/modules/excel/excel.service'
import { EXCEL_CONTENT_TYPE, ExcelUploadFile, ImportRowResult } from '@/modules/excel/excel.types'
import { ImportFailedRowDto, ImportResultDto } from '@/modules/excel/dto/import-result.dto'
import {
  ROLE_EXPORT_COLUMNS,
  ROLE_IMPORT_DEF,
  RoleExportRow,
} from '@/modules/role/role.import-export'

@Injectable()
export class RoleService {
  static readonly SEARCHABLE_FIELDS = ['roleName, roleCode']
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly dataSource: DataSource,
    private readonly excelService: ExcelService,
    private readonly operationLogService: OperationLogService,
  ) {}
  async pageRole(
    rolePageDto: RolePageDto,
    maxLevel?: number,
  ): Promise<PaginatedResult<RolePageRespDto>> {
    const { list: entities, total } = await this.roleRepository.searchRolesByPage(
      rolePageDto,
      maxLevel,
    )
    const list = plainToInstance(RolePageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: rolePageDto.page,
      pageSize: rolePageDto.pageSize,
    }
  }
  async pageOptionRole(
    rolePageOptionDto: RolePageOptionDto,
    user: CurrentLoginResponseDto,
  ): Promise<PaginatedResult<RolePageRespDto>> {
    const { keyword, fields, page, pageSize, userId } = rolePageOptionDto
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `role.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = RoleService.SEARCHABLE_FIELDS.map((item) => `role.${item} LIKE :keyword`).join(
        ' OR ',
      )
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    if (userId) {
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM system_user_role userRole WHERE userRole.role_id = role.id AND userRole.user_id = :userId)`,
        { userId },
      )
    }
    queryBuilder.andWhere('role.deletedAt IS NULL')
    if (user.maxLevel !== MAX_ROLE_LEVEL) {
      queryBuilder.andWhere('role.level < :maxLevel', {
        maxLevel: user.maxLevel,
      })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize).orderBy('role.id', 'ASC')
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(RolePageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findRoleById(id: number): Promise<RoleRespDto | null> {
    return await this.dataSource.transaction(async (manager) => {
      // 直接用 repository 中的 api 进行查询
      const roleEntity = await this.roleRepository.findOne({
        where: { id },
      })
      if (!roleEntity) {
        throw new NotFoundException(`未找到id为${id}的角色`)
      }
      // 将关联的资源ids和用户ids查出来
      const resourceIds = await this.roleRepository.getResourceIdsByRoleId(id, manager)
      const userIds = await this.roleRepository.getUserIdsByRoleId(id, manager)
      return plainToInstance(
        RoleRespDto,
        {
          ...roleEntity,
          resourceIds: resourceIds.join(','),
          userIds: userIds.join(','),
        },
        { excludeExtraneousValues: true },
      )
    })
  }
  async findRoleListByIds(ids: string): Promise<RoleListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<Role> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.roleRepository.find(findOptions)
    const list = plainToInstance(RoleRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((role) => role.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createRole(roleCreateDto: RoleCreateDto, maxLevel: number): Promise<RoleRespDto | null> {
    // 角色的等级无法超过当前操作人的角色等级
    if (roleCreateDto.level && roleCreateDto.level >= maxLevel) {
      throw new UnauthorizedException('权限不足，无法创建角色等级过高的角色')
    }
    return await this.dataSource
      .transaction(async (manager) => {
        try {
          const roleEntity = await this.roleRepository.createRole(roleCreateDto, manager)

          if (roleCreateDto.userIds) {
            const userIdList = roleCreateDto.userIds.split(',').map((id) => Number.parseInt(id))
            await this.roleRepository.assignUsersToRole(roleEntity.id, userIdList, manager)
          }

          if (roleCreateDto.resourceIds) {
            const resourceIdsList = roleCreateDto.resourceIds
              .split(',')
              .map((id) => Number.parseInt(id))
            await this.roleRepository.assignResourcesToRole(roleEntity, resourceIdsList, manager)
          }
          return roleEntity
        } catch (e) {
          console.log('创建角色失败', e)
          throw e
        }
      })
      .then(async (roleEntity) => {
        await this.operationLogService.record({
          module: 'role',
          businessId: roleEntity.id,
          businessText: this.roleBusinessText(roleEntity),
          operationType: OperationLogAction.CREATE,
          changes: buildCreatedChanges(
            roleCreateDto as unknown as Record<string, unknown>,
            ROLE_FIELD_META,
          ),
        })
        return roleEntity
      })
  }
  async updateRole(
    id: number,
    roleUpdateDto: RoleUpdateDto,
    user: CurrentLoginResponseDto,
  ): Promise<RoleRespDto | null> {
    if (roleUpdateDto.level && roleUpdateDto.level >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法修改角色等级过高的角色')
    }
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    if (roleEntity.level && roleEntity.level >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法修改角色等级过高的角色')
    }
    // 埋点用：更新前的成员/资源快照（不传对应字段表示不调整，无需快照）
    const oldMemberIds =
      roleUpdateDto.userIds !== undefined ? await this.roleRepository.getUserIdsByRoleId(id) : null
    const oldResourceIds =
      roleUpdateDto.resourceIds !== undefined
        ? await this.roleRepository.getResourceIdsByRoleId(id)
        : null

    return await this.dataSource
      .transaction(async (manager) => {
        const updatedRoleEntity = await this.roleRepository.updateRole(
          roleEntity,
          roleUpdateDto,
          manager,
        )
        // 当 roleUpdateDto.userIds 为 空字符串时，表示清空当前角色下的所有用户，不传 userIds 表示不修改当前角色下的用户
        if (roleUpdateDto.userIds !== undefined) {
          const userIdList = roleUpdateDto.userIds
            ? roleUpdateDto.userIds.split(',').map((id) => Number.parseInt(id))
            : []
          // 先查询当前角色下的所有userId，对比差异，删除不在userIdList中的用户，新增在userIdList中但不在当前角色下的用户
          const roleUserIds: number[] = await this.roleRepository.getUserIdsByRoleId(id, manager)
          const userIdsToRemove = roleUserIds.filter((userId) => !userIdList.includes(userId))
          const userIdsToAdd = userIdList.filter((userId) => !roleUserIds.includes(userId))
          if (userIdsToRemove.length > 0) {
            await this.roleRepository.removeUsersFromRole(
              updatedRoleEntity.id!,
              userIdsToRemove,
              manager,
            )
          }
          if (userIdsToAdd.length > 0) {
            await this.roleRepository.assignUsersToRole(updatedRoleEntity.id, userIdsToAdd, manager)
          }
        }
        // 当 roleUpdateDto.resourceIds 为 空字符串时，表示清空当前角色下的所有资源，不传 resourceIds 表示不修改当前角色下的资源
        if (roleUpdateDto.resourceIds !== undefined) {
          const resourceIdsList = roleUpdateDto.resourceIds
            ? roleUpdateDto.resourceIds.split(',').map((id) => Number.parseInt(id))
            : []
          // 先查询当前角色下所有的resourceId，对比差异，删除不在resourceIdsList中的资源，新增在resourceIdsList中但不在当前角色下的资源
          const roleResourceIds: number[] = await this.roleRepository.getResourceIdsByRoleId(
            id,
            manager,
          )
          const resourceIdsToRemove = roleResourceIds.filter(
            (resourceId) => !resourceIdsList.includes(resourceId),
          )
          const resourceIdsToAdd = resourceIdsList.filter(
            (resourceId) => !roleResourceIds.includes(resourceId),
          )
          if (resourceIdsToRemove.length > 0) {
            await this.roleRepository.removeResourcesFromRole(
              updatedRoleEntity.id!,
              resourceIdsToRemove,
              manager,
            )
          }
          if (resourceIdsToAdd.length > 0) {
            await this.roleRepository.assignResourcesToRole(
              updatedRoleEntity,
              resourceIdsToAdd,
              manager,
            )
          }
        }
        return updatedRoleEntity
      })
      .then(async (updatedRoleEntity) => {
        const changes = buildFieldChanges(
          roleUpdateDto as unknown as Record<string, unknown>,
          roleEntity as unknown as Record<string, unknown>,
          ROLE_FIELD_META,
        )
        // 成员/权限维度变化（不传 userIds/resourceIds 视为未调整）
        if (oldMemberIds !== null) {
          const userIdList = roleUpdateDto.userIds
            ? roleUpdateDto.userIds.split(',').map((id) => Number.parseInt(id))
            : []
          changes.push({
            field: 'members',
            fieldText: '成员用户',
            oldValue: oldMemberIds,
            newValue: userIdList,
            oldText:
              oldMemberIds.length > 0
                ? `原 ${oldMemberIds.length} 人（#${oldMemberIds.join('、#')}）`
                : '无',
            newText:
              userIdList.length > 0
                ? `调整为 ${userIdList.length} 人（#${userIdList.join('、#')}）`
                : '已清空',
          })
        }
        if (oldResourceIds !== null) {
          const resourceIdsList = roleUpdateDto.resourceIds
            ? roleUpdateDto.resourceIds.split(',').map((id) => Number.parseInt(id))
            : []
          changes.push({
            field: 'permissions',
            fieldText: '授权资源',
            oldValue: oldResourceIds,
            newValue: resourceIdsList,
            oldText: oldResourceIds.length > 0 ? `原 ${oldResourceIds.length} 项` : '无',
            newText: resourceIdsList.length > 0 ? `调整为 ${resourceIdsList.length} 项` : '已清空',
          })
        }
        if (changes.length > 0) {
          await this.operationLogService.record({
            module: 'role',
            businessId: id,
            businessText: this.roleBusinessText(roleEntity),
            operationType: OperationLogAction.UPDATE,
            changes,
          })
        }
        return updatedRoleEntity
      })
  }
  async removeRole(id: number, user: CurrentLoginResponseDto): Promise<null> {
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    if (roleEntity.level && roleEntity.level >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法删除角色等级过高的角色')
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.roleRepository.removeRole(roleEntity, manager)
        return null
      })
      .then(async (result) => {
        await this.operationLogService.record({
          module: 'role',
          businessId: id,
          businessText: this.roleBusinessText(roleEntity),
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async batchRemoveRole(ids: string, user: CurrentLoginResponseDto): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const roles = await this.roleRepository.find({ where: { id: In(idList) } })
    const maxLevel = Math.max(...roles.map((role) => role.level))
    if (maxLevel >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法删除角色等级过高的角色')
    }
    let missingIds: number[] = []
    if (roles.length !== ids.length) {
      missingIds = idList.filter((id) => !roles.some((role) => role.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.roleRepository.batchRemoveRole(roles, manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = roles.map((role) => this.roleBusinessText(role)).join('、')
        await this.operationLogService.record({
          module: 'role',
          businessText: `共 ${roles.length} 个角色（${listText.slice(0, 200)}）`,
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async updateRoleStatus(
    id: number,
    roleUpdateDto: UpdateStatusDto,
    user: CurrentLoginResponseDto,
  ): Promise<null> {
    const roleEntity = await this.roleRepository.findOne({
      where: { id },
    })
    if (!roleEntity) {
      throw new BusinessException(`未找到id为${id}的角色`)
    }
    if (roleEntity.level >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法修改角色等级过高的角色')
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.roleRepository.updateRoleStatus(roleEntity, roleUpdateDto.status, manager)
        return null
      })
      .then(async (result) => {
        await this.operationLogService.record({
          module: 'role',
          businessId: id,
          businessText: this.roleBusinessText(roleEntity),
          operationType:
            roleUpdateDto.status === 1 ? OperationLogAction.ENABLE : OperationLogAction.DISABLE,
          changes: buildFieldChanges(
            { status: roleUpdateDto.status },
            roleEntity as unknown as Record<string, unknown>,
            ROLE_FIELD_META,
          ),
        })
        return result
      })
  }
  async batchUpdateRoleStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
    user: CurrentLoginResponseDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const roles = await this.roleRepository.find({ where: { id: In(idList) } })
    const maxLevel = Math.max(...roles.map((role) => role.level))
    if (maxLevel >= user.maxLevel) {
      throw new UnauthorizedException('权限不足，无法修改角色等级过高的角色')
    }
    let missingIds: number[] = []
    if (roles.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !roles.some((role) => role.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.roleRepository.batchUpdateRoleStatus(roles, batchUpdateStatusDto.status, manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = roles.map((role) => this.roleBusinessText(role)).join('、')
        await this.operationLogService.record({
          module: 'role',
          businessText: `共 ${roles.length} 个角色（${listText.slice(0, 200)}）`,
          operationType:
            batchUpdateStatusDto.status === 1
              ? OperationLogAction.ENABLE
              : OperationLogAction.DISABLE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }

  /** 下载角色导入模板 */
  async downloadTemplate(): Promise<StreamableFile> {
    const buffer = await this.excelService.buildImportTemplate(ROLE_IMPORT_DEF)
    return this.toExcelStream(buffer, `${ROLE_IMPORT_DEF.fileName}.xlsx`)
  }

  /**
   * 导入角色（部分成功语义：失败行不影响已成功行落库）。
   * maxLevel：当前登录账号的角色等级，导入行的等级必须小于该值（与新建角色权限一致）。
   */
  async importRole(
    file: ExcelUploadFile | undefined,
    maxLevel = MAX_ROLE_LEVEL,
  ): Promise<ImportResultDto> {
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BusinessException('请选择要导入的 .xlsx 文件')
    }
    const parsed = await this.excelService.parseImportFile(ROLE_IMPORT_DEF, file.buffer)
    if (parsed.headerErrors.length > 0) {
      throw new BusinessException(parsed.headerErrors.join('；'))
    }
    const rows = parsed.rows
    if (rows.length === 0) {
      throw new BusinessException('文件中没有可导入的数据行')
    }

    this.checkImportLevel(rows, maxLevel)
    await this.checkImportUniqueness(rows)

    const validRows = rows.filter((row) => Object.keys(row.errors).length === 0)
    let successCount = 0
    if (validRows.length > 0) {
      await this.dataSource.transaction(async (manager) => {
        for (const row of validRows) {
          try {
            const levelRaw = String(row.values.level ?? '').trim()
            const role = manager.create(Role, {
              roleCode: String(row.values.roleCode ?? '').trim(),
              roleName: String(row.values.roleName ?? '').trim(),
              level: levelRaw ? Number(levelRaw) : undefined,
              status: row.values.status === 0 ? 0 : 1,
            })
            await manager.save(Role, role)
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

    await this.operationLogService.record({
      module: 'role',
      businessText: `角色导入（共 ${rows.length} 行，成功 ${successCount}，失败 ${failedRows.length}）`,
      operationType: OperationLogAction.IMPORT,
      level: failedRows.length > 0 ? OperationLogLevel.WARN : OperationLogLevel.INFO,
    })

    return {
      total: rows.length,
      successCount,
      failCount: failedRows.length,
      failedRows,
    }
  }

  /** 导出角色（查询条件与列表一致，含当前账号等级权限过滤，循环翻页取全量） */
  async exportRole(query: RolePageDto, maxLevel = MAX_ROLE_LEVEL): Promise<StreamableFile> {
    const pageSize = 500
    const all: Role[] = []
    for (let page = 1; ; page += 1) {
      const { list } = await this.roleRepository.searchRolesByPage(
        { ...query, page, pageSize },
        maxLevel,
      )
      all.push(...list)
      if (list.length < pageSize) break
    }
    const rows: RoleExportRow[] = all.map((role) => ({
      id: role.id,
      roleCode: role.roleCode ?? '',
      roleName: role.roleName ?? '',
      level: role.level != null ? String(role.level) : '',
      statusText: role.status === 0 ? '禁用' : '启用',
      createdAtText: role.createdAt ? dayjs(role.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    }))
    const buffer = await this.excelService.buildExportBuffer('角色数据', ROLE_EXPORT_COLUMNS, rows)
    const fileName = `角色列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    await this.operationLogService.record({
      module: 'role',
      businessText: `导出角色 ${all.length} 条`,
      operationType: OperationLogAction.EXPORT,
    })
    return this.toExcelStream(buffer, fileName)
  }

  /** 日志业务对象描述：角色 #3 运营专员 */
  private roleBusinessText(role: Pick<Role, 'id' | 'roleName'>): string {
    return `角色 #${role.id} ${role.roleName ?? ''}`.trim()
  }

  /** 校验导入行的角色等级：须为小于当前账号角色等级的正整数 */
  private checkImportLevel(rows: ImportRowResult[], maxLevel: number): void {
    for (const row of rows) {
      const levelRaw = String(row.values.level ?? '').trim()
      if (!levelRaw) continue
      const level = Number(levelRaw)
      if (!Number.isInteger(level) || level < 1 || level >= maxLevel) {
        row.errors['角色等级'] = '角色等级须为小于当前账号角色等级的正整数'
      }
    }
  }

  /** 文件内与库内唯一性校验：角色编码、角色名称 */
  private async checkImportUniqueness(rows: ImportRowResult[]): Promise<void> {
    const fileSeen = new Map<string, number>()
    for (const row of rows) {
      const roleCode = String(row.values.roleCode ?? '').trim()
      const roleName = String(row.values.roleName ?? '').trim()
      for (const [value, header] of [
        [roleCode, '角色编码'],
        [roleName, '角色名称'],
      ] as const) {
        if (!value) continue
        if (fileSeen.has(value)) {
          row.errors[header] = `${header}「${value}」与文件内第 ${fileSeen.get(value)} 行重复`
        } else {
          fileSeen.set(value, row.rowNo)
        }
      }
    }
    const keys = [...fileSeen.keys()]
    if (keys.length === 0) return
    const exists = await this.roleRepository
      .createQueryBuilder('role')
      .select(['role.roleCode', 'role.roleName'])
      .where('role.roleCode IN (:...codes)', { codes: keys })
      .orWhere('role.roleName IN (:...names)', { names: keys })
      .getMany()
    if (exists.length === 0) return
    const existCodes = new Set(exists.map((r) => r.roleCode))
    const existNames = new Set(exists.map((r) => r.roleName))
    for (const row of rows) {
      const roleCode = String(row.values.roleCode ?? '').trim()
      if (roleCode && existCodes.has(roleCode)) {
        row.errors['角色编码'] = `角色编码「${roleCode}」与系统中已有数据重复`
      }
      const roleName = String(row.values.roleName ?? '').trim()
      if (roleName && existNames.has(roleName)) {
        row.errors['角色名称'] = `角色名称「${roleName}」与系统中已有数据重复`
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
  async getResourceIdsByRoleIds(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) return []
    const resourceIds = await this.roleRepository.getResourceIdsByRoleIds(roleIds)
    return resourceIds
  }
}
