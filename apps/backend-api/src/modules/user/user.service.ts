import { Injectable, NotFoundException } from '@nestjs/common'

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

@Injectable()
export class UserService {
  static readonly SEARCHABLE_FIELDS = ['userName', 'mobile', 'pinyin']
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}
  async pageUser(userPageDto: UserPageDto): Promise<PaginatedResult<UserPageRespDto>> {
    const [entities, total] = await this.userRepository.searchUsersByPage(userPageDto)
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
    return plainToInstance(UserRespDto, userEntity, { excludeExtraneousValues: true })
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
    // todo 检查用户名，手机号是否唯一
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
    return await this.dataSource.transaction(async (manager) => {
      const userEntity = await this.userRepository.createUser(userCreateDto, manager)
      // todo 添加用户角色
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
    if (userUpdateDto.userName) {
      const userNameCheck = await this.checkUserFieldUnique({
        field: 'userName',
        value: userUpdateDto.userName,
        id,
      })
      if (!userNameCheck) {
        throw new BusinessException('用户名重复！')
      }
    }
    if (userUpdateDto.mobile) {
      const mobileCheck = await this.checkUserFieldUnique({
        field: 'mobile',
        value: userUpdateDto.mobile,
        id,
      })
      if (!mobileCheck) {
        throw new BusinessException('手机号重复！')
      }
    }
    return await this.dataSource.transaction(async (manager) => {
      const updatedUserEntity = await this.userRepository.updateUser(
        userEntity,
        userUpdateDto,
        manager,
      )
      // todo 修改用户角色
      return updatedUserEntity
    })
  }
  async removeUser(id: number): Promise<null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${id}的用户`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.userRepository.removeUser(userEntity, manager)
      return null
    })
  }
  async batchRemoveUser(ids: string): Promise<BatchRespDto | null> {
    const idList = ids.split(',').map((id) => Number.parseInt(id))
    const users = await this.userRepository.find({ where: { id: In(idList) } })
    let missingIds: number[] = []
    if (users.length !== ids.length) {
      missingIds = idList.filter((id) => !users.some((user) => user.id === id))
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.userRepository.batchRemoveUser(users, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }
  async updateUserStatus(id: number, userUpdateDto: UpdateStatusDto): Promise<null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    })
    if (!userEntity) {
      throw new BusinessException(`未找到id为${id}的用户`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.userRepository.updateUserStatus(userEntity, userUpdateDto.status, manager)
      return null
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
    return await this.dataSource.transaction(async (manager) => {
      await this.userRepository.batchUpdateUserStatus(users, batchUpdateStatusDto.status, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }

  async downloadTemplate() {
    return null
  }
  async importUser() {
    return null
  }
  async exportUser() {
    return null
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
}
