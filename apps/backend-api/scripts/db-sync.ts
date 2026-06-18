import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'

const MODULE_MAPPING: Record<string, string> = {
  system_value_set: 'valueSet',
  system_user: 'user',
  system_role: 'role',
  system_resource: 'resource',
  system_user_role: '',
  system_role_resource: '',
};

const TEMP_DIR = path.join(__dirname, '../src/temp/entities-temp');
const MODULES_DIR = path.join(__dirname, '../src/modules');
const ENV_FILE = path.join(__dirname, '../.env')

async function run() {
  console.log('🔄 1. 正在从 MySQL 反向生成原始实体...');
  
  // 先清理旧的临时目录
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  // 读取.env 文件内容
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envConfig = dotenv.parse(envContent)

  // 执行原始生成命令（注意：这里要把 -o 指向临时目录）
  try {
    execFileSync(
      'npx',
      [
        'typeorm-model-generator',
        '-h', String(envConfig.DB_HOST),
        '-d', String(envConfig.DB_DATABASE),
        '-u', String(envConfig.DB_USERNAME),
        '-x', String(envConfig.DB_PASSWORD),
        '-p', String(envConfig.DB_PORT),
        '-e', 'mysql',
        '-o', TEMP_DIR,
        '--noConfig', 'true',
        '--case-file', 'camel',
        '--case-property', 'camel'
      ],
      { stdio: 'inherit' }
    );
  } catch (cmdError) {
    console.error('❌ 执行 typeorm-model-generator 失败，请检查数据库配置或物理连接！');
    throw cmdError;
  }

  console.log('📦 2. 原始实体生成成功，开始自动对焦分发...');

  // 读取生成的临时目录
  const files = fs.readdirSync(TEMP_DIR);

  for (const file of files) {
    // 忽略聚合导出的 index.ts 或 entities.ts
    if (file === 'index.ts' || file === 'entities.ts' || !file.endsWith('.ts')) continue;

    const filePath = path.join(TEMP_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const banner = `/**
 * 🚨🚨🚨 WARNING 🚨🚨🚨
 * 该文件由脚本 db-sync.ts 自动生成，请勿手动修改！
 * 如有字段变更，请修改数据库表结构后，重新运行 pnpm db:sync 命令触发覆盖。
 */

`;

  // 缝合 banner 和原本的代码内容
  content = banner + content;


    const classNameMatch = content.match(/export class ([a-zA-Z0-9_]+)/);
  if (classNameMatch) {
    const originalClassName = classNameMatch[1]; // 例如: SystemRole
    const generatedClassName = `${originalClassName}Generated`; // 例如: SystemRoleGenerated
    
    // 全局替换类名声明
    content = content.replace(
      new RegExp(`export class ${originalClassName}`, 'g'),
      `export class ${generatedClassName}`
    );
  }
  
    // 🎯 利用正则从代码中的 @Entity("table_name") 提取出物理表名
    const match = content.match(/@Entity\("([^"]+)"/);
    if (!match) continue;
    const tableName = match[1];

    // 查找映射关系
    const moduleName = MODULE_MAPPING[tableName];
    if (!moduleName) {
      console.warn(`⚠️ 找不到表 [${tableName}] 的模块映射，跳过自动分发，你可以去临时目录手动处理。`);
      continue;
    }

    // 🎯 转换文件名为 NestJS 规范的 kebab-case (例如: SysUser.ts -> sys-user.entity.ts)
    const kebabName = file
      .replace('.ts', '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    const targetFileName = `${kebabName}.generated.ts`;

    // 目标业务目录：src/modules/${moduleName}/entities/
    const targetDir = path.join(MODULES_DIR, moduleName, 'entities');
    
    // 如果目标业务目录不存在则创建
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, targetFileName);

    // 物理移动（覆盖）过去
    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log(`✅ 表 [${tableName}] -> 成功分发至 [modules/${moduleName}/entities/${targetFileName}]`);
  }

  // 清理临时产生的垃圾目录
  console.log('✨ 恭喜！全自动增量同步与路由对焦圆满完成！');
}

run().catch(console.error);