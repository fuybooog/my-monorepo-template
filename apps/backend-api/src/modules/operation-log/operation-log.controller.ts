import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { RequirePermissions } from '@/decorators/require-permissions.decorator'
import { PERMISSIONS } from '@repo/shared'
import { OperationLogService } from '@/modules/operation-log/operation-log.service'
import { OperationLogPageDto } from '@/modules/operation-log/dto/operation-log.page.dto'
import { OperationLogPageRespDto } from '@/modules/operation-log/dto/operation-log.page.resp.dto'
import { OperationLogDetailRespDto } from '@/modules/operation-log/dto/operation-log.detail.resp.dto'
import { OperationLogCleanDto } from '@/modules/operation-log/dto/operation-log.clean.dto'
import { EXCEL_CONTENT_TYPE } from '@/modules/excel/excel.types'

@ApiTags('操作日志模块')
@Controller('operation-log')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get('page')
  @RequirePermissions(PERMISSIONS.SYS_OPERATION_LOG_LIST_PAGE)
  @ApiOperation({ summary: '分页查询操作日志' })
  @ApiSuccessPageResponse(OperationLogPageRespDto)
  async pageLog(@Query() query: OperationLogPageDto) {
    return await this.operationLogService.pageLog(query)
  }

  @Post('schema-generator-holder-page-operation-log')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOperationLog(@Body() _body: OperationLogPageDto) {
    return null
  }

  @Get('detail/:id')
  @RequirePermissions(PERMISSIONS.SYS_OPERATION_LOG_LIST_VIEW)
  @ApiOperation({ summary: '查询操作日志详情（含字段级变更明细）' })
  @ApiSuccessResponse(OperationLogDetailRespDto)
  async findLogById(@Param('id', ParseIntPipe) id: number): Promise<OperationLogDetailRespDto> {
    return await this.operationLogService.findLogById(id)
  }

  @Post('export')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.SYS_OPERATION_LOG_LIST_EXPORT)
  @ApiOperation({ summary: '按查询条件导出操作日志' })
  @ApiOkResponse({ description: 'xlsx 文件流' })
  async exportLogs(@Query() query: OperationLogPageDto): Promise<StreamableFile> {
    const { buffer, fileName } = await this.operationLogService.exportLogs(query)
    return new StreamableFile(buffer, {
      type: EXCEL_CONTENT_TYPE,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    })
  }

  @Post('clean')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.SYS_OPERATION_LOG_LIST_CLEAN)
  @ApiOperation({ summary: '清理操作日志（支持 dryRun 预览）' })
  @ApiSuccessResponse()
  async cleanLogs(@Body() body: OperationLogCleanDto) {
    return await this.operationLogService.cleanLogs(body)
  }
}
