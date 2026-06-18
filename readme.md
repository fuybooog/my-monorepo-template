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

### 接口规范

采用restful规范

- 分页查询 关键字 **_ page _**
- 全量列表 关键字 **_ list _**
- 新增 关键字 **_ create _**
- 修改 关键字 **_ update _**
- 删除 关键字 **_ delete _**
- 详情 关键字 **_ detail _**
