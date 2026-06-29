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
import { UserService } from '@/modules/user/user.service'
import { UserPageRespDto } from '@/modules/user/dto/user.page.resp.dto'
import { UserPageDto } from '@/modules/user/dto/user.page.dto'
import { UserPageOptionDto } from '@/modules/user/dto/user.page.option.dto'
import { UserRespDto } from '@/modules/user/dto/user.resp.dto'
import { UserListRespDto } from '@/modules/user/dto/user.list.resp.dto'
import { UserCreateDto } from '@/modules/user/dto/user.create.resp.dto'
import { UserUpdateDto } from '@/modules/user/dto/user.update.resp.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessPageResponse, ApiSuccessResponse } from '@/decorators/api-response.decorator'
import { BatchDto, BatchRespDto, BatchUpdateStatusDto } from '@/dto/batch.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiSuccessPageResponse(UserPageRespDto)
  async pageUser(@Query() query: UserPageDto): Promise<PaginatedResult<UserPageRespDto>> {
    return await this.userService.pageUser(query)
  }

  @Get('option')
  @ApiOperation({ summary: '分页查询用户列表(可选字段)' })
  @ApiSuccessPageResponse(UserPageRespDto)
  async pageOptionUser(
    @Query() query: UserPageOptionDto,
  ): Promise<PaginatedResult<Partial<UserPageRespDto>>> {
    return await this.userService.pageOptionUser(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '按id查询用户' })
  @ApiSuccessResponse(UserRespDto)
  async findUserById(@Param('id', ParseIntPipe) id: number): Promise<UserRespDto | null> {
    const user = await this.userService.findUserById(id)
    if (!user) {
      throw new NotFoundException('未找到资源')
    }
    return user
  }

  @Post('batch/query')
  @ApiOperation({ summary: '按ids查询用户' })
  @ApiSuccessResponse(UserRespDto)
  async findUserListByIds(@Body() body: BatchDto): Promise<UserListRespDto | null> {
    return await this.userService.findUserListByIds(body.ids)
  }

  @Post('')
  @ApiOperation({ summary: '创建用户' })
  @ApiSuccessResponse(UserRespDto)
  async createUser(@Body() body: UserCreateDto): Promise<UserRespDto | null> {
    return await this.userService.createUser(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '修改用户' })
  @ApiSuccessResponse(UserRespDto)
  async updateUser(
    @Param('id') id: number,
    @Body() body: UserUpdateDto,
  ): Promise<UserRespDto | null> {
    return await this.userService.updateUser(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse()
  async removeUser(@Param('id') id: number) {
    return await this.userService.removeUser(id)
  }

  @Post('batch/delete')
  @ApiOperation({ summary: '批量删除用户' })
  @ApiSuccessResponse(BatchRespDto)
  async batchRemoveUser(@Body() body: BatchDto): Promise<BatchRespDto | null> {
    return await this.userService.batchRemoveUser(body.ids)
  }

  @Post(':id/status')
  @ApiOperation({ summary: '修改用户状态' })
  @ApiSuccessResponse()
  async updateUserStatus(@Param('id') id: number, @Body() body: Pick<UserUpdateDto, 'status'>) {
    return await this.userService.updateUserStatus(id, body)
  }

  @Post('batch/status')
  @ApiOperation({ summary: '批量修改用户状态' })
  @ApiSuccessResponse(BatchRespDto)
  async batchUpdateUserStatus(@Body() body: BatchUpdateStatusDto): Promise<BatchRespDto | null> {
    return await this.userService.batchUpdateUserStatus(body)
  }

  @Get('template')
  @ApiOperation({ summary: '下载导入用户模板' })
  @ApiSuccessResponse()
  async downloadUserTemplate() {
    return await this.userService.downloadTemplate()
  }

  @Post('import')
  @ApiOperation({ summary: '导入用户数据' })
  @ApiSuccessResponse()
  async importUser() {
    return await this.userService.importUser()
  }

  @Post('export')
  @ApiOperation({ summary: '导出用户数据' })
  @ApiSuccessResponse()
  async exportUser() {
    return await this.userService.exportUser()
  }
}
