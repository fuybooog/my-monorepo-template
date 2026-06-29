import { toCamelCase, toKebabCase, toPascalCase } from './utils'

function generateControllerTemplate(moduleName, moduleNameCn = '') {
  const kebabCaseName = toKebabCase(moduleName)
  const camelCase = toCamelCase(kebabCaseName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import {
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
import { ${pascalCaseName}Service } from '@/modules/${kebabCaseName}/${kebabCaseName}.service'
import { ${pascalCaseName}PageRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.resp.dto'
import { ${pascalCaseName}PageDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.dto'
import { ${pascalCaseName}PageOptionDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.page.option.dto'
import { ${pascalCaseName}RespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.resp.dto'
import { ${pascalCaseName}ListRespDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.list.resp.dto'
import { ${pascalCaseName}CreateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.create.resp.dto'
import { ${pascalCaseName}UpdateDto } from '@/modules/${kebabCaseName}/dto/${kebabCaseName}.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'

@Controller('${kebabCaseName}')
export class ${pascalCaseName}Controller {
  constructor(private readonly ${camelCase}Service: ${pascalCaseName}Service) {}

  @Get('')
  @ApiOperation({ summary: '分页查询${moduleNameCn}列表' })
  @ApiSuccessPageResponse(${pascalCaseName}PageRespDto)
  async page${pascalCaseName}(@Query() query: ${pascalCaseName}PageDto): Promise<PaginatedResult<${pascalCaseName}PageRespDto>> {
    return await this.${camelCase}Service.page${pascalCaseName}(query)
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询${moduleNameCn}列表(可选字段)' })
  @ApiSuccessPageResponse(${pascalCaseName}PageRespDto)
  async pageOption${pascalCaseName}(
    @Query() query: ${pascalCaseName}PageOptionDto,
  ): Promise<PaginatedResult<Partial<${pascalCaseName}PageRespDto>>> {
    return await this.${camelCase}Service.pageOption${pascalCaseName}(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '按id查询${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async find${pascalCaseName}ById(@Param('id', ParseIntPipe) id: number): Promise<${pascalCaseName}RespDto | null> {
    const ${camelCase} = await this.${camelCase}Service.find${pascalCaseName}ById(id)
    if (!${camelCase}) {
      throw new NotFoundException('未找到资源')
    }
    return ${camelCase}
  }

  @Post('batch/query')
  @ApiOperation({ summary: '按ids查询${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async find${pascalCaseName}ListByIds(@Body() body: BatchDto): Promise<${pascalCaseName}ListRespDto | null> {
    return await this.${camelCase}Service.find${pascalCaseName}ListByIds(body.ids)
  }

  @Post('')
  @ApiOperation({ summary: '创建${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async create${pascalCaseName}(@Body() body: ${pascalCaseName}CreateDto): Promise<${pascalCaseName}RespDto | null> {
    return await this.${camelCase}Service.create${pascalCaseName}(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '修改${moduleNameCn}' })
  @ApiSuccessResponse(${pascalCaseName}RespDto)
  async update${pascalCaseName}(
    @Param('id') id: number,
    @Body() body: ${pascalCaseName}UpdateDto,
  ): Promise<${pascalCaseName}RespDto | null> {
    return await this.${camelCase}Service.update${pascalCaseName}(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除${moduleNameCn}' })
  @ApiSuccessResponse()
  async remove${pascalCaseName}(@Param('id') id: number) {
    return await this.${camelCase}Service.remove${pascalCaseName}(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除${moduleNameCn}' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemove${pascalCaseName}(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.${camelCase}Service.batchRemove${pascalCaseName}(body.ids)
  }

  @Post(':id/status')
  @ApiOperation({ summary: '修改${moduleNameCn}状态' })
  @ApiSuccessResponse()
  async update${pascalCaseName}Status(
    @Param('id') id: number,
    @Body() body: Pick<${pascalCaseName}UpdateDto, 'status'>,
  ) {
    return await this.${camelCase}Service.update${pascalCaseName}Status(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改${moduleNameCn}状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdate${pascalCaseName}Status(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.${camelCase}Service.batchUpdate${pascalCaseName}Status(body)
  }

  @Get('template')
  @ApiOperation({ summary: '下载导入${moduleNameCn}模板' })
  @ApiSuccessResponse()
  async download${pascalCaseName}Template() {
    return await this.${camelCase}Service.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入${moduleNameCn}数据' })
  @ApiSuccessResponse()
  async import${pascalCaseName}() {
    return await this.${camelCase}Service.import${pascalCaseName}()
  }

  @Post('export')
  @ApiOperation({ summary: '导出${moduleNameCn}数据' })
  @ApiSuccessResponse()
  async export${pascalCaseName}() {
    return await this.${camelCase}Service.export${pascalCaseName}()
  }
}
`
}
export default generateControllerTemplate
