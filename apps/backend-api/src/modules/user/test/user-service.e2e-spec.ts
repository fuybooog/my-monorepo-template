import { INestApplication } from '@nestjs/common'
import { DataSource, In } from 'typeorm'
import { UserService } from '@/modules/user/user.service'
import { User } from '@/modules/user/entities/user.entity'
import { BusinessException } from '@/exceptions/business-exception'
import { createTestApp } from '../../../../test/test-util'

describe('UserService (E2E/Integration)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let userService: UserService

  // 模拟初始数据
  const initialUsers = [
    {
      userName: 'alex_test',
      mobile: '13800000001',
      pinyin: 'alex',
      status: '1',
      nickName: '亚历山大',
    },
    { userName: 'bob_test', mobile: '13800000002', pinyin: 'bob', status: '0', nickName: '鲍勃' },
    {
      userName: 'charlie_test',
      mobile: '13800000003',
      pinyin: 'charlie',
      status: '1',
      nickName: '查理',
    },
  ]

  beforeAll(async () => {
    ;({ app, dataSource } = await createTestApp())
    userService = app.get<UserService>(UserService)
  })

  beforeEach(async () => {
    // 每次测试前清空并重置数据，确保测试隔离性
    const userRepository = dataSource.getRepository(User)
    await userRepository.clear()
    await userRepository.save(initialUsers)
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  // ==========================================
  // 1. 增/删/改/查 基础与核心字段入库测试
  // ==========================================
  describe('核心基础 CRUD 校验', () => {
    it('应成功全字段入库创建用户，并支持选填字段', async () => {
      const fullUserDto = {
        userName: 'david_full',
        nickName: '大卫',
        mobile: '13911112222',
        gender: '1',
        genderName: '男',
        birth: '1995-05-05',
        address: '北京市',
        addressDetail: '朝阳区某街道',
        maritalStatus: '0',
        maritalStatusName: '未婚',
        email: 'david@test.com',
        status: '1',
      }

      const result = await userService.createUser(fullUserDto)
      expect(result).toBeDefined()
      expect(result?.id).toBeGreaterThan(0)

      // 数据库核对入库字段
      const saved = await userService.findUserById(result!.id)
      expect(saved).toMatchObject(fullUserDto)
    })

    it('应支持对已有用户更新多字段属性', async () => {
      const target = await dataSource.getRepository(User).findOneBy({ userName: 'alex_test' })

      const updateDto = {
        nickName: '新阿历克斯',
        mobile: '13899999999',
        address: '上海市',
      }

      await userService.updateUser(target!.id, updateDto)
      const updated = await userService.findUserById(target!.id)

      expect(updated?.nickName).toBe(updateDto.nickName)
      expect(updated?.mobile).toBe(updateDto.mobile)
      expect(updated?.address).toBe(updateDto.address)
      expect(updated?.userName).toBe(target!.userName) // 账号应保持不变
    })

    it('单条删除用户，后续查询应抛出未找到异常', async () => {
      const target = await dataSource.getRepository(User).findOneBy({ userName: 'bob_test' })

      await userService.removeUser(target!.id)

      await expect(userService.findUserById(target!.id)).rejects.toThrow()
    })
  })

  // ==========================================
  // 2. 字段检索与分页查询细粒度测试
  // ==========================================
  describe('检索与高级查询机制', () => {
    it('pageUser: 应该能返回标准结构的分页列表', async () => {
      const res = await userService.pageUser({ page: 1, pageSize: 2 })
      expect(res.list.length).toBe(2)
      expect(res.total).toBe(3)
    })

    it('pageOptionUser: 应该能根据 SEARCHABLE_FIELDS 模糊匹配 keyword（用户名/手机/拼音）', async () => {
      // 1. 匹配 userName
      const resName = await userService.pageOptionUser({ keyword: 'alex', page: 1, pageSize: 10 })
      expect(resName.list.some((u) => u.userName === 'alex_test')).toBe(true)

      // 2. 匹配 手机号
      const resMobile = await userService.pageOptionUser({
        keyword: '13800000003',
        page: 1,
        pageSize: 10,
      })
      expect(resMobile.list.some((u) => u.userName === 'charlie_test')).toBe(true)

      // 3. 匹配未命中的关键字
      const resNone = await userService.pageOptionUser({
        keyword: 'not_exist',
        page: 1,
        pageSize: 10,
      })
      expect(resNone.total).toBe(0)
    })

    it('pageOptionUser: 应能通过 fields 参数进行字段精准投影剪裁', async () => {
      const res = await userService.pageOptionUser({
        fields: 'id,userName',
        page: 1,
        pageSize: 1,
      })
      const firstUser = res.list[0]
      expect(firstUser.id).toBeDefined()
      expect(firstUser.userName).toBeDefined()
      // 由于 class-transformer 的作用，未指明的列不会作为实体携带返回（或为 undefined / null）
      expect(firstUser.mobile).toBeUndefined()
    })

    it('findUserListByIds: 输入拼接 IDs，应正确区分存在与不存在的 ID 列表', async () => {
      const users = await dataSource.getRepository(User).find({ take: 2 })
      const validIds = users.map((u) => u.id).join(',')
      const mixedIds = `${validIds},9999,8888`

      const res = await userService.findUserListByIds(mixedIds)
      expect(res?.list.length).toBe(2)
      expect(res?.notFoundIds).toContain(9999)
      expect(res?.notFoundIds).toContain(8888)
    })
  })

  // ==========================================
  // 3. 业务唯一性校验规则（用户名/手机号）
  // ==========================================
  describe('checkUserFieldUnique 唯一性策略校验', () => {
    it('新增用户：用户名存在冲突时应抛出 BusinessException 异常', async () => {
      const duplicateDto = { userName: 'alex_test', mobile: '13900009999' }
      await expect(userService.createUser(duplicateDto)).rejects.toThrow(BusinessException)
    })

    it('新增用户：手机号存在冲突时应抛出 BusinessException 异常', async () => {
      const duplicateDto = { userName: 'new_user', mobile: '13800000001' } // 13800000001 已分配给 alex_test
      await expect(userService.createUser(duplicateDto)).rejects.toThrow(BusinessException)
    })

    it('编辑修改用户：允许当前用户保留自己已拥有的唯一值', async () => {
      const target = await dataSource.getRepository(User).findOneBy({ userName: 'alex_test' })
      // 修改其他字段，保持原 userName 和 mobile 不变，不应报错
      await expect(
        userService.updateUser(target!.id, { userName: 'alex_test', nickName: '新昵称' }),
      ).resolves.not.toThrow()
    })

    it('编辑修改用户：若修改目标与其他用户的唯一字段冲突则报错', async () => {
      const alex = await dataSource.getRepository(User).findOneBy({ userName: 'alex_test' })
      // 试图把 alex 的手机号改成 bob 正在用的 '13800000002'
      await expect(userService.updateUser(alex!.id, { mobile: '13800000002' })).rejects.toThrow(
        BusinessException,
      )
    })
  })

  // ==========================================
  // 4. 批量操作与状态扭转测试
  // ==========================================
  describe('批量处理与状态维护机制', () => {
    it('updateUserStatus: 应单条正常转换目标用户状态', async () => {
      const target = await dataSource.getRepository(User).findOneBy({ userName: 'bob_test' }) // 初始状态为 '0'
      await userService.updateUserStatus(target!.id, { status: '1' })

      const updated = await userService.findUserById(target!.id)
      expect(updated?.status).toBe('1')
    })

    it('batchUpdateUserStatus: 应成批批量更新选中用户的状态，并识别漏掉的 IDs', async () => {
      const users = await dataSource.getRepository(User).find()
      const idsStr = `${users[0].id},${users[1].id},7777`

      const res = await userService.batchUpdateUserStatus({
        ids: idsStr,
        status: '0',
      })

      expect(res?.notFoundIds).toContain(7777)

      // 重新拉取检查库内记录
      const updatedUsers = await dataSource
        .getRepository(User)
        .findBy({ id: In([users[0].id, users[1].id]) })
      expect(updatedUsers.every((u) => u.status === '0')).toBe(true)
    })

    it('batchRemoveUser: 应批量连带抹除多条记录', async () => {
      const users = await dataSource.getRepository(User).find()
      const idsStr = `${users[0].id},${users[1].id},6666`

      const res = await userService.batchRemoveUser(idsStr)
      expect(res?.notFoundIds).toContain(6666)

      const remainingCount = await dataSource.getRepository(User).count()
      expect(remainingCount).toBe(1) // 3条被删掉2条，只剩下1条
    })
  })
})
