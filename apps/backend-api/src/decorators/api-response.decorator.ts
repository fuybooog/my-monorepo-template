// eslint-disable-next-line @typescript-eslint/no-explicit-any
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