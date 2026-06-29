import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { RoleService } from '@/modules/role/role.service'
import { RolePageRespDto } from '@/modules/role/dto/role.page.resp.dto'
import { RolePageDto } from '@/modules/role/dto/role.page.dto'
import { RolePageOptionDto } from '@/modules/role/dto/role.page.option.dto'
import { RoleRespDto } from '@/modules/role/dto/role.resp.dto'
import { RoleListRespDto } from '@/modules/role/dto/role.list.resp.dto'
import { RoleCreateDto } from '@/modules/role/dto/role.create.resp.dto'
import { RoleUpdateDto } from '@/modules/role/dto/role.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('')
  @ApiOperation({ summary: '分页查询角色列表' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageRole(@Query() query: RolePageDto): Promise<PaginatedResult<RolePageRespDto>> {
    return await this.roleService.pageRole(query)
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询角色列表(可选字段)' })
  @ApiSuccessPageResponse(RolePageRespDto)
  async pageOptionRole(
    @Query() query: RolePageOptionDto,
  ): Promise<PaginatedResult<Partial<RolePageRespDto>>> {
    return await this.roleService.pageOptionRole(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '按id查询角色' })
  @ApiSuccessResponse(RoleRespDto)
  async findRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleRespDto | null> {
    const role = await this.roleService.findRoleById(id)
    if (!role) {
      throw new NotFoundException('未找到资源')
    }
    return role
  }

  @Post('batch/query')
  @ApiOperation({ summary: '按ids查询角色' })
  @ApiSuccessResponse(RoleRespDto)
  async findRoleListByIds(@Body() body: BatchDto): Promise<RoleListRespDto | null> {
    return await this.roleService.findRoleListByIds(body.ids)
  }

  @Post('')
  @ApiOperation({ summary: '创建角色' })
  @ApiSuccessResponse(RoleRespDto)
  async createRole(@Body() body: RoleCreateDto): Promise<RoleRespDto | null> {
    return await this.roleService.createRole(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '修改角色' })
  @ApiSuccessResponse(RoleRespDto)
  async updateRole(
    @Param('id') id: number,
    @Body() body: RoleUpdateDto,
  ): Promise<RoleRespDto | null> {
    return await this.roleService.updateRole(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiSuccessResponse()
  async removeRole(@Param('id') id: number) {
    return await this.roleService.removeRole(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除角色' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveRole(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.roleService.batchRemoveRole(body.ids)
  }

  @Post(':id/status')
  @ApiOperation({ summary: '修改角色状态' })
  @ApiSuccessResponse()
  async updateRoleStatus(@Param('id') id: number, @Body() body: Pick<RoleUpdateDto, 'status'>) {
    return await this.roleService.updateRoleStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改角色状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateRoleStatus(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.roleService.batchUpdateRoleStatus(body)
  }

  @Get('template')
  @ApiOperation({ summary: '下载导入角色模板' })
  @ApiSuccessResponse()
  async downloadRoleTemplate() {
    return await this.roleService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入角色数据' })
  @ApiSuccessResponse()
  async importRole() {
    return await this.roleService.importRole()
  }

  @Post('export')
  @ApiOperation({ summary: '导出角色数据' })
  @ApiSuccessResponse()
  async exportRole() {
    return await this.roleService.exportRole()
  }
}
