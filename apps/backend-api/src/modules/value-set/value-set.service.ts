import { Injectable, NotFoundException } from '@nestjs/common'

import { ValueSetPageRespDto } from '@/modules/value-set/dto/value-set.page.resp.dto'
import { ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { ValueSetPageOptionDto } from '@/modules/value-set/dto/value-set.page.option.dto'
import { ValueSetRespDto } from '@/modules/value-set/dto/value-set.resp.dto'
import { ValueSetListRespDto } from '@/modules/value-set/dto/value-set.list.resp.dto'
import { ValueSetCreateDto } from '@/modules/value-set/dto/value-set.create.resp.dto'
import { ValueSetUpdateDto } from '@/modules/value-set/dto/value-set.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { ValueSetRepository } from '@/modules/value-set/value-set.repository'
import { plainToInstance } from 'class-transformer'
import { FindManyOptions, In } from 'typeorm'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'

@Injectable()
export class ValueSetService {
  static readonly SEARCHABLE_FIELDS = ['valueSetName', 'mobile', 'pinyin']
  constructor(private readonly valueSetRepository: ValueSetRepository) {}
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
  async pageOptionValueSet(
    valueSetPageOptionDto: ValueSetPageOptionDto,
  ): Promise<PaginatedResult<ValueSetPageRespDto>> {
    const { keyword, fields, page, pageSize } = valueSetPageOptionDto
    const queryBuilder = this.valueSetRepository.createQueryBuilder('value-set')
    if (fields && fields.length) {
      const selectFields = fields.map((field) => `value-set.${field}`)
      queryBuilder.select(selectFields)
    }
    if (keyword) {
      const where = ValueSetService.SEARCHABLE_FIELDS.map(
        (item) => `value-set.${item} LIKE :keyword`,
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
  async findValueSetListByIds(ids: number[]): Promise<ValueSetListRespDto | null> {
    const findOptions: FindManyOptions<ValueSet> = {
      where: {
        id: In(ids),
      },
    } as any
    const entities = await this.valueSetRepository.find(findOptions)
    const list = plainToInstance(ValueSetRespDto, entities, { excludeExtraneousValues: true })
    const existIds = new Set(list.map((valueSet) => valueSet.id))
    const notFoundIds = ids.filter((id) => !existIds.has(id))
    return {
      list,
      notFoundIds,
    }
  }
  async createValueSet(valueSetCreateDto: ValueSetCreateDto): Promise<ValueSetRespDto | null> {
    return null
  }
  async updateValueSet(
    id: number,
    valueSetUpdateDto: ValueSetUpdateDto,
  ): Promise<ValueSetRespDto | null> {
    return null
  }
  async removeValueSet(id: number): Promise<null> {
    return null
  }
  async batchRemoveValueSet(ids: number[]): Promise<BatchRespDto | null> {
    return null
  }
  async updateValueSetStatus(
    id: number,
    valueSetUpdateDto: Pick<ValueSetUpdateDto, 'status'>,
  ): Promise<null> {
    return null
  }
  async batchUpdateValueSetStatus(
    batchUpdateStatusDto: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return null
  }

  async downloadTemplate() {
    return null
  }
  async importValueSet() {
    return null
  }
  async exportValueSet() {
    return null
  }
}
