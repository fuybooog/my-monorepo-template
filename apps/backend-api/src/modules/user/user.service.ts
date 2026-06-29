import { Injectable, NotFoundException } from '@nestjs/common'

import { UserPageRespDto } from '@/modules/user/dto/user.page.resp.dto'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { UserPageOptionDto } from '@/modules/user/dto/user.page.option.dto'
import { UserRespDto } from '@/modules/user/dto/user.resp.dto'
import { UserListRespDto } from '@/modules/user/dto/user.list.resp.dto'
import { UserCreateDto } from '@/modules/user/dto/user.create.resp.dto'
import { UserUpdateDto } from '@/modules/user/dto/user.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UserRepository } from '@/modules/user/user.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { User } from '@/modules/user/entities/user.entity'

@Injectable()
export class UserService {
  static readonly SEARCHABLE_FIELDS = ['userName', 'mobile', 'pinyin']
  constructor(private readonly userRepository: UserRepository) {}
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
      const selectFields = fields.map((field) => `user.${field}`)
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
  async findUserListByIds(ids: number[]): Promise<UserListRespDto | null> {
    const findOptions: FindManyOptions<User> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.userRepository.find(findOptions)
    const list = plainToInstance(UserRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((user) => user.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createUser(userCreateDto: UserCreateDto): Promise<UserRespDto | null> {
    return null
  }
  async updateUser(id: number, userUpdateDto: UserUpdateDto): Promise<UserRespDto | null> {
    return null
  }
  async removeUser(id: number): Promise<null> {
    return null
  }
  async batchRemoveUser(ids: number[]): Promise<BatchRespDto | null> {
    return null
  }
  async updateUserStatus(id: number, userUpdateDto: Pick<UserUpdateDto, 'status'>): Promise<null> {
    return null
  }
  async batchUpdateUserStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return null
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
}
