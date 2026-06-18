import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query } from '@nestjs/common'
import { SystemUserService } from '@/modules/user/system-user.service'
import { SystemUserPageDto, SystemUserCreateDto, SystemUserUpdateDto, SystemUserPageResp, SystemUserResp, SystemUserPageOptionDto, SystemUserListResp } from '@/modules/user/system-user.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator';
import { BatchDto, BatchResp, BatchUpdateStatusDto } from '@/dto/batch.dto';

@Controller('user') 
export class SystemUserController {
  constructor(private readonly systemUserService: SystemUserService) {}

  @Get('')
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiSuccessPageResponse(SystemUserPageResp)
  async pageUser(@Query() query: SystemUserPageDto): Promise<PaginatedResult<SystemUserPageResp>> {
    return await this.systemUserService.pageUser(query);
  }

  @Get('')
  @ApiOperation({ summary: '分页查询用户列表(可选字段)' })
  @ApiSuccessPageResponse(SystemUserPageResp)
  async pageOptionUser(@Query() query: SystemUserPageOptionDto): Promise<PaginatedResult<Partial<SystemUserPageResp>>> {
    return await this.systemUserService.pageOptionUser(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '按id查询用户' })
  @ApiSuccessResponse(SystemUserResp)
  async findUserById(@Param('id') id: number): Promise<SystemUserResp | null> {
    const user = await this.systemUserService.findUserById(id);
    if (!user) {
      throw new NotFoundException('未找到资源')
    }
    return user
  }

  @Post('batch/query')
  @ApiOperation({ summary: '按ids查询用户' })
  @ApiSuccessResponse(SystemUserResp)
  async findUserListByIds(@Body() body: BatchDto): Promise<SystemUserListResp | null> {
    return await this.systemUserService.findUserListByIds(body.ids);
  }

  @Post('')
  @ApiOperation({ summary: '创建用户' })
  @ApiSuccessResponse(SystemUserResp)
  async createUser(@Body() body: SystemUserCreateDto): Promise<SystemUserResp | null> {
    return await this.systemUserService.createUser(body);
  }

  @Put(':id')
  @ApiOperation({ summary: '修改用户' })
  @ApiSuccessResponse(SystemUserResp)
  async updateUser(
    @Param('id') id: number, 
    @Body() body: SystemUserUpdateDto
  ): Promise<SystemUserResp | null> {
    return await this.systemUserService.updateUser(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse()
  async removeUser(@Param('id') id: number) {
    return await this.systemUserService.removeUser(id);
  }


  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除用户' })
  @ApiSuccessResponse(BatchResp)
  async batchRemoveUser(@Body() body: BatchDto): Promise<BatchResp | null> {
    return await this.systemUserService.batchRemoveUser(body.ids);
  }

  @Post(':id/status')
  @ApiOperation({ summary: '修改用户状态' })
  @ApiSuccessResponse()
  async updateUserStatus(@Param('id') id: number, @Body() body: Pick<SystemUserUpdateDto, 'status'>) {
    return await this.systemUserService.updateUserStatus(id, body);
  }


  @Post('batch/status')
  @ApiOperation({ summary: '批量修改用户状态' })
  @ApiSuccessResponse(BatchResp)
  async batchUpdateUserStatus(@Body() body: BatchUpdateStatusDto): Promise<BatchResp | null> {
    return await this.systemUserService.batchUpdateUserStatus(body);
  }

  @Get('template')
  @ApiOperation({ summary: '下载导入模板' })
  @ApiSuccessResponse()
  async downloadUserTemplate() {
    return await this.systemUserService.downloadTemplate();
  }
  
  @Post('import')
  @ApiOperation({ summary: '导入数据' })
  @ApiSuccessResponse()
  async importUser() {
    return await this.systemUserService.importUser();
  }

  @Post('export')
  @ApiOperation({ summary: '导出数据' })
  @ApiSuccessResponse()
  async exportUser() {
    return await this.systemUserService.exportUser();
  }
}