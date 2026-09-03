-- =====================================================================
-- 操作日志模块 DDL
-- 库：mydb（与 db-sync.ts 数据源一致）
--
-- 使用步骤：
--   1. 在本库执行下方建表语句；
--   2. 在 apps/backend-api 目录执行 pnpm db:sync（MODULE_MAPPING 已登记
--      system_operation_log -> operation-log），生成实体；
--   3. 若需要把「日志管理」加入菜单：请在「资源管理」页面新增资源
--      （目录 sys:operation-log:dir + 页面 sys:operation-log-list:page，
--      menu_path=/operation-log），或在下方 INSERT 模板中把
--      :parent_unique_prop 替换为当前环境中「系统管理」目录的 unique_prop 后执行。
-- =====================================================================

CREATE TABLE IF NOT EXISTS `system_operation_log` (
  `id`             INT NOT NULL AUTO_INCREMENT COMMENT '操作日志id',
  `log_level`      TINYINT NOT NULL DEFAULT 1 COMMENT '日志级别：1-INFO，2-WARN，3-ERROR',
  `module`         VARCHAR(45) NOT NULL COMMENT '业务模块编码：user/role/resource/value-set/operation-log',
  `module_text`    VARCHAR(45) NOT NULL COMMENT '业务模块名称（冗余，防字典变更影响历史）',
  `business_id`    INT NULL COMMENT '业务对象id（如用户id；登录等无对象为NULL）',
  `business_text`  VARCHAR(255) NOT NULL COMMENT '业务对象描述（如：用户 #5 王五）',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型：CREATE/UPDATE/DELETE/ENABLE/DISABLE/ASSIGN/RESET_PWD/IMPORT/EXPORT/OTHER',
  `operation_text` VARCHAR(45) NOT NULL COMMENT '操作类型中文（冗余）：新增/修改/删除...',
  `operator_id`    INT NOT NULL COMMENT '操作人id（系统任务为0）',
  `operator_name`  VARCHAR(45) NOT NULL COMMENT '操作人用户名',
  `operator_ip`    VARCHAR(45) NULL COMMENT '操作人IP',
  `summary`        VARCHAR(500) NOT NULL COMMENT '人话摘要，如：张三 修改了 用户 #5 王五 的昵称',
  `detail_json`    JSON NULL COMMENT '字段级变更明细：[{field,fieldText,oldValue,newValue,oldText,newText}]',
  `request_uri`    VARCHAR(255) NULL COMMENT '请求路径',
  `request_method` VARCHAR(10) NULL COMMENT '请求方法',
  `created_at`     DATETIME NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_module_created` (`module`, `created_at`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_operator_created` (`operator_id`, `created_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '操作日志表';

-- ---------------------------------------------------------------------
-- 可选：菜单/权限资源 INSERT 模板（替换 :parent_unique_prop 后执行；
-- resource.type 枚举：0-目录 1-页面 2-按钮 3-列；
-- 页面 menu_path 需与前端路由 apps/admin-pc/src/router/index.tsx 中的
-- path='operation-log/list' 一致；按钮级权限码已通过
-- packages/shared PERMISSIONS 注册，由代码鉴权）
-- ---------------------------------------------------------------------
-- INSERT INTO `system_resource`
--   (`label`, `unique_prop`, `parent_unique_prop`, `status`, `type`, `sort_number`, `not_in_menu`, `menu_path`)
-- VALUES
--   -- 目录：挂在「系统管理」目录下（:parent_unique_prop 替换为当前环境中系统管理目录的 unique_prop）
--   ('日志管理', 'sys:operation-log:dir', ':parent_unique_prop', 1, 0, 30, 0, '/operation-log'),
--   -- 页面
--   ('日志查看', 'sys:operation-log-list:page', 'sys:operation-log:dir', 1, 1, 1, 0, '/operation-log/list'),
--   -- 可选按钮级资源（权限码在 packages/shared/src/permissions.ts 中定义）
--   ('查看', 'sys:operation-log-list:view', 'sys:operation-log-list:page', 1, 2, 1, 1, NULL),
--   ('导出', 'sys:operation-log-list:export', 'sys:operation-log-list:page', 1, 2, 2, 1, NULL),
--   ('清理', 'sys:operation-log-list:clean', 'sys:operation-log-list:page', 1, 2, 3, 1, NULL);
