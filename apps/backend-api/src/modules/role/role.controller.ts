import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { RoleService } from '@/modules/role/role.service'
import { RolePageRespDto } from '@/modules/role/dto/role.page.resp.dto'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { RolePageOptionDto } from '@/modules/role/dto/role.page.option.dto'
import { RoleRespDto } from '@/modules/role/dto/role.resp.dto'
import { RoleListRespDto } from '@/modules/role/dto/role.list.resp.dto'
import { RoleCreateDto } from '@/modules/role/dto/role.create.dto'
import { RoleUpdateDto } from '@/modules/role/dto/role.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { CurrentUser } from '@/decorators/current-user.decorator'
import { CurrentLoginResponseDto } from '@/modules/auth/auth.dto'
import { RequirePermissions } from '@/decorators/require-permissions.decorator'
import { PERMISSIONS } from '@repo/shared'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('page')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_PAGE)
  @ApiOperation({ summary: '分页查询角色列表' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageRole(
    @Query() query: RolePageDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<PaginatedResult<RolePageRespDto>> {
    return await this.roleService.pageRole(query, user.maxLevel)
  }

  @Post('schema-generator-holder-page-role')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageRole(@Body() _body: RolePageDto) {
    return null
  }

  @Get('option')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_PAGE)
  @ApiOperation({ summary: '分页查询角色列表(可选字段)' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageOptionRole(
    @Query() query: RolePageOptionDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<PaginatedResult<Partial<RolePageRespDto>>> {
    return await this.roleService.pageOptionRole(query, user)
  }

  @Post('schema-generator-holder-page-option-role')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOptionRole(@Body() _body: RolePageOptionDto) {
    return null
  }

  @Get('find/:id')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_VIEW)
  @ApiOperation({ summary: '按id查询角色' })
  @ApiSuccessResponse(RoleRespDto)
  async findRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleRespDto | null> {
    const role = await this.roleService.findRoleById(id)
    return role
  }

  @Get('batch/query')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_VIEW)
  @ApiOperation({ summary: '按ids查询角色' })
  @ApiSuccessResponse(RoleListRespDto)
  async findRoleListByIds(@Query() query: BatchDto): Promise<RoleListRespDto | null> {
    return await this.roleService.findRoleListByIds(query.ids)
  }

  @Post('create')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_CREATE)
  @ApiOperation({ summary: '创建角色' })
  @ApiSuccessResponse(RoleRespDto)
  async createRole(
    @Body() body: RoleCreateDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<RoleRespDto | null> {
    return await this.roleService.createRole(body, user.maxLevel)
  }

  @Post('update/:id')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_EDIT)
  @ApiOperation({ summary: '修改角色' })
  @ApiSuccessResponse(RoleRespDto)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleUpdateDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<RoleRespDto | null> {
    return await this.roleService.updateRole(id, body, user)
  }

  @Post('delete/:id')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_DELETE)
  @ApiOperation({ summary: '删除角色' })
  @ApiSuccessResponse()
  async removeRole(@Param('id') id: number, @CurrentUser() user: CurrentLoginResponseDto) {
    return await this.roleService.removeRole(id, user)
  }

  @Post('batch/delete')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_DELETE)
  @ApiOperation({ summary: '批量删除角色' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveRole(
    @Body() body: BatchDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<BatchRespDto | null> {
    return await this.roleService.batchRemoveRole(body.ids, user)
  }

  @Post('updateStatus/:id')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_EDIT)
  @ApiOperation({ summary: '修改角色状态' })
  @ApiSuccessResponse()
  async updateRoleStatus(
    @Param('id') id: number,
    @Body() body: UpdateStatusDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ) {
    return await this.roleService.updateRoleStatus(id, body, user)
  }

  @Post('batch/status')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_EDIT)
  @ApiOperation({ summary: '批量修改角色状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateRoleStatus(
    @Body() body: BatchUpdateStatusDto,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<BatchRespDto | null> {
    return await this.roleService.batchUpdateRoleStatus(body, user)
  }

  @Post('template')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_IMPORT)
  @ApiOperation({ summary: '下载导入角色模板' })
  @ApiSuccessResponse()
  async downloadRoleTemplate() {
    return await this.roleService.downloadTemplate()
  }

  @Post('import')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_IMPORT)
  @ApiOperation({ summary: '导入角色数据' })
  @ApiSuccessResponse()
  async importRole() {
    return await this.roleService.importRole()
  }

  @Post('export')
  @RequirePermissions(PERMISSIONS.SYS_ROLE_LIST_EXPORT)
  @ApiOperation({ summary: '导出角色数据' })
  @ApiSuccessResponse()
  async exportRole() {
    return await this.roleService.exportRole()
  }
}
