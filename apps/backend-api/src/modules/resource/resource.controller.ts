import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ResourceService } from '@/modules/resource/resource.service'
import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.dto'
import {
  ResourceBatchUpdateDto,
  ResourceUpdateDto,
} from '@/modules/resource/dto/resource.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { CurrentUser } from '@/decorators/current-user.decorator'
import { CurrentLoginResponseDto } from '../auth/auth.dto'
import { ListResp } from '@/dto/base.dto'

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get('page')
  @ApiOperation({ summary: '分页查询资源列表' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async pageResource(
    @Query() query: ResourcePageDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    return await this.resourceService.pageResource(query)
  }

  @Get('list')
  @ApiOperation({ summary: '查询全量资源列表' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async listAllResource(@Query() query: ResourcePageDto): Promise<ListResp<ResourcePageRespDto>> {
    return await this.resourceService.listAllResource(query)
  }

  @Get('listByUser')
  @ApiOperation({ summary: '查询用户的菜单资源' })
  @ApiSuccessResponse()
  async listResourceByUser(
    @Query('id', new ParseIntPipe({ optional: true })) id: number | undefined,
    @CurrentUser() user: CurrentLoginResponseDto,
  ): Promise<ListResp<ResourcePageRespDto>> {
    return await this.resourceService.listByUser(id || user.id)
  }

  @Post('schema-generator-holder-page-resource')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageResource(@Body() _body: ResourcePageDto) {
    return null
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询资源列表(可选字段)' })
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
  @ApiOperation({ summary: '按id查询资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async findResourceById(@Param('id', ParseIntPipe) id: number): Promise<ResourceRespDto | null> {
    const resource = await this.resourceService.findResourceById(id)
    return resource
  }

  @Get('batch/query')
  @ApiOperation({ summary: '按ids查询资源' })
  @ApiSuccessResponse(ResourceListRespDto)
  async findResourceListByIds(@Query() query: BatchDto): Promise<ResourceListRespDto | null> {
    return await this.resourceService.findResourceListByIds(query.ids)
  }

  @Post('create')
  @ApiOperation({ summary: '创建资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async createResource(@Body() body: ResourceCreateDto): Promise<ResourceRespDto | null> {
    return await this.resourceService.createResource(body)
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    return await this.resourceService.updateResource(id, body)
  }

  @Post('batchUpdate')
  @ApiOperation({ summary: '批量修改资源' })
  @ApiSuccessResponse()
  async batchUpdateResource(
    @Body() body: ResourceBatchUpdateDto,
  ): Promise<{ info?: string | null }> {
    return await this.resourceService.batchUpdateResource(body.list)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除资源' })
  @ApiSuccessResponse()
  async removeResource(@Param('id') id: number) {
    return await this.resourceService.removeResource(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除资源' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveResource(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.resourceService.batchRemoveResource(body.ids)
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改资源状态' })
  @ApiSuccessResponse()
  async updateResourceStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.resourceService.updateResourceStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改资源状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateResourceStatus(
    @Body() body: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return await this.resourceService.batchUpdateResourceStatus(body)
  }
  @Post('resetSort')
  @ApiOperation({ summary: '重置列表顺序' })
  @ApiSuccessResponse()
  async resetResourceListSort(): Promise<null> {
    return await this.resourceService.resetResourceListSort()
  }

  @Post('template')
  @ApiOperation({ summary: '下载导入资源模板' })
  @ApiSuccessResponse()
  async downloadResourceTemplate() {
    return await this.resourceService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入资源数据' })
  @ApiSuccessResponse()
  async importResource() {
    return await this.resourceService.importResource()
  }

  @Post('export')
  @ApiOperation({ summary: '导出资源数据' })
  @ApiSuccessResponse()
  async exportResource() {
    return await this.resourceService.exportResource()
  }
}
