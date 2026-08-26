### 开发

1. redis

```
  pnpm run start:redis
```

2. 启动后端

```
  pnpm run dev:backend
```

3. 启动前端

```
  pnpm run dev:pc
```

4. 同步数据库到实体类

```
  pnpm run db:sync
```

5. 有关联关系的表，手动新建实体类进行继承

```

```

6. 增加数据库字段的方式

- 增加一个字段时，可以直接在entity中先增加，代码运行后直接会写入数据库，再在对应的base.dto中加入即可
- 增加多个字段时，在数据库表中设计好以后
  - 第一步，更新entity：进入backend-api 执行 pnpm run db:sync
  - 第二步，更新dto：执行 pnpm run generate:dto

7. 增加新表/新模块

- 先同步数据库 pnpm run db:sync 再执行 generate:module

### 2026-08-24

初始化系统管理员（人员和角色以及关系）

```
POST http://localhost:3000/api/auth/init
Content-Type: application/json
x-init-token: cc3cb074-7b53-4ba2-8f96-4d9785c3e5a4

{
  "plainPassword": "Aa111111!"
}
```
