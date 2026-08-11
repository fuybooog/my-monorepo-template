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
  export type ValueSetPageRespDto = components['schemas']['ValueSetPageRespDto']
  export type ValueSetPageDto = components['schemas']['ValueSetPageDto']
  export type ValueSetPageOptionDto = components['schemas']['ValueSetPageOptionDto']
  export type ValueSetRespDto = components['schemas']['ValueSetRespDto']
  export type ValueSetListRespDto = components['schemas']['ValueSetListRespDto']
  export type ValueSetListDto = components['schemas']['ValueSetListDto']
  export type ValueSetCreateDto = components['schemas']['ValueSetCreateDto']
  export type ValueSetUpdateDto = components['schemas']['ValueSetUpdateDto']
  export type ResourcePageRespDto = components['schemas']['ResourcePageRespDto']
  export type ResourcePageDto = components['schemas']['ResourcePageDto']
  export type ResourcePageOptionDto = components['schemas']['ResourcePageOptionDto']
  export type ResourceRespDto = components['schemas']['ResourceRespDto']
  export type ResourceListRespDto = components['schemas']['ResourceListRespDto']
  export type ResourceCreateDto = components['schemas']['ResourceCreateDto']
  export type ResourceUpdateDto = components['schemas']['ResourceUpdateDto']
  export type RolePageRespDto = components['schemas']['RolePageRespDto']
  export type RolePageDto = components['schemas']['RolePageDto']
  export type RolePageOptionDto = components['schemas']['RolePageOptionDto']
  export type RoleRespDto = components['schemas']['RoleRespDto']
  export type RoleListRespDto = components['schemas']['RoleListRespDto']
  export type RoleCreateDto = components['schemas']['RoleCreateDto']
  export type RoleUpdateDto = components['schemas']['RoleUpdateDto']

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

  export type PageValueSetRes = operations['ValueSetController_pageValueSet']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['ValueSetController_pageValueSet']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type _pageValueSetRes =
    operations['ValueSetController__pageValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController__pageValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type PageOptionValueSetRes =
    operations['ValueSetController_pageOptionValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_pageOptionValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type _pageOptionValueSetRes =
    operations['ValueSetController__pageOptionValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController__pageOptionValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindValueSetBySetCodesRes =
    operations['ValueSetController_findValueSetBySetCodes']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_findValueSetBySetCodes']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type _findValueSetBySetCodesRes =
    operations['ValueSetController__findValueSetBySetCodes']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController__findValueSetBySetCodes']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindValueSetByIdRes =
    operations['ValueSetController_findValueSetById']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_findValueSetById']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindValueSetListByIdsRes =
    operations['ValueSetController_findValueSetListByIds']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_findValueSetListByIds']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type CreateValueSetRes =
    operations['ValueSetController_createValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_createValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateValueSetRes =
    operations['ValueSetController_updateValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_updateValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type RemoveValueSetRes =
    operations['ValueSetController_removeValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_removeValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchRemoveValueSetRes =
    operations['ValueSetController_batchRemoveValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_batchRemoveValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateValueSetStatusRes =
    operations['ValueSetController_updateValueSetStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_updateValueSetStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchUpdateValueSetStatusRes =
    operations['ValueSetController_batchUpdateValueSetStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_batchUpdateValueSetStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type DownloadValueSetTemplateRes =
    operations['ValueSetController_downloadValueSetTemplate']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_downloadValueSetTemplate']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ImportValueSetRes =
    operations['ValueSetController_importValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_importValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ExportValueSetRes =
    operations['ValueSetController_exportValueSet']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ValueSetController_exportValueSet']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type PageResourceRes = operations['ResourceController_pageResource']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['ResourceController_pageResource']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type ListAllResourceRes =
    operations['ResourceController_listAllResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_listAllResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ListResourceByUserRes =
    operations['ResourceController_listResourceByUser']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_listResourceByUser']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type _pageResourceRes =
    operations['ResourceController__pageResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController__pageResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type PageOptionResourceRes =
    operations['ResourceController_pageOptionResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_pageOptionResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type _pageOptionResourceRes =
    operations['ResourceController__pageOptionResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController__pageOptionResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindResourceByIdRes =
    operations['ResourceController_findResourceById']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_findResourceById']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindResourceListByIdsRes =
    operations['ResourceController_findResourceListByIds']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_findResourceListByIds']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type CreateResourceRes =
    operations['ResourceController_createResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_createResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateResourceRes =
    operations['ResourceController_updateResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_updateResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type RemoveResourceRes =
    operations['ResourceController_removeResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_removeResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchRemoveResourceRes =
    operations['ResourceController_batchRemoveResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_batchRemoveResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateResourceStatusRes =
    operations['ResourceController_updateResourceStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_updateResourceStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchUpdateResourceStatusRes =
    operations['ResourceController_batchUpdateResourceStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_batchUpdateResourceStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type DownloadResourceTemplateRes =
    operations['ResourceController_downloadResourceTemplate']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_downloadResourceTemplate']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ImportResourceRes =
    operations['ResourceController_importResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_importResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ExportResourceRes =
    operations['ResourceController_exportResource']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['ResourceController_exportResource']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type PageRoleRes = operations['RoleController_pageRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_pageRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type _pageRoleRes = operations['RoleController__pageRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController__pageRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type PageOptionRoleRes = operations['RoleController_pageOptionRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_pageOptionRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type _pageOptionRoleRes =
    operations['RoleController__pageOptionRole']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController__pageOptionRole']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type FindRoleByIdRes = operations['RoleController_findRoleById']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_findRoleById']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type FindRoleListByIdsRes =
    operations['RoleController_findRoleListByIds']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController_findRoleListByIds']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type CreateRoleRes = operations['RoleController_createRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_createRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type UpdateRoleRes = operations['RoleController_updateRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_updateRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type RemoveRoleRes = operations['RoleController_removeRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_removeRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type BatchRemoveRoleRes =
    operations['RoleController_batchRemoveRole']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController_batchRemoveRole']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type UpdateRoleStatusRes =
    operations['RoleController_updateRoleStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController_updateRoleStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type BatchUpdateRoleStatusRes =
    operations['RoleController_batchUpdateRoleStatus']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController_batchUpdateRoleStatus']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type DownloadRoleTemplateRes =
    operations['RoleController_downloadRoleTemplate']['responses'] extends {
      '200': { content: { 'application/json': infer R } }
    }
      ? R
      : operations['RoleController_downloadRoleTemplate']['responses'] extends {
            '201': { content: { 'application/json': infer R } }
          }
        ? R
        : unknown

  export type ImportRoleRes = operations['RoleController_importRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_importRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown

  export type ExportRoleRes = operations['RoleController_exportRole']['responses'] extends {
    '200': { content: { 'application/json': infer R } }
  }
    ? R
    : operations['RoleController_exportRole']['responses'] extends {
          '201': { content: { 'application/json': infer R } }
        }
      ? R
      : unknown
}
