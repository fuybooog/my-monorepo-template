import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { FileService } from '@/modules/file/file.service'
import { GetFileDto, UpdateFileDto } from '@/dto/common.dto'

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('get')
  async readData(@Query() query: GetFileDto) {
    return await this.fileService.readData(query.code)
  }
  @Post('update')
  async writeData(@Body() body: UpdateFileDto) {
    return await this.fileService.writeData(body.json)
  }
}
