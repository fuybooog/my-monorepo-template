## 开发monorepo架构

### 建立本地代码连接

```

  pnpm --filter @repo/h5 add "@repo/api@workspace:*"

```

### 启动

```

  pnpm --filter @repo/backend dev

```

### 安装依赖

```

# 在根目录下

pnpm -F @repo/pc add form-render

# 在对应的工程下

cd app/admin-pc

pnpm add form-render

```

### 复制测试数据库

```
## 首次
mysql -u root -p -e "CREATE DATABASE mydb_test CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysqldump -u root -p mydb | mysql -u root -p mydb_test

## 再次（首次也能使用）
mysql -u root -p'8ik,(OL>' -e "DROP DATABASE IF EXISTS mydb_test; CREATE DATABASE mydb_test CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" && mysqldump -u root -p'8ik,(OL>' mydb | mysql -u root -p'8ik,(OL>' mydb_test
```

### 生成基础的模块代码

```
pnpm run generate:module user system_user y
```

### todo

```
P0 安全风险（建议优先处理）
1. 明文密码被打印到日志 — apps/backend-api/src/modules/auth/auth.service.ts:188

ts
console.log('校验密码：', isPasswordValid, decrypted, pw)
每次登录都把 RSA 解密后的明文密码和 bcrypt hash 打到 stdout。RSA 的加密防线因这条日志形同虚设。应直接删除；同时清理 user/decorators/user-fields.ts:15-29 等约 6 处遗留 console.log，改为 Logger.debug 或移除。

2. .env 密钥文件被 git 跟踪 — backend .gitignore 只忽略了精确的 .env，导致 apps/backend-api/.env.development、.env.test、apps/admin-pc/.env 均已入库（含 JWT_SECRET、DB_PASSWORD）。建议：忽略所有 *.env* 变体，只提交 .env.example 模板，各环境密钥走本机文件/密钥管理。

3. refresh token 无旋转/重放防护 — auth.service.ts:294-338。两个并发 refresh 都能通过 Redis 比对，后写者覆盖先写者，且旧 refresh token 被窃取后仍可无限续期。建议：refresh 时校验通过即作废旧 token 再签发新 token（rotation），被重放的旧 token 直接踢下线。

4. 基础防护缺失 — main.ts 无 helmet、无 @nestjs/throttler 限流、无 CSRF；登录仅有一次性验证码，无失败次数锁定/IP 限流（验证码可绕过 dev 模式、RSA 仅防重放不防撞库）。建议补 helmet + throttler + 登录失败锁定。

5. Swagger 生产环境仍开启 — main.ts:73-86 无条件挂 api-docs。建议 NODE_ENV === 'production' 时关闭（类型同步改走 CI）。

P1 后端可靠性 / 架构
6. 无统一访问日志与 traceId — 全仓无请求日志中间件（method/path/耗时/状态码），出问题只能靠业务留痕排查。项目已有 AsyncLocalStorage（operation-log 在用），可低成本扩展：请求级 requestId + 结构化日志（pino/winston），错误日志带上 requestId 串起整条链路。

7. 4 个 CRUD service 重复样板过多 — user.service.ts（770 行）/role（621）/resource（580）/value-set（560），field-meta、导入导出、事务包装高度雷同。可提炼泛型基类或组合式 helper 收敛，长期维护成本明显下降；另外 src/temp/entities-temp/ 有一批过期实体死代码可清理。

8. 中间表未建实体 + 潜在 N+1 — system_user_role/system_role_resource 无 entity；user.repository.searchRoleIdsByUserId 在登录/刷新路径按用户逐条查中间表。角色多、列表接口场景可考虑一次 IN 批量查询。

9. 软删除查询靠手写条件 — 部分 repository 需手动补 deletedAt IS NULL，容易漏。TypeORM 的 DeleteDateColumn + 全局软删过滤能统一行为。

10. 基础设施补强 — 环境变量无 schema 校验（缺 Joi/zod，configService.get 全靠默认值兜底）；无健康检查端点（@nestjs/terminus）；日志清理定时任务用 setTimeout/setInterval 手写（应换 @nestjs/schedule）；synchronize 需确认生产关闭（shared-mysql.module.ts 目前非生产开启）。

P2 前端体验 / 性能
11. 无路由懒加载 + 无错误边界 — apps/admin-pc/src/router/index.tsx 所有页面静态 import、整包一次加载（Vite 已就绪，收益明显）；全仓无 ErrorBoundary/errorElement，渲染异常会白屏。建议：路由级 React.lazy + Suspense（配合 404/403 已有页面），根级 ErrorBoundary。

12. Vite 无分包/gzip/构建分析 — vite.config.ts 仅 react + tailwind 插件。建议加 manualChunks（vendor/antd/业务分包）+ vite-plugin-compression，并接打包体积分析做基线。

13. 依赖冗余 — lodash 与 lodash-es 同时出现在 admin-pc deps；建议统一为一个（或换 tree-shakable 子路径引入）。

14. 细节打磨 — 401 用 window.location.replace 硬跳转会整页刷新丢状态（可换 router.navigate + 提示）；store 仅 authStore/themeStore，主题未用持久化中间件（手写 localStorage）；rootLoader 是空壳。

P3 工程效率 / 质量基线
15. 无 CI/CD、无容器化 — 没有 .github/workflows、Dockerfile、部署脚本。建议最低配 CI：lint → 单测 → e2e → build（后端依赖 MySQL/Redis，可用 docker-compose service）；openapi 类型生成应在 CI 校验漂移。

16. eslint 近乎全关 + turbo 缺任务 — eslint.config.js 关掉了 no-console/no-unused-vars/no-explicit-any/prefer-const 并 ignore 了 types/scripts；turbo.json 只有 build/dev/format，无 lint/test 聚合。建议逐步恢复规则并存量整改，给质量设防。

17. 测试覆盖有明显缺口 — 后端 12 个 service 中仅 auth.service 有单测（业务核心逻辑如 updateUser 唯一性、角色分配、导入导出都无保护）；前端 13 个测试偏工具层，无页面/hook 交互测试。建议先给 user/role 的 service 核心路径补单测，前端补 useUserList 等关键 hook 测试。

18. 版本一致性 — lock 中 @types/node、typescript 各包不一致，typeorm 声明 ^1.0.0 而 lock 仍带 0.2.x 传递依赖（typeorm-model-generator 引入）。建议统一 devDeps 版本、用 pnpm.onlyBuiltDependencies 收敛，清理不再使用的代码生成工具链。

19. 接入前端日志上报
```
