// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from '@nestjs/common'
import { SystemUserCreateDto, SystemUserListResp, SystemUserPageDto, SystemUserPageOptionDto, SystemUserPageResp, SystemUserResp, SystemUserUpdateDto } from './system-user.dto';
import { PaginatedResult } from '@/dto/pagination-response.dto';
import { BatchResp, BatchUpdateStatusDto } from '@/dto/batch.dto';
// import { UserRepository } from '@/modules/user/system-user.repository'
// import { plainToInstance } from 'class-transformer';

@Injectable()
export class SystemUserService {
  // constructor(private readonly userRepository: UserRepository) {}
  async pageUser(systemUserPageDto: SystemUserPageDto): Promise<PaginatedResult<SystemUserPageResp>> {
    // const {entities, total} = await this.userRepository.searchUsersByPage(systemUserPageDto)
    // const list = plainToInstance(SystemUserPageResp, entities, {
    //   excludeExtraneousValues: false
    // })
    // return {
    //   list,
    //   total,
    //   page: systemUserPageDto.page,
    //   pageSize: systemUserPageDto.pageSize,
    // }
    return {
      list: [
        {
          id: 1,
          userName: '1',
        },
        {
          id: 2,
          userName: '2',
        },
        {
          id: 3,
          userName: '3',
        },
      ],
      total: 3,
      page: systemUserPageDto.page,
      pageSize: systemUserPageDto.pageSize,
    }
  }
  async pageOptionUser(systemUserPageOptionDto: SystemUserPageOptionDto): Promise<PaginatedResult<SystemUserPageResp>> {
    return {
      list: [
        {
          id: 1,
          userName: '1',
        },
        {
          id: 2,
          userName: '2',
        },
        {
          id: 3,
          userName: '3',
        },
      ],
      total: 3,
      page: systemUserPageOptionDto.page,
      pageSize: systemUserPageOptionDto.pageSize,
    }
  }
  async findUserById(id: number): Promise<SystemUserResp | null> {
    return null
  }
  async findUserListByIds(ids: string): Promise<SystemUserListResp | null> {
    return null
  }
  async createUser(systemUserCreateDto: SystemUserCreateDto): Promise<SystemUserResp | null> {
    return null
  }
  async updateUser(id: number, systemUserUpdateDto: SystemUserUpdateDto): Promise<SystemUserResp | null> {
    return null
  }
  async removeUser(id: number): Promise<null> {
    return null
  }
  async batchRemoveUser(ids: string): Promise<BatchResp | null> {
    return null
  }
  async updateUserStatus(id: number, systemUserUpdateDto: Pick<SystemUserUpdateDto, 'status'>): Promise<null> {
    return null
  }
  async batchUpdateUserStatus(batchUpdateStatusDto: BatchUpdateStatusDto): Promise<BatchResp | null> {
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
