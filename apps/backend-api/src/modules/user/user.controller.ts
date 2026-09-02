import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { UserService } from '@/modules/user/user.service'
import { UserPageRespDto } from '@/modules/user/dto/user.page.resp.dto'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { UserPageOptionDto } from '@/modules/user/dto/user.page.option.dto'
import { UserRespDto } from '@/modules/user/dto/user.resp.dto'
import { UserListRespDto } from '@/modules/user/dto/user.list.resp.dto'
import { UserCreateDto } from '@/modules/user/dto/user.create.dto'
import { UserUpdateDto } from '@/modules/user/dto/user.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiSuccessBooleanResponse,
  ApiSuccessPageResponse,
  ApiSuccessResponse,
} from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UserCheckUniqueDto } from './dto/user.check.unique.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import {
  AdminResetPasswordDto,
  AssignRolesToUserDto,
  FindRolesByUserIdResp,
  ResetPasswordDto,
} from '@/modules/user/dto/user.dto'
import { CurrentUser } from '@/decorators/current-user.decorator'
import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'
import { RequirePermissions } from '@/decorators/require-permissions.decorator'
import { PERMISSIONS } from '@repo/shared'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('page')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_PAGE)
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiSuccessPageResponse(UserPageRespDto)
  async pageUser(
    @Query() query: UserPageDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<PaginatedResult<UserPageRespDto>> {
    return await this.userService.pageUser(query, user.maxLevel)
  }

  @Post('schema-generator-holder-page-user')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageUser(@Body() _body: UserPageDto) {
    return null
  }

  @Get('option')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_PAGE)
  @ApiOperation({ summary: '分页查询用户列表(可选字段)' })
  @ApiSuccessPageResponse(UserPageRespDto)
  async pageOptionUser(
    @Query() query: UserPageOptionDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<PaginatedResult<Partial<UserPageRespDto>>> {
    return await this.userService.pageOptionUser(query, user.maxLevel)
  }

  @Post('schema-generator-holder-page-option-user')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOptionUser(@Body() _body: UserPageOptionDto) {
    return null
  }

  @Get('find/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_VIEW)
  @ApiOperation({ summary: '按id查询用户' })
  @ApiSuccessResponse(UserRespDto)
  async findUserById(@Param('id', ParseIntPipe) id: number): Promise<UserRespDto | null> {
    const user = await this.userService.findUserById(id)
    return user
  }

  @Get('findRolesByUserId/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_VIEW)
  @ApiOperation({ summary: '按id查询角色' })
  @ApiSuccessResponse(FindRolesByUserIdResp)
  async findRolesByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindRolesByUserIdResp | null> {
    return await this.userService.findRolesByUserId(id)
  }

  @Post('assignRolesToUser/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_ASSIGN_ROLE)
  @ApiOperation({ summary: '按id查询角色' })
  @ApiSuccessResponse()
  async assignRolesToUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignRolesToUserDto,
  ) {
    return await this.userService.assignRolesToUser(body.roleIds, id)
  }

  @Get('batch/query')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_VIEW)
  @ApiOperation({ summary: '按ids查询用户' })
  @ApiSuccessResponse(UserListRespDto)
  async findUserListByIds(@Query() query: BatchDto): Promise<UserListRespDto | null> {
    return await this.userService.findUserListByIds(query.ids)
  }

  @Post('create')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_CREATE)
  @ApiOperation({ summary: '创建用户' })
  @ApiSuccessResponse(UserRespDto)
  async createUser(@Body() body: UserCreateDto): Promise<UserRespDto | null> {
    return await this.userService.createUser(body)
  }

  @Post('update/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_EDIT)
  @ApiOperation({ summary: '修改用户' })
  @ApiSuccessResponse(UserRespDto)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserUpdateDto,
  ): Promise<UserRespDto | null> {
    return await this.userService.updateUser(id, body)
  }

  @Post('delete/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_DELETE)
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse()
  async removeUser(@Param('id') id: number) {
    return await this.userService.removeUser(id)
  }

  @Post('batch/delete')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_DELETE)
  @ApiOperation({ summary: '批量删除用户' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveUser(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.userService.batchRemoveUser(body.ids)
  }

  @Post('updateStatus/:id')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_EDIT)
  @ApiOperation({ summary: '修改用户状态' })
  @ApiSuccessResponse()
  async updateUserStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.userService.updateUserStatus(id, body)
  }

  @Post('batch/status')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_EDIT)
  @ApiOperation({ summary: '批量修改用户状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateUserStatus(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.userService.batchUpdateUserStatus(body)
  }

  @Post('template')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_IMPORT)
  @ApiOperation({ summary: '下载导入用户模板' })
  @ApiSuccessResponse()
  async downloadUserTemplate() {
    return await this.userService.downloadTemplate()
  }

  @Post('import')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_IMPORT)
  @ApiOperation({ summary: '导入用户数据' })
  @ApiSuccessResponse()
  async importUser() {
    return await this.userService.importUser()
  }

  @Post('export')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_EXPORT)
  @ApiOperation({ summary: '导出用户数据' })
  @ApiSuccessResponse()
  async exportUser() {
    return await this.userService.exportUser()
  }
  @Get('check-unique')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_VIEW)
  @ApiOperation({ summary: '检测字段是否唯一' })
  @ApiSuccessBooleanResponse()
  async checkUnique(userCheckUniqueDto: UserCheckUniqueDto): Promise<boolean> {
    return await this.userService.checkUserFieldUnique(userCheckUniqueDto)
  }
  @Post('adminResetPassword')
  @RequirePermissions(PERMISSIONS.SYS_USER_LIST_RESET_PWD)
  @ApiOperation({ summary: '重置密码' })
  @ApiSuccessResponse()
  async adminResetPassword(@Body() body: AdminResetPasswordDto) {
    return await this.userService.adminResetPassword(body)
  }
  @Post('resetPassword')
  @ApiOperation({ summary: '修改密码' })
  @ApiSuccessResponse()
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.userService.resetPassword(body)
  }
}
