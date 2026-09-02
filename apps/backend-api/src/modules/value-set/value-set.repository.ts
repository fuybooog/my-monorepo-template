import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ValueSet } from '@/modules/value-set/entities/value-set.entity'
import { ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { ValueSetGroupPageDto } from '@/modules/value-set/dto/value-set-set.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { ValueSetCreateDto } from './dto/value-set.create.dto'
import { ValueSetUpdateDto } from './dto/value-set.update.dto'

@Injectable()
export class ValueSetRepository extends Repository<ValueSet> {
  constructor(private dataSource: DataSource) {
    super(ValueSet, dataSource.createEntityManager())
  }

  async searchValueSetsByPage(query: ValueSetPageDto) {
    const {
      page = 1,
      pageSize = 10,
      setCode,
      setName,
      code,
      name,
      createdAtStart,
      createdAtEnd,
      updatedAtStart,
      updatedAtEnd,
    } = query

    const qb = this.createQueryBuilder('valueSet')

    if (setCode) {
      const codeExact = setCode.startsWith('"') && setCode.endsWith('"')
      const setCodeValue = codeExact ? setCode.slice(1, -1) : setCode
      if (codeExact) {
        qb.andWhere('valueSet.setCode = :setCode', { setCode: setCodeValue })
      } else {
        qb.andWhere('valueSet.setCode LIKE :setCode', { setCode: `%${setCodeValue}%` })
      }
    }
    if (setName) {
      qb.andWhere('valueSet.setName LIKE :setName', { setName: `%${setName}%` })
    }
    if (code) {
      const codeExact = code.startsWith('"') && code.endsWith('"')
      const codeValue = codeExact ? code.slice(1, -1) : code
      if (codeExact) {
        qb.andWhere('valueSet.code = :code', { code: codeValue })
      } else {
        qb.andWhere('valueSet.code LIKE :code', { code: `%${codeValue}%` })
      }
    }
    if (name) {
      qb.andWhere('valueSet.name LIKE :name', { name: `%${name}%` })
    }
    if (createdAtStart) {
      qb.andWhere('valueSet.createdAt >= :createdAtStart', { createdAtStart })
    }
    if (createdAtEnd) {
      qb.andWhere('valueSet.createdAt <= :createdAtEnd', { createdAtEnd })
    }
    if (updatedAtStart) {
      qb.andWhere('valueSet.updatedAt >= :updatedAtStart', { updatedAtStart })
    }
    if (updatedAtEnd) {
      qb.andWhere('valueSet.updatedAt <= :updatedAtEnd', { updatedAtEnd })
    }

    // 按排序号升序，排序号相同按创建时间倒序
    qb.orderBy('valueSet.sortNumber', 'ASC')
      .addOrderBy('valueSet.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }

  /** 按 setCode 去重聚合，返回集列表（含值数量） */
  async searchValueSetGroupsByPage(query: ValueSetGroupPageDto) {
    const { page = 1, pageSize = 10, setCode, setName, createdAtStart, createdAtEnd } = query

    const qb = this.createQueryBuilder('valueSet')

    qb.select([
      'valueSet.setCode AS setCode',
      'MAX(valueSet.setName) AS setName',
      'COUNT(valueSet.id) AS valueCount',
      'MAX(valueSet.status) AS status',
      'MAX(valueSet.createdAt) AS createdAt',
      'MAX(valueSet.updatedAt) AS updatedAt',
    ]).groupBy('valueSet.setCode')

    if (setCode) {
      qb.andWhere('valueSet.setCode LIKE :setCode', { setCode: `%${setCode}%` })
    }
    if (setName) {
      qb.andWhere('valueSet.setName LIKE :setName', { setName: `%${setName}%` })
    }
    if (createdAtStart) {
      qb.andWhere('valueSet.createdAt >= :createdAtStart', { createdAtStart })
    }
    if (createdAtEnd) {
      qb.andWhere('valueSet.createdAt <= :createdAtEnd', { createdAtEnd })
    }

    qb.orderBy('MAX(valueSet.createdAt)', 'DESC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)

    const [rows, totalQb] = await Promise.all([
      qb.getRawMany(),
      (() => {
        const countQb = this.createQueryBuilder('valueSet')
        countQb.select('COUNT(DISTINCT valueSet.setCode)', 'cnt')
        if (setCode) {
          countQb.andWhere('valueSet.setCode LIKE :setCode', { setCode: `%${setCode}%` })
        }
        if (setName) {
          countQb.andWhere('valueSet.setName LIKE :setName', { setName: `%${setName}%` })
        }
        if (createdAtStart) {
          countQb.andWhere('valueSet.createdAt >= :createdAtStart', { createdAtStart })
        }
        if (createdAtEnd) {
          countQb.andWhere('valueSet.createdAt <= :createdAtEnd', { createdAtEnd })
        }
        return countQb.getRawOne()
      })(),
    ])

    const total = Number(totalQb?.cnt ?? 0)
    return { rows, total }
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
  async updateValueSetStatus(valueSet: ValueSet, status: number, manager: EntityManager) {
    valueSet.status = status
    return await manager.save(ValueSet, valueSet)
  }
  async batchUpdateValueSetStatus(valueSets: ValueSet[], status: number, manager: EntityManager) {
    valueSets.forEach((valueSet) => {
      valueSet.status = status
    })
    return await manager.save(valueSets)
  }
}
