-- =====================================================================
-- 菜单结构调整：回滚脚本（撤销 menu-restructure.sql 的全部改动）
-- 库：mydb   表：system_resource
--
-- 回滚目标（恢复重构前结构）：
--   Dashboard      （sys:dashboard:page）            ← 删除
--   系统管理        （sys:system:dir）                ← 删除
--   用户列表        sys:user-list:page       → 挂回 sys:user:dir
--   角色列表        sys:role-list:page       → 挂回 sys:role:dir
--   资源列表        sys:resource-list:page   → 挂回 sys:resource:dir
--   值集列表        sys:value-set-list:page  → 挂回 sys:value-set:dir
--   日志列表        sys:log:page             → 挂回 sys:log:dir
--   原 5 个模块目录（sys:user:dir 等）       ← 恢复 status=1, not_in_menu=0
--
-- 使用步骤：
--   1) 先只执行【Step 0 自查】核对当前数据；
--   2) 依次执行 Step 1~3；
--   3) 执行 Step 4 自查最终结果。
--
-- 说明：
--   - 新节点采用软删（deleted_at = NOW()），与系统删除行为一致；
--   - 若重构后曾给非 admin 角色授权过 sys:dashboard:page / sys:system:dir，
--     软删后关联授权自动失效，无需额外处理；
--   - 若在删除系统管理目录前已有其它节点被挂到其下（非本脚本所为），
--     Step 3 的 DELETE 会因仍存在子节点而命中 0 行，请先人工核对。
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
-- Step 1：5 个业务页面改回各自的独立模块目录（恢复原 sort_number=1）
-- ---------------------------------------------------------------------
UPDATE system_resource
SET parent_unique_prop = 'sys:user:dir', sort_number = 1
WHERE deleted_at IS NULL AND unique_prop = 'sys:user-list:page';

UPDATE system_resource
SET parent_unique_prop = 'sys:role:dir', sort_number = 1
WHERE deleted_at IS NULL AND unique_prop = 'sys:role-list:page';

UPDATE system_resource
SET parent_unique_prop = 'sys:resource:dir', sort_number = 1
WHERE deleted_at IS NULL AND unique_prop = 'sys:resource-list:page';

UPDATE system_resource
SET parent_unique_prop = 'sys:value-set:dir', sort_number = 1
WHERE deleted_at IS NULL AND unique_prop = 'sys:value-set-list:page';

UPDATE system_resource
SET parent_unique_prop = 'sys:log:dir', sort_number = 1
WHERE deleted_at IS NULL AND unique_prop = 'sys:log:page';

-- ---------------------------------------------------------------------
-- Step 2：恢复 5 个旧模块目录的可见性
-- ---------------------------------------------------------------------
UPDATE system_resource
SET status = 1, not_in_menu = 0
WHERE deleted_at IS NULL
  AND unique_prop IN (
    'sys:user:dir',
    'sys:role:dir',
    'sys:resource:dir',
    'sys:value-set:dir',
    'sys:log:dir'
  );

-- ---------------------------------------------------------------------
-- Step 3：软删本次新增的 Dashboard 与「系统管理」目录
--   （先于 Step 2 执行亦可，此处顺序保证系统管理目录先变空再删除）
-- ---------------------------------------------------------------------
UPDATE system_resource
SET deleted_at = NOW()
WHERE deleted_at IS NULL AND unique_prop = 'sys:dashboard:page';

UPDATE system_resource
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND unique_prop = 'sys:system:dir'
  AND NOT EXISTS (
    SELECT 1 FROM system_resource c
    WHERE c.parent_unique_prop = 'sys:system:dir'
      AND c.deleted_at IS NULL
  );

-- ---------------------------------------------------------------------
-- Step 4（自查）：确认已恢复旧结构（应看到 5 个顶级模块目录）
-- ---------------------------------------------------------------------
SELECT id, label, unique_prop, parent_unique_prop, type,
       sort_number, not_in_menu, menu_path, status
FROM system_resource
WHERE deleted_at IS NULL AND type IN (0, 1) AND not_in_menu = 0
ORDER BY COALESCE(parent_unique_prop, ''), sort_number, id;
