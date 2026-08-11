import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ValueSetService } from '@/modules/value-set/value-set.service'
import { ValueSetPageRespDto } from '@/modules/value-set/dto/value-set.page.resp.dto'
import { ValueSetListDto, ValueSetPageDto } from '@/modules/value-set/dto/value-set.page.dto'
import { ValueSetPageOptionDto } from '@/modules/value-set/dto/value-set.page.option.dto'
import { ValueSetRespDto } from '@/modules/value-set/dto/value-set.resp.dto'
import { ValueSetListRespDto } from '@/modules/value-set/dto/value-set.list.resp.dto'
import { ValueSetCreateDto } from '@/modules/value-set/dto/value-set.create.dto'
import { ValueSetUpdateDto } from '@/modules/value-set/dto/value-set.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'

@ApiTags('值集模块')
@Controller('value-set')
export class ValueSetController {
  constructor(private readonly valueSetService: ValueSetService) {}

  @Get('page')
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

  @Get('option')
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
  @ApiOperation({ summary: '按id查询值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async findValueSetById(@Param('id', ParseIntPipe) id: number): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.findValueSetById(id)
  }

  @Get('batch/query')
  @ApiOperation({ summary: '按ids查询值集' })
  @ApiSuccessResponse(ValueSetListRespDto)
  async findValueSetListByIds(@Query() query: BatchDto): Promise<ValueSetListRespDto | null> {
    return await this.valueSetService.findValueSetListByIds(query.ids)
  }

  @Post('create')
  @ApiOperation({ summary: '创建值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async createValueSet(@Body() body: ValueSetCreateDto): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.createValueSet(body)
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改值集' })
  @ApiSuccessResponse(ValueSetRespDto)
  async updateValueSet(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ValueSetUpdateDto,
  ): Promise<ValueSetRespDto | null> {
    return await this.valueSetService.updateValueSet(id, body)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除值集' })
  @ApiSuccessResponse()
  async removeValueSet(@Param('id') id: number) {
    return await this.valueSetService.removeValueSet(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除值集' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveValueSet(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.valueSetService.batchRemoveValueSet(body.ids)
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改值集状态' })
  @ApiSuccessResponse()
  async updateValueSetStatus(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.valueSetService.updateValueSetStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改值集状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateValueSetStatus(
    @Body() body: BatchUpdateStatusDto,
  ): Promise<BatchRespDto | null> {
    return await this.valueSetService.batchUpdateValueSetStatus(body)
  }

  @Post('template')
  @ApiOperation({ summary: '下载导入值集模板' })
  @ApiSuccessResponse()
  async downloadValueSetTemplate() {
    return await this.valueSetService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入值集数据' })
  @ApiSuccessResponse()
  async importValueSet() {
    return await this.valueSetService.importValueSet()
  }

  @Post('export')
  @ApiOperation({ summary: '导出值集数据' })
  @ApiSuccessResponse()
  async exportValueSet() {
    return await this.valueSetService.exportValueSet()
  }
}
