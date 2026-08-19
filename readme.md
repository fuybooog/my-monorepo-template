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
