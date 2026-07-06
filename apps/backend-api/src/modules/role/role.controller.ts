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

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('page')
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageRole(@Query() query: RolePageDto): Promise<PaginatedResult<RolePageRespDto>> {
    return await this.roleService.pageRole(query)
  }

  @Post('schema-generator-holder-page-role')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageRole(@Body() _body: RolePageDto) {
    return null
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询用户列表(可选字段)' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageOptionRole(
    @Query() query: RolePageOptionDto,
  ): Promise<PaginatedResult<Partial<RolePageRespDto>>> {
    return await this.roleService.pageOptionRole(query)
  }

  @Post('schema-generator-holder-page-option-role')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOptionRole(@Body() _body: RolePageOptionDto) {
    return null
  }

  @Get('find/:id')
  @ApiOperation({ summary: '按id查询用户' })
  @ApiSuccessResponse(RoleRespDto)
  async findRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleRespDto | null> {
    const role = await this.roleService.findRoleById(id)
    return role
  }

  @Get('batch/query')
  @ApiOperation({ summary: '按ids查询用户' })
  @ApiSuccessResponse(RoleListRespDto)
  async findRoleListByIds(@Query() query: BatchDto): Promise<RoleListRespDto | null> {
    return await this.roleService.findRoleListByIds(query.ids)
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  @ApiSuccessResponse(RoleRespDto)
  async createRole(@Body() body: RoleCreateDto): Promise<RoleRespDto | null> {
    return await this.roleService.createRole(body)
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改用户' })
  @ApiSuccessResponse(RoleRespDto)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RoleUpdateDto,
  ): Promise<RoleRespDto | null> {
    return await this.roleService.updateRole(id, body)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse()
  async removeRole(@Param('id') id: number) {
    return await this.roleService.removeRole(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除用户' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveRole(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.roleService.batchRemoveRole(body.ids)
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改用户状态' })
  @ApiSuccessResponse()
  async updateRoleStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.roleService.updateRoleStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改用户状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateRoleStatus(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.roleService.batchUpdateRoleStatus(body)
  }

  @Post('template')
  @ApiOperation({ summary: '下载导入用户模板' })
  @ApiSuccessResponse()
  async downloadRoleTemplate() {
    return await this.roleService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入用户数据' })
  @ApiSuccessResponse()
  async importRole() {
    return await this.roleService.importRole()
  }

  @Post('export')
  @ApiOperation({ summary: '导出用户数据' })
  @ApiSuccessResponse()
  async exportRole() {
    return await this.roleService.exportRole()
  }
}
