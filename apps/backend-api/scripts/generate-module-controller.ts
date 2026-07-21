import { toCamelCase, toKebabCase, toPascalCase } from './utils'

function generateControllerTemplate(moduleName, moduleNameCn = '') {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCaseName = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ${pascalCaseName}Service } from '@/modules/${kebabCaseName}/${kebabCaseName}.service'
import { ${pascalCaseName}PageRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.resp.dto'
import { ${pascalCaseName}PageDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.dto'
import { ${pascalCaseName}PageOptionDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.option.dto'
import { ${pascalCaseName}RespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.resp.dto'
import { ${pascalCaseName}ListRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.list.resp.dto'
import { ${pascalCaseName}CreateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.create.dto'
import { ${pascalCaseName}UpdateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.update.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'
import { UpdateStatusDto } from '@/dto/update-status.dto'

@Controller('${kebabCaseName}')
export class ${pascalCaseName}Controller {
  constructor(private readonly ${camelCaseName}Service: ${pascalCaseName}Service) {}

  @Get('page')
  @ApiOperation({ summary: '分页查询${moduleNameCn}列表' })
  @ApiSuccessPageResponse(${pascalCaseName}PageRespDto)
  async page${pascalCaseName}(@Query() query: ${pascalCaseName}PageDto): Promise<PaginatedResult<${pascalCaseName}PageRespDto>> {
    return await this.${camelCaseName}Service.page${pascalCaseName}(query)
  }

  @Post('schema-generator-holder-page-${kebabCaseName}')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _page${pascalCaseName}(@Body() _body: ${pascalCaseName}PageDto) {
    return null
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询${moduleNameCn}列表(可选字段)' })
  @ApiSuccessPageResponse(${pascalCaseName}PageRespDto)
  async pageOption${pascalCaseName}(
    @Query() query: ${pascalCaseName}PageOptionDto,
  ): Promise<PaginatedResult<Partial<${pascalCaseName}PageRespDto>>> {
    return await this.${camelCaseName}Service.pageOption${pascalCaseName}(query)
  }

  @Post('schema-generator-holder-page-option-${kebabCaseName}')
  @HttpCode(200)
  @ApiOperation({ summary: '请勿调用，用于生成前端DTO', deprecated: true })
  async _pageOption${pascalCaseName}(@Body() _body: ${pascalCaseName}PageOptionDto) {
    return null
  }


  @Get('find/:id')
  @ApiOperation({ summary: '按id查询${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async find${pascalCaseName}ById(@Param('id', ParseIntPipe) id: number): Promise<${pascalCaseName}RespDto | null> {
    const ${camelCaseName} = await this.${camelCaseName}Service.find${pascalCaseName}ById(id)
    return ${camelCaseName}
  }
  
  @Get('batch/query')
  @ApiOperation({ summary: '按ids查询${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}ListRespDto)
  async find${pascalCaseName}ListByIds(@Query() query: BatchDto): Promise<${pascalCaseName}ListRespDto | null> {
    return await this.${camelCaseName}Service.find${pascalCaseName}ListByIds(query.ids)
  }

  @Post('create')
  @ApiOperation({ summary: '创建${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async create${pascalCaseName}(@Body() body: ${pascalCaseName}CreateDto): Promise<${pascalCaseName}RespDto | null> {
    return await this.${camelCaseName}Service.create${pascalCaseName}(body)
  }

  @Post('update/:id')
  @ApiOperation({ summary: '修改${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async update${pascalCaseName}(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ${pascalCaseName}UpdateDto,
  ): Promise<${pascalCaseName}RespDto | null> {
    return await this.${camelCaseName}Service.update${pascalCaseName}(id, body)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除${moduleNameCn}' })
  @ApiSuccessResponse()
  async remove${pascalCaseName}(@Param('id') id: number) {
    return await this.${camelCaseName}Service.remove${pascalCaseName}(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除${moduleNameCn}' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemove${pascalCaseName}(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.${camelCaseName}Service.batchRemove${pascalCaseName}(body.ids)
  }

  @Post('updateStatus/:id')
  @ApiOperation({ summary: '修改${moduleNameCn}状态' })
  @ApiSuccessResponse()
  async update${pascalCaseName}Status(@Param('id') id: number, @Body() body: UpdateStatusDto) {
    return await this.${camelCaseName}Service.update${pascalCaseName}Status(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改${moduleNameCn}状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdate${pascalCaseName}Status(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.${camelCaseName}Service.batchUpdate${pascalCaseName}Status(body)
  }

  @Post('template')
  @ApiOperation({ summary: '下载导入${moduleNameCn}模板' })
  @ApiSuccessResponse()
  async download${pascalCaseName}Template() {
    return await this.${camelCaseName}Service.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入${moduleNameCn}数据' })
  @ApiSuccessResponse()
  async import${pascalCaseName}() {
    return await this.${camelCaseName}Service.import${pascalCaseName}()
  }

  @Post('export')
  @ApiOperation({ summary: '导出${moduleNameCn}数据' })
  @ApiSuccessResponse()
  async export${pascalCaseName}() {
    return await this.${camelCaseName}Service.export${pascalCaseName}()
  }

}

`
}
export default generateControllerTemplate
