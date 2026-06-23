import { Injectable, NotFoundException } from '@nestjs/common'
import {
  SystemUserCreateDto,
  SystemUserListResp,
  SystemUserPageDto,
  SystemUserPageOptionDto,
  SystemUserPageResp,
  SystemUserResp,
  SystemUserUpdateDto,
} from './system-user.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchResp, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UserRepository } from '@/modules/user/system-user.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { SystemUser } from './entities/system-user.entity'

@Injectable()
export class SystemUserService {
  static readonly SEARCHABLE_FIELDS = ['userName', 'mobile', 'pinyin']
  constructor(private readonly userRepository: UserRepository) {}
  async pageUser(
    systemUserPageDto: SystemUserPageDto,
  ): Promise<PaginatedResult<SystemUserPageResp>> {
    const [entities, total] = await this.userRepository.searchUsersByPage(systemUserPageDto)
    const list = plainToInstance(SystemUserPageResp, entities, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page: systemUserPageDto.page,
      pageSize: systemUserPageDto.pageSize,
    }
  }
  async pageOptionUser(
    systemUserPageOptionDto: SystemUserPageOptionDto,
  ): Promise<PaginatedResult<SystemUserPageResp>> {
    const { keyword, fields, page, pageSize } = systemUserPageOptionDto
    const queryBuilder = this.userRepository.createQueryBuilder('user')
    if (fields && fields.length) {
      const selectFields = fields.map((field) => `user.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = SystemUserService.SEARCHABLE_FIELDS.map(
        (item) => `user.${item} LIKE :keyword`,
      ).join(' OR ')
      queryBuilder.andWhere(`(${where})`, { keyword: `%${keyword}%` })
    }
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)
    const [resultList, total] = await queryBuilder.getManyAndCount()
    const list = plainToInstance(SystemUserPageResp, resultList, {
      excludeExtraneousValues: true,
    })
    return {
      list,
      total,
      page,
      pageSize,
    }
  }
  async findUserById(id: number): Promise<SystemUserResp | null> {
    // 直接用 repository 中的 api 进行查询
    // const userEntity = await this.userRepository.findOne({
    //   where: {id},
    // })
    // if (!userEntity) {
    //   throw new NotFoundException(`未找到id为${id}的用户`)
    // }
    // return plainToInstance(SystemUserResp, userEntity, {excludeExtraneousValues: true})

    // 调用 userRepository 中自定义的查询方法
    const entity = await this.userRepository.findUserById(id)
    if (!entity) {
      throw new NotFoundException(`未找到id为${id}的用户`)
    }
    return plainToInstance(SystemUserResp, entity, { excludeExtraneousValues: true })
  }
  async findUserListByIds(ids: number[]): Promise<SystemUserListResp | null> {
    const findOptions: FindManyOptions<SystemUser> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.userRepository.find(findOptions)
    const list = plainToInstance(SystemUserResp, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((user) => user.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createUser(systemUserCreateDto: SystemUserCreateDto): Promise<SystemUserResp | null> {
    return null
  }
  async updateUser(
    id: number,
    systemUserUpdateDto: SystemUserUpdateDto,
  ): Promise<SystemUserResp | null> {
    return null
  }
  async removeUser(id: number): Promise<null> {
    return null
  }
  async batchRemoveUser(ids: number[]): Promise<BatchResp | null> {
    return null
  }
  async updateUserStatus(
    id: number,
    systemUserUpdateDto: Pick<SystemUserUpdateDto, 'status'>,
  ): Promise<null> {
    return null
  }
  async batchUpdateUserStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchResp | null> {
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
