import { DataSource, EntityManager, getMetadataArgsStorage, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Resource } from '@/modules/resource/entities/resource.entity'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { isTargetOrParent } from '@/utils/fns'
import { ResourceCreateDto } from './dto/resource.create.dto'
import { ResourceUpdateDto } from './dto/resource.update.dto'
import { ResourcePartialDto } from './dto/resource.base.dto'

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
  async searchResourcesByUser(userId: number) {
    const qb = this.createQueryBuilder('resource')

    // todo 排序应该从前端传入
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

    queryBuilder.leftJoinAndSelect('resource.roles', 'role')

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
  async updateResourceStatus(resource: Resource, status: string, manager: EntityManager) {
    resource.status = status
    return await manager.save(Resource, resource)
  }
  async batchUpdateResourceStatus(resources: Resource[], status: string, manager: EntityManager) {
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
