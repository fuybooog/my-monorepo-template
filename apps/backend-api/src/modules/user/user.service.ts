import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'

import { UserPageRespDto } from '@/modules/user/dto/user.page.resp.dto'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { UserPageOptionDto } from '@/modules/user/dto/user.page.option.dto'
import { UserRespDto } from '@/modules/user/dto/user.resp.dto'
import { UserListRespDto } from '@/modules/user/dto/user.list.resp.dto'
import { UserCreateDto } from '@/modules/user/dto/user.create.dto'
import { UserUpdateDto } from '@/modules/user/dto/user.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UserRepository } from '@/modules/user/user.repository'
import { plainToInstance } from 'class-transformer'
import { DataSource, FindManyOptions, In, Not } from 'typeorm'
import { User } from '@/modules/user/entities/user.entity'
import { UserCheckUniqueDto } from './dto/user.check.unique.dto'
import { BusinessException } from '@/exceptions/business-exception'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { AdminResetPasswordDto, ResetPasswordDto } from '@/modules/user/dto/user.dto'
import { HelperService } from '@/modules/shared/helper.service'
import bcrypt from 'bcrypt'
import dayjs from 'dayjs'
import { ADMIN_USER_NAME, MAX_ROLE_LEVEL } from '@/constants'
import { ExcelService } from '@/modules/excel/excel.service'
import { ExcelUploadFile, EXCEL_CONTENT_TYPE, ImportRowResult } from '@/modules/excel/excel.types'
import { ImportFailedRowDto, ImportResultDto } from '@/modules/excel/dto/import-result.dto'
import { RoleRepository } from '@/modules/role/role.repository'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogAction, OperationLogLevel } from '@/modules/operation-log/operation-log.types'
import {
  buildChangeSummary,
  buildCreatedChanges,
  buildFieldChanges,
} from '@/modules/operation-log/log-diff'
import { USER_FIELD_META } from '@/modules/user/user.field-meta'
import { USER_EXPORT_COLUMNS, USER_IMPORT_DEF, UserExportRow } from './user.import-export'

/** 导入行（引擎解析结果 + 角色解析附加字段） */
interface ImportUserRow extends ImportRowResult {
  roleIds?: number[]
}

@Injectable()
export class UserService {
  static readonly SEARCHABLE_FIELDS = ['userName', 'mobile', 'pinyin']
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly helperService: HelperService,
    private readonly excelService: ExcelService,
    private readonly roleRepository: RoleRepository,
    private readonly operationLogService: OperationLogService,
  ) {}
  async pageUser(
    userPageDto: UserPageDto,
    maxLevel = 0,
  ): Promise<PaginatedResult<UserPageRespDto>> {
    const [entities, total] = await this.userRepository.searchUsersByPage(userPageDto, maxLevel)
    const list = plainToInstance(UserPageRespDto, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: userPageDto.page,
      pageSize: userPageDto.pageSize,
    }
  }
  async pageOptionUser(
    userPageOptionDto: UserPageOptionDto,
    maxLevel = 0,
  ): Promise<PaginatedResult<UserPageRespDto>> {
    const { keyword, fields, page, pageSize } = userPageOptionDto
    const queryBuilder = this.userRepository.createQueryBuilder('user')
    if (fields && fields.length) {
      const selectFields = fields.split(',').map((field) => `user.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = UserService.SEARCHABLE_FIELDS.map((item) => `user.${item} LIKE :keyword`).join(
        ' OR ',
      )
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    if (maxLevel !== MAX_ROLE_LEVEL) {
      queryBuilder.leftJoin('user.roles', 'role').groupBy('user.id')

      const havingClause = 'MAX(role.level) <= :maxLevel'
      queryBuilder.having(`${havingClause} OR MAX(role.level) IS NULL`, { maxLevel })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(UserPageRespDto, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findUserById(id: number): Promise<UserRespDto | null> {
    // 直接用 repository 中的 api 进行查询
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new NotFoundException(`未找到id为${id}的用户`)
    }
    // 与 findUserByUserName 保持一致：附带角色关联，供 auth 刷新令牌重建角色/权限 payload
    const result = plainToInstance(UserRespDto, userEntity, { excludeExtraneousValues: true })
    const roles = await this.userRepository.searchRoleIdsByUserId(id)
    return {
      ...result,
      roleIds: roles,
    }
  }
  async findUserByUserName(userName: string): Promise<UserRespDto | null> {
    const userEntity = await this.findUserWithPasswordByUserName(userName)
    if (!userEntity || !userEntity!.id) {
      return null
    }
    const result = plainToInstance(UserRespDto, userEntity, { excludeExtraneousValues: true })
    const roles = await this.userRepository.searchRoleIdsByUserId(userEntity!.id!)
    return {
      ...result,
      roleIds: roles,
    }
  }
  async findRolesByUserId(id: number) {
    const list = await this.userRepository.getRoleIdsByUserId(id)
    return { list }
  }
  async assignRolesToUser(roleIds: number[], userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new BusinessException(`未找到id为${userId}的用户`)
    }
    const oldRoleIds = await this.userRepository.getRoleIdsByUserId(userId)
    const [oldRoles, newRoles] = await Promise.all([
      oldRoleIds.length > 0
        ? this.roleRepository.find({ where: { id: In(oldRoleIds) } })
        : Promise.resolve([]),
      roleIds.length > 0
        ? this.roleRepository.find({ where: { id: In(roleIds) } })
        : Promise.resolve([]),
    ])

    await this.userRepository.assignRolesToUser(roleIds, userId)

    await this.operationLogService.record({
      module: 'user',
      businessId: userId,
      businessText: this.userBusinessText(user),
      operationType: OperationLogAction.ASSIGN,
      changes: [
        {
          field: 'roles',
          fieldText: '角色',
          oldValue: oldRoleIds,
          newValue: roleIds,
          oldText: oldRoles.map((role) => role.roleName).join('、') || '无',
          newText: newRoles.map((role) => role.roleName).join('、') || '无',
        },
      ],
    })
  }
  // 这个方法包返回结果含密码字段，使用时要谨慎
  async findUserWithPasswordByUserName(
    userName: string,
  ): Promise<(UserRespDto & { password: string | null }) | null> {
    const userEntity = await this.userRepository.findOne({
      where: { userName },
    })
    if (!userEntity) {
      return null
    }
    const roles = await this.userRepository.searchRoleIdsByUserId(userEntity!.id!)
    return {
      ...userEntity,
      roleIds: roles,
    }
  }
  // 这个方法包返回结果含密码字段，使用时要谨慎
  async findUserWithPasswordByEmail(
    email: string,
  ): Promise<(UserRespDto & { password: string | null }) | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
    })
    if (!userEntity) {
      return null
    }
    const roles = await this.userRepository.searchRoleIdsByUserId(userEntity!.id!)
    return {
      ...userEntity,
      roleIds: roles,
    }
  }
  async findUserListByIds(ids: string): Promise<UserListRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const findOptions: FindManyOptions<User> = {
      where: {
        id: In(idList),
      },
    } as any
    const entities = await this.userRepository.find(findOptions)
    const list = plainToInstance(UserRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((user) => user.id))
    const notFoundIds = idList.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createUser(userCreateDto: UserCreateDto): Promise<UserRespDto | null> {
    const userNameCheck = await this.checkUserFieldUnique({
      field: 'userName',
      value: userCreateDto.userName,
    })
    if (!userNameCheck) {
      throw new BusinessException('用户名重复！')
    }
    if (userCreateDto.mobile) {
      const mobileCheck = await this.checkUserFieldUnique({
        field: 'mobile',
        value: userCreateDto.mobile,
      })
      if (!mobileCheck) {
        throw new BusinessException('手机号重复！')
      }
    }

    if (userCreateDto.email) {
      const mobileCheck = await this.checkUserFieldUnique({
        field: 'email',
        value: userCreateDto.email,
      })
      if (!mobileCheck) {
        throw new BusinessException('邮箱重复！')
      }
    }
    // status 缺省时默认启用（数据库列无默认值，避免 INSERT 报错）
    const userCreateInput = { ...userCreateDto, status: userCreateDto.status ?? 1 }
    return await this.dataSource
      .transaction(async (manager) => {
        const userEntity = await this.userRepository.createUser(userCreateInput, manager)
        // todo 添加用户角色
        return userEntity
      })
      .then(async (userEntity) => {
        const businessText = this.userBusinessText(userEntity)
        await this.operationLogService.record({
          module: 'user',
          businessId: userEntity.id,
          businessText,
          operationType: OperationLogAction.CREATE,
          changes: buildCreatedChanges(
            userCreateDto as unknown as Record<string, unknown>,
            USER_FIELD_META,
          ),
        })
        return userEntity
      })
  }
  async updateUser(id: number, userUpdateDto: UserUpdateDto): Promise<UserRespDto | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${id}的用户`)
    }
    // 唯一性预检：修改到其它用户已占用的 userName/mobile/email 时给出友好提示（与 createUser 策略一致，数据库唯一索引仅兜底）
    if (userUpdateDto.userName && userUpdateDto.userName !== userEntity.userName) {
      const check = await this.checkUserFieldUnique({
        field: 'userName',
        value: userUpdateDto.userName,
        id,
      })
      if (!check) {
        throw new BusinessException('用户名重复！')
      }
    }
    if (userUpdateDto.mobile && userUpdateDto.mobile !== userEntity.mobile) {
      const check = await this.checkUserFieldUnique({
        field: 'mobile',
        value: userUpdateDto.mobile,
        id,
      })
      if (!check) {
        throw new BusinessException('手机号重复！')
      }
    }
    if (userUpdateDto.email && userUpdateDto.email !== userEntity.email) {
      const check = await this.checkUserFieldUnique({
        field: 'email',
        value: userUpdateDto.email,
        id,
      })
      if (!check) {
        throw new BusinessException('邮箱重复！')
      }
    }
    const updateUserEntity = await this.dataSource.transaction(async (manager) => {
      const updatedUserEntity = await this.userRepository.updateUser(
        userEntity,
        userUpdateDto,
        manager,
      )
      // todo 修改用户角色
      return updatedUserEntity
    })
    await this.operationLogService.record({
      module: 'user',
      businessId: id,
      businessText: this.userBusinessText(userEntity),
      operationType: OperationLogAction.UPDATE,
      changes: buildFieldChanges(
        userUpdateDto as unknown as Record<string, unknown>,
        userEntity as unknown as Record<string, unknown>,
        USER_FIELD_META,
      ),
    })
    return updateUserEntity
  }
  async removeUser(id: number): Promise<null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${id}的用户`)
    }
    if (userEntity.userName === ADMIN_USER_NAME) {
      throw new BusinessException('内置admin账号不允许删除')
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.userRepository.removeUser(userEntity, manager)
        return null
      })
      .then(async (result) => {
        await this.operationLogService.record({
          module: 'user',
          businessId: id,
          businessText: this.userBusinessText(userEntity),
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async batchRemoveUser(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const users = await this.userRepository.find({ where: { id: In(idList) } })
    if (users.some((user) => user.userName === ADMIN_USER_NAME)) {
      throw new BusinessException('内置admin账号不允许删除')
    }
    let missingIds: number[] = []
    if (users.length !== ids.length) {
      missingIds = idList.filter((id) => !users.some((user) => user.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.userRepository.batchRemoveUser(users, manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = users.map((user) => this.userBusinessText(user)).join('、')
        await this.operationLogService.record({
          module: 'user',
          businessText: `共 ${users.length} 个用户（${listText.slice(0, 200)}）`,
          operationType: OperationLogAction.DELETE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }
  async updateUserStatus(id: number, userUpdateDto: UpdateStatusDto): Promise<null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${id}的用户`)
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.userRepository.updateUserStatus(userEntity, userUpdateDto.status, manager)
        return null
      })
      .then(async (result) => {
        await this.operationLogService.record({
          module: 'user',
          businessId: id,
          businessText: this.userBusinessText(userEntity),
          operationType:
            userUpdateDto.status === 1 ? OperationLogAction.ENABLE : OperationLogAction.DISABLE,
          changes: buildFieldChanges(
            { status: userUpdateDto.status },
            userEntity as unknown as Record<string, unknown>,
            USER_FIELD_META,
          ),
        })
        return result
      })
  }
  async batchUpdateUserStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    const idList = batchUpdateStatusDto.ids.split(',').map((id) => Number.parseInt(id))
    const users = await this.userRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (users.length !== batchUpdateStatusDto.ids.length) {
      missingIds = idList.filter((id) => !users.some((user) => user.id === id))
    }
    return await this.dataSource
      .transaction(async (manager) => {
        await this.userRepository.batchUpdateUserStatus(users, batchUpdateStatusDto.status, manager)
        return {
          notFoundIds: missingIds,
        }
      })
      .then(async (result) => {
        const listText = users.map((user) => this.userBusinessText(user)).join('、')
        await this.operationLogService.record({
          module: 'user',
          businessText: `共 ${users.length} 个用户（${listText.slice(0, 200)}）`,
          operationType:
            batchUpdateStatusDto.status === 1
              ? OperationLogAction.ENABLE
              : OperationLogAction.DISABLE,
          level: OperationLogLevel.WARN,
        })
        return result
      })
  }

  // ============================== Excel 导入 / 导出 / 模板 ==============================

  /** 下载用户导入模板（表头 + 下拉 + 填写说明） */
  async downloadUserImportTemplate(): Promise<StreamableFile> {
    const buffer = await this.excelService.buildImportTemplate(USER_IMPORT_DEF)
    return this.toExcelStream(buffer, `${USER_IMPORT_DEF.fileName}.xlsx`)
  }

  /**
   * 导入用户：
   * 1. 引擎完成解析 + 公共格式校验（必填/枚举/长度/手机号/邮箱）；
   * 2. 模块层做用户名、手机号、邮箱的唯一性校验（文件内 + 库内）；
   * 3. 角色引用校验（只允许引用系统中已存在的角色编码/名称，且受当前账号角色等级约束）；
   * 4. 事务内逐行落库并绑定角色，单行失败不影响其他行，结果以明细返回。
   */
  async importUserFile(
    file: ExcelUploadFile | undefined,
    maxLevel = MAX_ROLE_LEVEL,
  ): Promise<ImportResultDto> {
    const buffer = file?.buffer
    if (!buffer || buffer.length === 0) {
      throw new BusinessException('请选择要导入的 .xlsx 文件')
    }

    const parsed = await this.excelService.parseImportFile(USER_IMPORT_DEF, buffer)
    if (parsed.headerErrors.length > 0) {
      throw new BusinessException(parsed.headerErrors.join('；'))
    }
    const rows = parsed.rows as ImportUserRow[]
    if (rows.length === 0) {
      throw new BusinessException('文件中没有可导入的数据行')
    }

    // 唯一性校验（用户名/手机号/邮箱：文件内 + 库内）
    await this.checkImportUniqueness(rows)
    // 角色引用解析
    await this.resolveImportRoles(rows, maxLevel)

    // 有效行事务落库，单行保存失败仅标记该行
    const validRows = rows.filter((row) => Object.keys(row.errors).length === 0)
    let successCount = 0
    if (validRows.length > 0) {
      await this.dataSource.transaction(async (manager) => {
        for (const row of validRows) {
          try {
            const user = manager.create(User, {
              userName: row.values.userName as string,
              nickName: (row.values.nickName as string) || null,
              mobile: (row.values.mobile as string) || null,
              email: (row.values.email as string) || null,
              address: (row.values.address as string) || null,
              status:
                row.values.status === undefined || row.values.status === null
                  ? 1
                  : (row.values.status as number),
            })
            const savedUser = await manager.save(User, user)
            await this.userRepository.assignRolesToUser(row.roleIds ?? [], savedUser.id, manager)
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
      module: 'user',
      businessText: `用户导入（共 ${rows.length} 行，成功 ${successCount}，失败 ${failedRows.length}）`,
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

  /** 导出用户（筛选条件与列表查询一致，不分页全量导出） */
  async exportUsers(query: UserPageDto, maxLevel = MAX_ROLE_LEVEL): Promise<StreamableFile> {
    const entities = await this.userRepository.searchUsersForExport(query, maxLevel)
    const rows: UserExportRow[] = entities.map((user) => ({
      id: user.id,
      userName: user.userName ?? '',
      nickName: user.nickName ?? '',
      genderName: user.genderName ?? '',
      birth: user.birth ?? '',
      mobile: user.mobile ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      statusText: user.status === 1 ? '启用' : '禁用',
      roleNames: (user as User & { roleNames?: string }).roleNames ?? '',
      createdAtText: user.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
    }))
    const buffer = await this.excelService.buildExportBuffer('用户数据', USER_EXPORT_COLUMNS, rows)
    const fileName = `${USER_IMPORT_DEF.fileName}_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
    await this.operationLogService.record({
      module: 'user',
      businessText: `导出用户 ${entities.length} 条`,
      operationType: OperationLogAction.EXPORT,
    })
    return this.toExcelStream(buffer, fileName)
  }

  /** 构造 xlsx 下载流（携带 Content-Type 与中文文件名） */
  private toExcelStream(buffer: Buffer, fileName: string): StreamableFile {
    return new StreamableFile(buffer, {
      type: EXCEL_CONTENT_TYPE,
      disposition: this.excelService.attachmentDisposition(fileName),
    })
  }

  /** 用户名/手机号/邮箱：文件内去重 + 与库内数据比对 */
  private async checkImportUniqueness(rows: ImportUserRow[]) {
    const uniques = [
      { key: 'userName', header: '用户名', column: 'userName' },
      { key: 'mobile', header: '手机号', column: 'mobile' },
      { key: 'email', header: '邮箱', column: 'email' },
    ] as const
    for (const rule of uniques) {
      const valueOf = (row: ImportUserRow) => String(row.values[rule.key] ?? '').trim()
      // 文件内去重
      const fileSeen = new Map<string, ImportUserRow>()
      const markError = (row: ImportUserRow, message: string) => {
        row.errors[rule.header] = row.errors[rule.header]
          ? `${row.errors[rule.header]}；${message}`
          : message
      }
      for (const row of rows) {
        const value = valueOf(row)
        if (!value) continue
        const first = fileSeen.get(value)
        if (first) {
          markError(first, `${rule.header}「${value}」与文件中的其他行重复`)
          markError(row, `${rule.header}「${value}」与文件中的其他行重复`)
        } else {
          fileSeen.set(value, row)
        }
      }
      // 与库内数据比对
      const dbValues = [...new Set(rows.map(valueOf).filter(Boolean))]
      if (dbValues.length === 0) continue
      const found = await this.userRepository
        .createQueryBuilder('user')
        .select(`user.${rule.column}`, rule.column)
        .where(`user.${rule.column} IN (:...values)`, { values: dbValues })
        .getRawMany()
        .then((raws) => new Set(raws.map((raw) => String(raw[rule.column] ?? ''))))
      for (const row of rows) {
        const value = valueOf(row)
        if (!value || !found.has(value)) continue
        markError(row, `${rule.header}「${value}」与系统中已有数据重复`)
      }
    }
  }

  /** 角色引用解析：只允许引用系统内已存在的角色编码/名称 */
  private async resolveImportRoles(rows: ImportUserRow[], maxLevel: number) {
    rows.forEach((row) => {
      row.roleIds = []
    })
    const tokenSet = new Set<string>()
    rows.forEach((row) => {
      this.splitRoleTokens(row.values.roles).forEach((token) => tokenSet.add(token))
    })
    if (tokenSet.size === 0) return

    const tokens = [...tokenSet]
    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.roleCode IN (:...tokens)', { tokens })
      .orWhere('role.roleName IN (:...tokens)', { tokens })
      .getMany()
    const roleByCode = new Map(roles.filter((r) => r.roleCode).map((r) => [r.roleCode, r]))
    const roleByName = new Map(roles.map((r) => [r.roleName, r]))

    rows.forEach((row) => {
      const tokensRow = this.splitRoleTokens(row.values.roles)
      if (tokensRow.length === 0) return
      const ids: number[] = []
      const missing: string[] = []
      const disabled: string[] = []
      const denied: string[] = []
      for (const token of tokensRow) {
        // 编码优先，其次名称（role_code / role_name 均唯一，正常不会产生歧义）
        const role = roleByCode.get(token) ?? roleByName.get(token)
        if (!role) {
          missing.push(token)
          continue
        }
        if (role.status !== 1) {
          disabled.push(token)
          continue
        }
        if (maxLevel !== MAX_ROLE_LEVEL && role.level > maxLevel) {
          denied.push(token)
          continue
        }
        if (!ids.includes(role.id)) ids.push(role.id)
      }
      const messages: string[] = []
      if (missing.length) messages.push(`角色「${missing.join('、')}」不存在`)
      if (disabled.length) messages.push(`角色「${disabled.join('、')}」已禁用`)
      if (denied.length) messages.push(`角色「${denied.join('、')}」超出当前账号可分配范围`)
      if (messages.length > 0) {
        row.errors['角色'] = messages.join('；')
      }
      row.roleIds = ids
    })
  }

  private splitRoleTokens(value: unknown): string[] {
    const text = String(value ?? '').trim()
    if (!text) return []
    return text
      .split(/[,，;；、\s]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  }

  async checkUserFieldUnique(userCheckUniqueDto: UserCheckUniqueDto): Promise<boolean> {
    const count = await this.userRepository.count({
      where: {
        [userCheckUniqueDto.field]: userCheckUniqueDto.value,
        ...(userCheckUniqueDto.id || userCheckUniqueDto.id === 0
          ? { id: Not(userCheckUniqueDto.id) }
          : {}),
      },
    })
    return count === 0
  }
  // 直接更新账号密码，初始化超级管理员时用到
  async updateUserPassword(id: number, newPassword: string): Promise<null> {
    return await this.dataSource.transaction(async (manager) => {
      await this.userRepository.updateUserPassword(id, newPassword, manager)
      return null
    })
  }
  // 管理员重置用户密码
  async adminResetPassword(body: AdminResetPasswordDto) {
    const userEntity = await this.userRepository.findOne({
      where: { id: body.userId },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${body.userId}的用户`)
    }
    const plainPassword = await this.helperService.decryptPassword(body.newPassword, body.keyId)
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    return await this.dataSource
      .transaction(async (manager) => {
        const updatedUserEntity = await this.userRepository.updateUser(
          userEntity,
          {
            password: passwordHash,
          },
          manager,
        )
        return updatedUserEntity
      })
      .then(async (updatedUserEntity) => {
        await this.operationLogService.record({
          module: 'user',
          businessId: body.userId,
          businessText: this.userBusinessText(userEntity),
          operationType: OperationLogAction.RESET_PWD,
          level: OperationLogLevel.WARN,
        })
        return updatedUserEntity
      })
  }
  // 用户自己重置自己的密码
  async resetPassword(body: ResetPasswordDto) {
    const userEntity = await this.userRepository.findOne({
      where: { id: body.userId },
      select: { id: true, password: true },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${body.userId}的用户`)
    }
    const oldPassword = await this.helperService.decryptPassword(
      body.oldPassword,
      body.oldPasswordKeyId,
    )
    const isPasswordValid = await bcrypt.compare(oldPassword, userEntity.password || '')
    if (!isPasswordValid) {
      throw new BusinessException(`旧密码不正确`)
    }
    const plainPassword = await this.helperService.decryptPassword(
      body.newPassword,
      body.newPasswordKeyId,
    )
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    return await this.dataSource
      .transaction(async (manager) => {
        const updatedUserEntity = await this.userRepository.updateUser(
          userEntity,
          {
            password: passwordHash,
          },
          manager,
        )
        return updatedUserEntity
      })
      .then(async (updatedUserEntity) => {
        await this.operationLogService.record({
          module: 'user',
          businessId: body.userId,
          businessText: this.userBusinessText(userEntity),
          operationType: OperationLogAction.RESET_PWD,
          level: OperationLogLevel.WARN,
        })
        return updatedUserEntity
      })
  }

  /** 日志业务对象描述：用户 #5 王五 */
  private userBusinessText(user: Pick<User, 'id' | 'userName'>): string {
    return `用户 #${user.id} ${user.userName ?? ''}`.trim()
  }
}
