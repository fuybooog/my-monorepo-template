import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CommonService } from '@/modules/common/common.service'
import { GetCommonDto, UpdateCommonDto } from '@/dto/common.dto'

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('get')
  async readData(@Query() query: GetCommonDto) {
    return await this.commonService.readData(query.code)
  }
  @Post('update')
  async writeData(@Body() body: UpdateCommonDto) {
    return await this.commonService.writeData(body.json)
  }
}
