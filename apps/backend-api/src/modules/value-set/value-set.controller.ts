import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ValueSetService } from '@/modules/value-set/value-set.service'
import { ValueSetPageRespDto } from '@/modules/value-set/dto/value-set.page.resp.dto'
import { ValueSetListDto, ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { ValueSetPageOptionDto } from '@/modules/value-set/dto/value-set.page.option.dto'
import { ValueSetRespDto } from '@/modules/value-set/dto/value-set.resp.dto'
import { ValueSetListRespDto } from '@/modules/value-set/dto/value-set.list.resp.dto'
import { ValueSetGroupPageDto } from '@/modules/value-set/dto/value-set-set.page.dto'
import { ValueSetGroupPageRespDto } from '@/modules/value-set/dto/value-set-set.page.resp.dto'
import { ValueSetCreateDto } from '@/modules/value-set/dto/value-set.create.dto'
import { ValueSetUpdateDto } from '@/modules/value-set/dto/value-set.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'
import { RequirePermissions } from '@/decorators/require-permissions.decorator'
import { PERMISSIONS } from '@repo/shared'

@ApiTags('值集模块')
@Controller('value-set')
export class ValueSetController {
  constructor(private readonly valueSetService: ValueSetService) {}

  @Get('page')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_PAGE)
  @ApiOperation({ summary: '分页查询值集列表' })
  @ApiSuccessPageResponse(ValueSetPageRespDto)
  async pageValueSet(
    @Query() query: ValueSetPageDto,
  ): Promise<PaginatedResult<ValueSetPageRespDto>> {
    return await this.valueSetService.pageValueSet(query)
  }

  @Post('schema-generator-holder-page-value-set')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageValueSet(@Body() _body: ValueSetPageDto) {
    return null
  }

  @Get('sets/page')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_PAGE)
  @ApiOperation({ summary: '集维度分页查询（按 setCode 去重）' })
  @ApiSuccessPageResponse(ValueSetGroupPageRespDto)
  async pageValueSetGroups(
    @Query() query: ValueSetGroupPageDto,
  ): Promise<PaginatedResult<ValueSetGroupPageRespDto>> {
    return await this.valueSetService.pageValueSetGroups(query)
  }

  @Post('schema-generator-holder-sets-page-value-set')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageValueSetGroups(@Body() body: ValueSetGroupPageDto) {
    return null
  }

  @Get('option')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_PAGE)
  @ApiOperation({ summary: '分页查询值集列表(可选字段)' })
  @ApiSuccessPageResponse(ValueSetPageRespDto)
  async pageOptionValueSet(
    @Query() query: ValueSetPageOptionDto,
  ): Promise<PaginatedResult<Partial<ValueSetPageRespDto>>> {
    return await this.valueSetService.pageOptionValueSet(query)
  }

  @Post('schema-generator-holder-page-option-value-set')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOptionValueSet(@Body() _body: ValueSetPageOptionDto) {
    return null
  }

  @Get('by-set-codes')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_VIEW)
  @ApiOperation({ summary: '按集code查询值集' })
  @ApiSuccessResponse(ValueSetListRespDto)
  async findValueSetBySetCodes(
    @Query() query: ValueSetListDto,
  ): Promise<ValueSetListRespDto | null> {
    return await this.valueSetService.findValueSetBySetCodes(query)
  }

  @Post('schema-generator-holder-by-set-codes')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _findValueSetBySetCodes(@Body() body: ValueSetListDto) {
    return null
  }

  @Get('find/:id')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_VIEW)
  @ApiOperation({ summary: '按id查询值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async findValueSetById(@Param('id', ParseIntPipe) id: number): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.findValueSetById(id)
  }

  @Get('batch/query')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_VIEW)
  @ApiOperation({ summary: '按ids查询值集' })
  @ApiSuccessResponse(ValueSetListRespDto)
  async findValueSetListByIds(@Query() query: BatchDto): Promise<ValueSetListRespDto | null> {
    return await this.valueSetService.findValueSetListByIds(query.ids)
  }

  @Post('create')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_CREATE)
  @ApiOperation({ summary: '创建值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async createValueSet(@Body() body: ValueSetCreateDto): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.createValueSet(body)
  }

  @Post('update/:id')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_EDIT)
  @ApiOperation({ summary: '修改值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async updateValueSet(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ValueSetUpdateDto,
  ): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.updateValueSet(id, body)
  }

  @Post('delete/:id')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_DELETE)
  @ApiOperation({ summary: '删除值集' })
  @ApiSuccessResponse()
  async removeValueSet(@Param('id') id: number) {
    return await this.valueSetService.removeValueSet(id)
  }

  @Post('batch/delete')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_DELETE)
  @ApiOperation({ summary: '批量删除值集' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveValueSet(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.valueSetService.batchRemoveValueSet(body.ids)
  }

  @Post('updateStatus/:id')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_EDIT)
  @ApiOperation({ summary: '修改值集状态' })
  @ApiSuccessResponse()
  async updateValueSetStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.valueSetService.updateValueSetStatus(id, body)
  }

  @Post('batch/status')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_EDIT)
  @ApiOperation({ summary: '批量修改值集状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateValueSetStatus(
    @Body() body: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return await this.valueSetService.batchUpdateValueSetStatus(body)
  }

  @Post('template')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_IMPORT)
  @ApiOperation({ summary: '下载导入值集模板' })
  @ApiSuccessResponse()
  async downloadValueSetTemplate() {
    return await this.valueSetService.downloadTemplate()
  }

  @Post('import')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_IMPORT)
  @ApiOperation({ summary: '导入值集数据' })
  @ApiSuccessResponse()
  async importValueSet() {
    return await this.valueSetService.importValueSet()
  }

  @Post('export')
  @RequirePermissions(PERMISSIONS.SYS_VALUE_SET_LIST_EXPORT)
  @ApiOperation({ summary: '导出值集数据' })
  @ApiSuccessResponse()
  async exportValueSet() {
    return await this.valueSetService.exportValueSet()
  }
}
