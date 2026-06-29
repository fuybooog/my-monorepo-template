import { Injectable, NotFoundException } from '@nestjs/common'

import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.resp.dto'
import { ResourceUpdateDto } from '@/modules/resource/dto/resource.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ResourceRepository } from '@/modules/resource/resource.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { Resource } from '@/modules/resource/entities/resource.entity'

@Injectable()
export class ResourceService {
  static readonly SEARCHABLE_FIELDS = ['resourceName', 'mobile', 'pinyin']
  constructor(private readonly resourceRepository: ResourceRepository) {}
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
  async pageOptionResource(
    resourcePageOptionDto: ResourcePageOptionDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    const { keyword, fields, page, pageSize } = resourcePageOptionDto
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource')
    if (fields && fields.length) {
      const selectFields = fields.map((field) => `resource.${field}`)
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
  async findResourceListByIds(ids: number[]): Promise<ResourceListRespDto | null> {
    const findOptions: FindManyOptions<Resource> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.resourceRepository.find(findOptions)
    const list = plainToInstance(ResourceRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((resource) => resource.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createResource(resourceCreateDto: ResourceCreateDto): Promise<ResourceRespDto | null> {
    return null
  }
  async updateResource(
    id: number,
    resourceUpdateDto: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    return null
  }
  async removeResource(id: number): Promise<null> {
    return null
  }
  async batchRemoveResource(ids: number[]): Promise<BatchRespDto | null> {
    return null
  }
  async updateResourceStatus(
    id: number,
    resourceUpdateDto: Pick<ResourceUpdateDto, 'status'>,
  ): Promise<null> {
    return null
  }
  async batchUpdateResourceStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return null
  }

  async downloadTemplate() {
    return null
  }
  async importResource() {
    return null
  }
  async exportResource() {
    return null
  }
}
