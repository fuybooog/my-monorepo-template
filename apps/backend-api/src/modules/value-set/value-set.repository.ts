import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { ValueSetCreateDto } from './dto/value-set.create.dto'
import { ValueSetUpdateDto } from './dto/value-set.update.dto'

@Injectable()
export class ValueSetRepository extends Repository<ValueSet> {
  constructor(private dataSource: DataSource) {
    super(ValueSet, dataSource.createEntityManager())
  }

  async searchValueSetsByPage(query: ValueSetPageDto) {
    const { page = 1, pageSize = 10 } = query

    const qb = this.createQueryBuilder('valueSet')

    // todo 排序应该从前端传入
    qb.orderBy('valueSet.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
  async findValueSetById(id: number) {
    const queryBuilder = this.createQueryBuilder('valueSet')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, ValueSet)
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => `valueSet.${col.propertyName}`)

    safeFields.unshift('valueSet.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    queryBuilder.leftJoinAndSelect('valueSet.roles', 'role')

    return await queryBuilder.where('valueSet.id = :id', { id }).getOne()
  }

  async createValueSet(valueSetCreateDto: ValueSetCreateDto, manager: EntityManager) {
    const valueSetInstance = manager.create(ValueSet, valueSetCreateDto)
    const savedValueSet = await manager.save(ValueSet, valueSetInstance)
    return savedValueSet
  }

  async updateValueSet(
    valueSet: ValueSet,
    valueSetUpdateDto: ValueSetUpdateDto,
    manager: EntityManager,
  ) {
    const updatedValueSet = Object.assign(valueSet, valueSetUpdateDto)
    return await manager.save(ValueSet, updatedValueSet)
  }
  async removeValueSet(valueSet: ValueSet, manager: EntityManager) {
    valueSet.deletedAt = new Date()
    return await manager.save(ValueSet, valueSet)
  }
  async batchRemoveValueSet(valueSets: ValueSet[], manager: EntityManager) {
    valueSets.forEach((valueSet) => {
      valueSet.deletedAt = new Date()
    })
    return await manager.save(valueSets)
  }
  async updateValueSetStatus(valueSet: ValueSet, status: string, manager: EntityManager) {
    valueSet.status = status
    return await manager.save(ValueSet, valueSet)
  }
  async batchUpdateValueSetStatus(valueSets: ValueSet[], status: string, manager: EntityManager) {
    valueSets.forEach((valueSet) => {
      valueSet.status = status
    })
    return await manager.save(valueSets)
  }
}
