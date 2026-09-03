import { Global, Module } from '@nestjs/common'
import { ExcelService } from './excel.service'

/**
 * 全局 Excel 引擎模块。
 * 业务模块无需 import 本模块，直接在构造器注入 ExcelService 即可使用
 * 模板生成 / 导入解析校验 / 导出文件生成能力。
 */
@Global()
@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
