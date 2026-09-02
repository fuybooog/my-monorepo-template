import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { ResourceCreateDto } from './dto/resource.create.dto'
import { ResourceUpdateDto } from './dto/resource.update.dto'
import { ResourcePartialDto } from './dto/resource.base.dto'
import { ADMIN_ROLE_CODE } from '@/constants'

@Injectable()
export class ResourceRepository extends Repository<Resource> {
  constructor(private dataSource: DataSource) {
    super(Resource, dataSource.createEntityManager())
  }

  async searchResourcesByPage(query: ResourcePageDto) {
    const { page = 1, pageSize = 10 } = query

    const qb = this.createQueryBuilder('resource')

    // todo 排序应该从前端传入
    qb.orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    return await qb.getManyAndCount()
  }
  async searchResources(query: ResourcePageDto) {
    const qb = this.createQueryBuilder('resource')

    // todo 排序应该从前端传入
    qb.orderBy('resource.createdAt', 'DESC')

    return await qb.getManyAndCount()
  }
  async searchResourcesByUser(
    userId: number,
    roleCodes: string[],
    types?: string,
    notInMenu?: number,
  ) {
    const qb = this.createQueryBuilder('resource')
    if (!(roleCodes.length && roleCodes.includes(ADMIN_ROLE_CODE))) {
      const subQuery = qb
        .subQuery()
        .select('1')
        .from('system_user_role', 'ur')
        .innerJoin('system_role_resource', 'rr', 'rr.role_id = ur.role_id')
        .where('ur.user_id = :userId', { userId })
        .andWhere('rr.resource_id = resource.id')
        .getQuery()

      qb.where(`EXISTS (${subQuery})`)
    }
    if (types) {
      const typeList = types
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
      if (typeList.length) {
        qb.andWhere('resource.type IN (:...typeList)', { typeList })
      }
    }
    // not_in_menu 已改为 INT NOT NULL，不再存在 NULL 值，直接等值比较即可
    if (notInMenu !== undefined && notInMenu !== null) {
      qb.andWhere('resource.notInMenu = :notInMenu', { notInMenu })
    }
    qb.orderBy('resource.createdAt', 'DESC')

    return await qb.getManyAndCount()
  }
  async findResourceById(id: number) {
    const queryBuilder = this.createQueryBuilder('resource')
    const storage = getMetadataArgsStorage()
    const safeFields = storage.columns
      .filter((col) => {
        const target = col.target
        const isTarget = isTargetOrParent(target, Resource)
        const isSafe = col.propertyName !== 'password'
        return isTarget && isSafe
      })
      .map((col) => `resource.${col.propertyName}`)

    safeFields.unshift('resource.id')

    queryBuilder.select(Array.from(new Set(safeFields)))

    return await queryBuilder.where('resource.id = :id', { id }).getOne()
  }

  async createResource(resourceCreateDto: ResourceCreateDto, manager: EntityManager) {
    const resourceInstance = manager.create(Resource, resourceCreateDto)
    const savedResource = await manager.save(Resource, resourceInstance)
    return savedResource
  }

  async updateResource(
    resource: Resource,
    resourceUpdateDto: ResourceUpdateDto,
    manager: EntityManager,
  ) {
    const updatedResource = Object.assign(resource, resourceUpdateDto)
    return await manager.save(Resource, updatedResource)
  }
  async removeResource(resource: Resource, manager: EntityManager) {
    resource.deletedAt = new Date()
    return await manager.save(Resource, resource)
  }
  async batchRemoveResource(resources: Resource[], manager: EntityManager) {
    resources.forEach((resource) => {
      resource.deletedAt = new Date()
    })
    return await manager.save(resources)
  }
  async updateResourceStatus(resource: Resource, status: number, manager: EntityManager) {
    resource.status = status
    return await manager.save(Resource, resource)
  }
  async batchUpdateResourceStatus(resources: Resource[], status: number, manager: EntityManager) {
    resources.forEach((resource) => {
      resource.status = status
    })
    return await manager.save(resources)
  }
  async batchUpdateSortNumber(resource: Resource, manager: EntityManager) {
    const qb = manager
      .createQueryBuilder()
      .update(Resource)
      .set({
        sortNumber: () => 'sortNumber - 1',
      })
      .where('sortNumber > :sortNumber', { sortNumber: resource.sortNumber })

    if (!resource.parentUniqueProp) {
      qb.andWhere('parentUniqueProp IS NULL')
    } else {
      qb.andWhere('parentUniqueProp = :parentUniqueProp', {
        parentUniqueProp: resource.parentUniqueProp,
      })
    }

    await qb.execute()
  }
  async resetSortNumber(manager: EntityManager) {
    const sql = `
      UPDATE system_resource r
      JOIN (
          SELECT 
              id,
              ROW_NUMBER() OVER (
                  PARTITION BY COALESCE(parent_unique_prop, '') 
                  ORDER BY sort_number ASC, created_at ASC, id ASC
              ) AS new_sort
          FROM system_resource
          WHERE deleted_at IS NULL
      ) tmp ON r.id = tmp.id
      SET r.sort_number = tmp.new_sort
      WHERE r.sort_number != tmp.new_sort;
    `

    await manager.query(sql)
  }
}
