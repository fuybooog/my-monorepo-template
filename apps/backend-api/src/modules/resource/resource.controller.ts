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
import { ResourceService } from '@/modules/resource/resource.service'
import { ResourcePageRespDto } from '@/modules/resource/dto/resource.page.resp.dto'
import { ResourcePageDto } from '@/modules/resource/dto/resource.page.dto'
import { ResourcePageOptionDto } from '@/modules/resource/dto/resource.page.option.dto'
import { ResourceRespDto } from '@/modules/resource/dto/resource.resp.dto'
import { ResourceListRespDto } from '@/modules/resource/dto/resource.list.resp.dto'
import { ResourceCreateDto } from '@/modules/resource/dto/resource.create.resp.dto'
import { ResourceUpdateDto } from '@/modules/resource/dto/resource.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get('')
  @ApiOperation({ summary: '分页查询资源列表' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async pageResource(
    @Query() query: ResourcePageDto,
  ): Promise<PaginatedResult<ResourcePageRespDto>> {
    return await this.resourceService.pageResource(query)
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询资源列表(可选字段)' })
  @ApiSuccessPageResponse(ResourcePageRespDto)
  async pageOptionResource(
    @Query() query: ResourcePageOptionDto,
  ): Promise<PaginatedResult<Partial<ResourcePageRespDto>>> {
    return await this.resourceService.pageOptionResource(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '按id查询资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async findResourceById(@Param('id', ParseIntPipe) id: number): Promise<ResourceRespDto | null> {
    const resource = await this.resourceService.findResourceById(id)
    if (!resource) {
      throw new NotFoundException('未找到资源')
    }
    return resource
  }

  @Post('batch/query')
  @ApiOperation({ summary: '按ids查询资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async findResourceListByIds(@Body() body: BatchDto): Promise<ResourceListRespDto | null> {
    return await this.resourceService.findResourceListByIds(body.ids)
  }

  @Post('')
  @ApiOperation({ summary: '创建资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async createResource(@Body() body: ResourceCreateDto): Promise<ResourceRespDto | null> {
    return await this.resourceService.createResource(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '修改资源' })
  @ApiSuccessResponse(ResourceRespDto)
  async updateResource(
    @Param('id') id: number,
    @Body() body: ResourceUpdateDto,
  ): Promise<ResourceRespDto | null> {
    return await this.resourceService.updateResource(id, body)
  }

  @Delete(':id')
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

  @Post(':id/status')
  @ApiOperation({ summary: '修改资源状态' })
  @ApiSuccessResponse()
  async updateResourceStatus(
    @Param('id') id: number,
    @Body() body: Pick<ResourceUpdateDto, 'status'>,
  ) {
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

  @Get('template')
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
