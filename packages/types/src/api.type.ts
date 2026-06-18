/**
 * 本文件由官方 TS-AST 编译器脚本自动生成，请勿手动修改。
 */

import { components, operations } from './api';

export type { components, operations };

export namespace Backend {
  export type ResponseHeadDto = components['schemas']['ResponseHeadDto'];
  export type ApiResponseDto = components['schemas']['ApiResponseDto'];
  export type LoginResponseDto = components['schemas']['LoginResponseDto'];
  export type PasswordLoginDto = components['schemas']['PasswordLoginDto'];
  export type PhoneLoginDto = components['schemas']['PhoneLoginDto'];
  export type CurrentLoginResponseDto = components['schemas']['CurrentLoginResponseDto'];
  export type UpdateCommonDto = components['schemas']['UpdateCommonDto'];
  export type PaginatedResult = components['schemas']['PaginatedResult'];
  export type SystemUserPageResp = components['schemas']['SystemUserPageResp'];
  export type SystemUserResp = components['schemas']['SystemUserResp'];
  export type BatchDto = components['schemas']['BatchDto'];
  export type SystemUserCreateDto = components['schemas']['SystemUserCreateDto'];
  export type SystemUserUpdateDto = components['schemas']['SystemUserUpdateDto'];
  export type BatchResp = components['schemas']['BatchResp'];
  export type BatchUpdateStatusDto = components['schemas']['BatchUpdateStatusDto'];

  /* ====== 动态 AST 自动桥接的 Response 类型 ====== */
  export type PasswordLoginRes = 
    operations['AuthController_passwordLogin']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['AuthController_passwordLogin']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type PhoneLoginRes = 
    operations['AuthController_phoneLogin']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['AuthController_phoneLogin']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type CurrentLoginRes = 
    operations['AuthController_currentLogin']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['AuthController_currentLogin']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type LogoutRes = 
    operations['AuthController_logout']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['AuthController_logout']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type ReadDataRes = 
    operations['CommonController_readData']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['CommonController_readData']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type WriteDataRes = 
    operations['CommonController_writeData']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['CommonController_writeData']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type PageOptionUserRes = 
    operations['SystemUserController_pageOptionUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_pageOptionUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type CreateUserRes = 
    operations['SystemUserController_createUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_createUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type FindUserByIdRes = 
    operations['SystemUserController_findUserById']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_findUserById']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type UpdateUserRes = 
    operations['SystemUserController_updateUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_updateUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type RemoveUserRes = 
    operations['SystemUserController_removeUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_removeUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type FindUserListByIdsRes = 
    operations['SystemUserController_findUserListByIds']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_findUserListByIds']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type BatchRemoveUserRes = 
    operations['SystemUserController_batchRemoveUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_batchRemoveUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type UpdateUserStatusRes = 
    operations['SystemUserController_updateUserStatus']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_updateUserStatus']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type BatchUpdateUserStatusRes = 
    operations['SystemUserController_batchUpdateUserStatus']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_batchUpdateUserStatus']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type DownloadUserTemplateRes = 
    operations['SystemUserController_downloadUserTemplate']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_downloadUserTemplate']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type ImportUserRes = 
    operations['SystemUserController_importUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_importUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

  export type ExportUserRes = 
    operations['SystemUserController_exportUser']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :
    operations['SystemUserController_exportUser']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;

}
