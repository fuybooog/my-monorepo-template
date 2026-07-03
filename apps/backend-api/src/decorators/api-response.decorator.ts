import { applyDecorators, Type } from '@nestjs/common'
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { ApiResponseDto } from '../dto/api-response.dto'
import { PaginatedResult } from '@/dto/pagination-response.dto'

/**
 * 响应装饰器
 * @param model 内部数据实体的 DTO 类（可选。如果不传，则代表 data 返回 null）
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(model?: TModel) => {
  // 如果没传 model 参数，说明是 logout 或 delete 这种只需要报平安的接口
  if (!model) {
    return applyDecorators(
      ApiExtraModels(ApiResponseDto),
      ApiOkResponse({
        description: '成功响应',
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseDto) },
            {
              properties: {
                data: { type: 'null', default: null, nullable: true },
              },
            },
          ],
        },
      }),
    )
  }

  // 如果传了 model 参数
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({
      description: '成功响应',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
            },
          },
        ],
      },
    }),
  )
}

export const ApiSuccessPageResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, PaginatedResult, model),
    ApiOkResponse({
      description: '分页成功响应',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PaginatedResult) },
                  {
                    properties: {
                      total: { type: 'number', description: '总条数', example: 100 },
                      page: { type: 'number', description: '当前页码', example: 1 },
                      pageSize: { type: 'number', description: '每页条数', example: 10 },
                      list: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  )
}
/**
 * 成功返回布尔值的响应装饰器
 * 适用于查重、确认等只返回 true/false 的场景
 */
export const ApiSuccessBooleanResponse = () => {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto),
    ApiOkResponse({
      description: '成功响应（返回布尔值）',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                type: 'boolean',
                description: '校验结果：true 代表通过/唯一，false 代表失败/重复',
                example: true,
              },
            },
          },
        ],
      },
    }),
  )
}
