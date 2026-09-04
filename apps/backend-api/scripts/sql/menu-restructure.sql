-- =====================================================================
-- 菜单结构调整：新增顶级 Dashboard + 「系统管理」分组收纳现有业务菜单
-- 库：mydb   表：system_resource
--
-- 背景：
--   admin-pc 侧边菜单完全由 system_resource 数据驱动（type 0/1 且
--   not_in_menu=0），前端路由已平铺声明（/dashboard、/user/list、
--   /role/list、/resource/list、/value-set/list、/operation-log/list），
--   本脚本只需调整数据，无需改前端代码。
--
-- 执行记录：
--   2026-09-03 已在 dev 库执行过一遍（结果见下方「目标结构」），
--   脚本保持幂等，可在新环境重复执行复现。
--   注意：本环境实际编码为「日志页面 sys:log:page / 日志目录 sys:log:dir」，
--   与最早期注释里的 sys:operation-log-* 不一致，已按实际编码修正。
--
-- 目标结构：
--   Dashboard（type=1，menu_path=/dashboard）        ← 顶级，sort=1
--   系统管理（type=0 目录，sys:system:dir）          ← 顶级，sort=10
--    ├ 用户列表    sys:user-list:page       → /user/list
--    ├ 角色列表    sys:role-list:page       → /role/list
--    ├ 资源列表    sys:resource-list:page   → /resource/list
--    ├ 值集列表    sys:value-set-list:page  → /value-set/list
--    └ 日志列表    sys:log:page             → /operation-log/list
--
-- 资源类型：0-目录 1-页面 2-按钮 3-列；not_in_menu：0-显示 1-不显示
--
-- 使用步骤：
--   1) 先只执行【Step 0 自查】，核对当前数据后决定是否继续；
--   2) 若库中已存在「系统管理」目录且 unique_prop 不是 sys:system:dir，
--      请把下方 @sys_dir_uid 改成实际值，并跳过 Step 1 的 INSERT；
--   3) 依次执行 Step 1~3；
--   4) 执行 Step 4：4.1 自查旧目录，确认空目录后执行 4.2 禁用。
--   5) 提醒：非 admin 角色需在「角色管理 → 授权」中为新节点
--      （sys:dashboard:page、sys:system:dir）补充授权。
--   回滚：执行 scripts/sql/menu-restructure-undo.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Step 0：自查当前 type 0/1 且显示在菜单中的资源
-- ---------------------------------------------------------------------
SELECT id, label, unique_prop, parent_unique_prop, type,
       sort_number, not_in_menu, menu_path, status
FROM system_resource
WHERE deleted_at IS NULL AND type IN (0, 1) AND not_in_menu = 0
ORDER BY COALESCE(parent_unique_prop, ''), sort_number, id;

-- ---------------------------------------------------------------------
-- Step 1：确保顶级「系统管理」目录存在
--   约定编码 sys:system:dir；若已存在同名目录（unique_prop 不同），
--   请将 @sys_dir_uid 替换为该目录的 unique_prop，并删除下方 INSERT 语句。
-- ---------------------------------------------------------------------
INSERT INTO system_resource
  (label, unique_prop, parent_unique_prop, status, type, sort_number, not_in_menu, menu_path)
SELECT '系统管理', 'sys:system:dir', NULL, 1, 0, 10, 0, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_resource
  WHERE unique_prop = 'sys:system:dir' AND deleted_at IS NULL
);

SET @sys_dir_uid := 'sys:system:dir';

-- ---------------------------------------------------------------------
-- Step 2：新增顶级 Dashboard 页面
--   label 如需中文可改为 '工作台'；sort_number=1 保证排最前
-- ---------------------------------------------------------------------
INSERT INTO system_resource
  (label, unique_prop, parent_unique_prop, status, type, sort_number, not_in_menu, menu_path)
SELECT 'Dashboard', 'sys:dashboard:page', NULL, 1, 1, 1, 0, '/dashboard'
WHERE NOT EXISTS (
  SELECT 1 FROM system_resource
  WHERE unique_prop = 'sys:dashboard:page' AND deleted_at IS NULL
);

-- ---------------------------------------------------------------------
-- Step 3：把 5 个业务页面收编到「系统管理」目录下
--   匹配规则：优先按约定 unique_prop，其次按 menu_path 兜底；
--   同时重排 sort_number（1~5），行数=0 时说明库里编码与约定不一致，
--   请先核对 Step 0 输出并调整 WHERE 条件。
-- ---------------------------------------------------------------------
UPDATE system_resource
SET parent_unique_prop = @sys_dir_uid,
    sort_number = CASE
      WHEN unique_prop = 'sys:user-list:page'       OR menu_path = '/user/list'         THEN 1
      WHEN unique_prop = 'sys:role-list:page'       OR menu_path = '/role/list'         THEN 2
      WHEN unique_prop = 'sys:resource-list:page'   OR menu_path = '/resource/list'     THEN 3
      WHEN unique_prop = 'sys:value-set-list:page'  OR menu_path = '/value-set/list'    THEN 4
      WHEN unique_prop = 'sys:log:page'             OR menu_path = '/operation-log/list' THEN 5
      ELSE sort_number
    END
WHERE deleted_at IS NULL
  AND type = 1
  AND (
    unique_prop IN (
      'sys:user-list:page',
      'sys:role-list:page',
      'sys:resource-list:page',
      'sys:value-set-list:page',
      'sys:log:page'
    )
    OR menu_path IN (
      '/user/list',
      '/role/list',
      '/resource/list',
      '/value-set/list',
      '/operation-log/list'
    )
  );

-- ---------------------------------------------------------------------
-- Step 4：清理迁移后遗留的空目录
--   页面迁移后，原各模块目录（sys:user:dir 等）会变成空目录，
--   在侧边栏显示为空的展开分组，需禁用或删除。
-- ---------------------------------------------------------------------
-- 4.1 自查：无任何子节点的目录
SELECT r.id, r.label, r.unique_prop, r.type, r.sort_number, r.status
FROM system_resource r
WHERE r.deleted_at IS NULL
  AND r.type = 0
  AND r.not_in_menu = 0
  AND NOT EXISTS (
    SELECT 1 FROM system_resource c
    WHERE c.parent_unique_prop = r.unique_prop
      AND c.deleted_at IS NULL
      AND c.not_in_menu = 0
  )
ORDER BY r.sort_number, r.id;

-- 4.2 禁用上一步查出的空目录（本环境实际编码如下，新环境请核对 4.1 结果）
UPDATE system_resource
SET status = 0, not_in_menu = 1
WHERE deleted_at IS NULL
  AND unique_prop IN (
    'sys:user:dir',
    'sys:role:dir',
    'sys:resource:dir',
    'sys:value-set:dir',
    'sys:log:dir'
  );
