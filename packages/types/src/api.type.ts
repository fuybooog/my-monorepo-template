/**
 * 本文件由官方 TS-AST 编译器脚本自动生成，请勿手动修改。
 */

import { components, operations } from './api'

export type { components, operations }

export namespace Backend {
  export type ResponseHeadDto = components['schemas']['ResponseHeadDto']
  export type ApiResponseDto = components['schemas']['ApiResponseDto']
  export type LoginResponseDto = components['schemas']['LoginResponseDto']
  export type PasswordLoginDto = components['schemas']['PasswordLoginDto']
  export type PhoneLoginDto = components['schemas']['PhoneLoginDto']
  export type CurrentLoginResponseDto = components['schemas']['CurrentLoginResponseDto']
  export type UpdateCommonDto = components['schemas']['UpdateCommonDto']
  export type PaginatedResult = components['schemas']['PaginatedResult']
  export type UserPageRespDto = components['schemas']['UserPageRespDto']
  export type UserPageDto = components['schemas']['UserPageDto']
  export type UserPageOptionDto = components['schemas']['UserPageOptionDto']
  export type UserRespDto = components['schemas']['UserRespDto']
  export type UserListRespDto = components['schemas']['UserListRespDto']
  export type UserCreateDto = components['schemas']['UserCreateDto']
  export type UserUpdateDto = components['schemas']['UserUpdateDto']
  export type BatchRespDto = components['schemas']['BatchRespDto']
  export type BatchDto = components['schemas']['BatchDto']
  export type UpdateStatusDto = components['schemas']['UpdateStatusDto']
  export type BatchUpdateStatusDto = components['schemas']['BatchUpdateStatusDto']

  /* ====== 动态 AST 自动桥接的 Response 类型 ====== */
  export type PasswordLoginRes = operations['AuthController_passwordLogin']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['AuthController_passwordLogin']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type PhoneLoginRes = operations['AuthController_phoneLogin']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['AuthController_phoneLogin']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type CurrentLoginRes = operations['AuthController_currentLogin']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['AuthController_currentLogin']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type LogoutRes = operations['AuthController_logout']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['AuthController_logout']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type ReadDataRes = operations['CommonController_readData']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['CommonController_readData']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type WriteDataRes = operations['CommonController_writeData']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['CommonController_writeData']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type PageUserRes = operations['UserController_pageUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_pageUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type _pageUserRes = operations['UserController__pageUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController__pageUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type PageOptionUserRes = operations['UserController_pageOptionUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_pageOptionUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type _pageOptionUserRes =
    operations['UserController__pageOptionUser']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController__pageOptionUser']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindUserByIdRes = operations['UserController_findUserById']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_findUserById']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type FindUserListByIdsRes =
    operations['UserController_findUserListByIds']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController_findUserListByIds']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type CreateUserRes = operations['UserController_createUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_createUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type UpdateUserRes = operations['UserController_updateUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_updateUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type RemoveUserRes = operations['UserController_removeUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_removeUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type BatchRemoveUserRes =
    operations['UserController_batchRemoveUser']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController_batchRemoveUser']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateUserStatusRes =
    operations['UserController_updateUserStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController_updateUserStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchUpdateUserStatusRes =
    operations['UserController_batchUpdateUserStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController_batchUpdateUserStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type DownloadUserTemplateRes =
    operations['UserController_downloadUserTemplate']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['UserController_downloadUserTemplate']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ImportUserRes = operations['UserController_importUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_importUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type ExportUserRes = operations['UserController_exportUser']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_exportUser']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type CheckUniqueRes = operations['UserController_checkUnique']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['UserController_checkUnique']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown
}
