import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ResourceService } from '@/modules/resource/resource.service'
import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.dto'
import { ResourceUpdateDto } from '@/modules/resource/dto/resource.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get('page')
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async pageResource(
    @Query() query: ResourcePageDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    return await this.resourceService.pageResource(query)
  }

  @Post('schema-generator-holder-page-resource')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageResource(@Body() _body: ResourcePageDto) {
    return null
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询用户列表(可选字段)' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async pageOptionResource(
    @Query() query: ResourcePageOptionDto,
  ): Promise<PaginatedResult<Partial<ResourcePageRespDto>>> {
    return await this.resourceService.pageOptionResource(query)
  }

  @Post('schema-generator-holder-page-option-resource')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOptionResource(@Body() _body: ResourcePageOptionDto) {
    return null
  }

  @Get('find/:id')
  @ApiOperation({ summary: '按id查询用户' })
  @ApiSuccessResponse(ResourceRespDto)
  async findResourceById(@Param('id', ParseIntPipe) id: number): Promise<ResourceRespDto | null> {
    const resource = await this.resourceService.findResourceById(id)
    return resource
  }

  @Get('batch/query')
  @ApiOperation({ summary: '按ids查询用户' })
  @ApiSuccessResponse(ResourceListRespDto)
  async findResourceListByIds(@Query() query: BatchDto): Promise<ResourceListRespDto | null> {
    return await this.resourceService.findResourceListByIds(query.ids)
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  @ApiSuccessResponse(ResourceRespDto)
  async createResource(@Body() body: ResourceCreateDto): Promise<ResourceRespDto | null> {
    return await this.resourceService.createResource(body)
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改用户' })
  @ApiSuccessResponse(ResourceRespDto)
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    return await this.resourceService.updateResource(id, body)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse()
  async removeResource(@Param('id') id: number) {
    return await this.resourceService.removeResource(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除用户' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveResource(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.resourceService.batchRemoveResource(body.ids)
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改用户状态' })
  @ApiSuccessResponse()
  async updateResourceStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.resourceService.updateResourceStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改用户状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateResourceStatus(
    @Body() body: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return await this.resourceService.batchUpdateResourceStatus(body)
  }

  @Post('template')
  @ApiOperation({ summary: '下载导入用户模板' })
  @ApiSuccessResponse()
  async downloadResourceTemplate() {
    return await this.resourceService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入用户数据' })
  @ApiSuccessResponse()
  async importResource() {
    return await this.resourceService.importResource()
  }

  @Post('export')
  @ApiOperation({ summary: '导出用户数据' })
  @ApiSuccessResponse()
  async exportResource() {
    return await this.resourceService.exportResource()
  }
}
