import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SystemUser } from '@/modules/user/entities/system-user.entity';
import { SystemUserPageDto } from '@/modules/user/system-user.dto';

@Injectable()
export class UserRepository extends Repository<SystemUser> {
  constructor(private dataSource: DataSource) {
    super(SystemUser, dataSource.createEntityManager());
  }

  async searchUsersByPage(query: SystemUserPageDto) {
    const { page = 1, pageSize = 10, userName } = query;

    const qb = this.createQueryBuilder('user');

    if (userName) {
      qb.andWhere('user.userName LIKE :userName', {userName})
    }

    // qb.leftJoin('system_user_role', 'ur', 'ur.user_id = user.id')
    //   .leftJoin('system_role', 'role', 'role.id = ur.role_id')
    //   .addSelect(['role.id AS roleId', 'role.role_name AS roleName']);

    // // 3. 动态条件拼接
    // if (keyword) {
    //   qb.andWhere(
    //     '(user.userName LIKE :keyword OR user.mobile LIKE :keyword)',
    //     { keyword: `%${keyword}%` },
    //   );
    // }

    // if (status) {
    //   qb.andWhere('user.status = :status', { status });
    // }

    // if (roleName) {
    //   qb.andWhere('role.role_name = :roleName', { roleName });
    // }

    // todo 排序应该从前端传入
    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [entities, total] = await qb.getManyAndCount();
    
    return { entities, total };
  }
}