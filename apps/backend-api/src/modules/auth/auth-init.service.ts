import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { UserService } from '@/modules/user/user.service'
import bcrypt from 'bcrypt'
import { RoleService } from '@/modules/role/role.service'
import { RoleRepository } from '@/modules/role/role.repository'
import { MAX_ROLE_LEVEL } from '@/constants'
import { BaseStatusEnum } from '@/enum/base-status.enum'

@Injectable()
export class AuthInitService implements OnModuleInit {
  private logger = new Logger(AuthInitService.name)
  private token: string | null = null
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly roleRepository: RoleRepository,
  ) {}

  onModuleInit() {
    this.token = uuidv4()
    this.logger.warn('========================================================')
    this.logger.warn(`  系统初始化令牌（一次性）: ${this.token}`)
    this.logger.warn('  请调用 POST /auth/init 并在 Header 中携带:')
    this.logger.warn(`  X-Init-Token: ${this.token}`)
    this.logger.warn('========================================================')
  }

  validateToken(initToken: string) {
    if (!this.token || !initToken) {
      throw new UnauthorizedException('初始化令牌无效或已过期')
    }
    if (this.token !== initToken) {
      throw new UnauthorizedException('初始化令牌无效或已过期')
    } else {
      this.token = null // 销毁token
      return true
    }
  }

  async initAdmin(plainPassword: string) {
    const adminUser = await this.userService.findUserWithPasswordByUserName('admin')
    if (adminUser && adminUser.password) {
      throw new ForbiddenException('系统已初始化，该接口已永久关闭')
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/

    if (!passwordRegex.test(plainPassword)) {
      throw new BadRequestException('密码必须至少8位，且包含大小写字母、数字和特殊字符')
    }
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    // admin
    let adminEntity
    if (!(adminUser && adminUser.id)) {
      adminEntity = await this.userService.createUser({
        userName: 'admin',
        nickName: '超级管理员',
        password: passwordHash,
        mobile: '18800000000',
        status: BaseStatusEnum.ENABLE,
        py: 'cjgly',
        pinyin: 'chaojiguanliyuan',
      })
      this.logger.log(`超级管理员账号已创建，用户名: admin, 密码: ${plainPassword}`)
    } else {
      await this.userService.updateUserPassword(adminUser.id!, passwordHash)
      adminEntity = {
        id: adminUser.id!,
      }
      this.logger.log(`超级管理员账号已更新密码，用户名: admin, 新密码: ${plainPassword}`)
    }
    // 角色
    const roleRes = await this.roleService.pageRole(
      {
        roleCode: '"admin"', // 按 admin 精确查询
        page: 1,
        pageSize: 1,
      },
      MAX_ROLE_LEVEL,
    )
    let roleEntity
    if (roleRes.list.length === 1) {
      roleEntity = roleRes.list[0]
      this.logger.log(`超级管理员角色已存在`)
    } else {
      roleEntity = await this.roleService.createRole(
        {
          roleCode: 'admin',
          roleName: '超级管理员',
          status: BaseStatusEnum.ENABLE,
        },
        MAX_ROLE_LEVEL,
      )
      this.logger.log(`超级管理员角色已创建，角色编码: admin`)
    }
    // 关系
    const relationList = await this.roleRepository.getUserIdsByRoleId(roleEntity!.id!)
    if (!(relationList.length > 0 && relationList.includes(adminEntity!.id!))) {
      await this.roleRepository.assignUsersToRole(roleEntity!.id!, [adminEntity!.id!])
      this.logger.log(`超级管理员角色已分配给用户 admin`)
    } else {
      this.logger.log(`超级管理员角色与用户 admin 已关联`)
    }
  }
}
