import { Injectable, NotFoundException } from '@nestjs/common'

import { ValueSetPageRespDto } from '@/modules/value-set/dto/value-set.page.resp.dto'
import { ValueSetListDto, ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
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

@Injectable()
export class ValueSetService {
  static readonly SEARCHABLE_FIELDS = ['valueSetName']
  constructor(
    private readonly valueSetRepository: ValueSetRepository,
    private readonly dataSource: DataSource,
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
    return await this.dataSource.transaction(async (manager) => {
      const valueSetEntity = await this.valueSetRepository.createValueSet(
        valueSetCreateDto,
        manager,
      )
      // todo 添加值集角色
      return valueSetEntity
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
    return await this.dataSource.transaction(async (manager) => {
      const updatedValueSetEntity = await this.valueSetRepository.updateValueSet(
        valueSetEntity,
        valueSetUpdateDto,
        manager,
      )
      // todo 修改值集角色
      return updatedValueSetEntity
    })
  }
  async removeValueSet(id: number): Promise<null> {
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new BusinessException(`未找到id为${id}的值集`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.valueSetRepository.removeValueSet(valueSetEntity, manager)
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
    return await this.dataSource.transaction(async (manager) => {
      await this.valueSetRepository.batchRemoveValueSet(valueSets, manager)
      return {
        notFoundIds: missingIds,
      }
    })
  }
  async updateValueSetStatus(id: number, valueSetUpdateDto: UpdateStatusDto): Promise<null> {
    const valueSetEntity = await this.valueSetRepository.findOne({
      where: { id },
    })
    if (!valueSetEntity) {
      throw new BusinessException(`未找到id为${id}的值集`)
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.valueSetRepository.updateValueSetStatus(
        valueSetEntity,
        valueSetUpdateDto.status,
        manager,
      )
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
    return await this.dataSource.transaction(async (manager) => {
      await this.valueSetRepository.batchUpdateValueSetStatus(
        valueSets,
        batchUpdateStatusDto.status,
        manager,
      )
      return {
        notFoundIds: missingIds,
      }
    })
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
