export const PERMISSIONS = {
  // 用户管理
  SYS_USER_DIR: 'sys:user:dir',
  SYS_USER_LIST_PAGE: 'sys:user-list:page',
  SYS_USER_LIST_CREATE: 'sys:user-list:create',
  SYS_USER_LIST_EDIT: 'sys:user-list:edit',
  SYS_USER_LIST_DELETE: 'sys:user-list:delete',
  SYS_USER_LIST_EXPORT: 'sys:user-list:export',
  SYS_USER_LIST_IMPORT: 'sys:user-list:import',
  SYS_USER_LIST_RESET_PWD: 'sys:user-list:reset-pwd',
  SYS_USER_LIST_ASSIGN_ROLE: 'sys:user-list:assign-role',
  SYS_USER_LIST_VIEW: 'sys:user-list:view',

  // 角色管理
  SYS_ROLE_DIR: 'sys:role:dir',
  SYS_ROLE_LIST_PAGE: 'sys:role-list:page',
  SYS_ROLE_LIST_CREATE: 'sys:role-list:create',
  SYS_ROLE_LIST_EDIT: 'sys:role-list:edit',
  SYS_ROLE_LIST_DELETE: 'sys:role-list:delete',
  SYS_ROLE_LIST_EXPORT: 'sys:role-list:export',
  SYS_ROLE_LIST_ASSIGN_PERMISSION: 'sys:role-list:assign-permission',
  SYS_ROLE_LIST_IMPORT: 'sys:role-list:import',
  SYS_ROLE_LIST_VIEW: 'sys:role-list:view',

  // 资源管理
  SYS_RESOURCE_DIR: 'sys:resource:dir',
  SYS_RESOURCE_LIST_PAGE: 'sys:resource-list:page',
  SYS_RESOURCE_LIST_CREATE: 'sys:resource-list:create',
  SYS_RESOURCE_LIST_EDIT: 'sys:resource-list:edit',
  SYS_RESOURCE_LIST_DELETE: 'sys:resource-list:delete',
  SYS_RESOURCE_LIST_EXPORT: 'sys:resource-list:export',
  SYS_RESOURCE_LIST_IMPORT: 'sys:resource-list:import',
  SYS_RESOURCE_LIST_VIEW: 'sys:resource-list:view',

  // 值集管理
  SYS_VALUE_SET_DIR: 'sys:value-set:dir',
  SYS_VALUE_SET_LIST_PAGE: 'sys:value-set-list:page',
  SYS_VALUE_SET_LIST_CREATE: 'sys:value-set-list:create',
  SYS_VALUE_SET_LIST_EDIT: 'sys:value-set-list:edit',
  SYS_VALUE_SET_LIST_DELETE: 'sys:value-set-list:delete',
  SYS_VALUE_SET_LIST_EXPORT: 'sys:value-set-list:export',
  SYS_VALUE_SET_LIST_IMPORT: 'sys:value-set-list:import',
  SYS_VALUE_SET_LIST_VIEW: 'sys:value-set-list:view',
} as const
