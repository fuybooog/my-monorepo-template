import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

function deleteModule(moduleName) {
  if (!moduleName) {
    console.error('请提供模块名称！示例：pnpm run delete:module module-name')
    process.exit(1)
  }
  const kebabName = moduleName.toLowerCase()
  const targetDir = path.resolve(__dirname, `../src/modules/${kebabName}`)

  const files = ['.controller.ts', '.e2e-spec.ts', '.module.ts', '.repository.ts', '.service.ts']

  // 创建 readline 接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  // 弹出确认提示
  rl.question(`确定要删除模块 "${kebabName}" 吗？(y/n): `, (answer) => {
    rl.close() // 关闭接口，否则程序不会退出

    // 判断用户输入
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      files.forEach((fileSuffix) => {
        const fileName = `${kebabName}${fileSuffix}`
        const filePath = path.join(targetDir, fileName)
        if (fs.existsSync(filePath)) {
          console.log('【删除】', fileName)
          fs.unlinkSync(filePath)
        }
      })
      console.log('模块删除完成。')
    } else {
      console.log('已取消删除操作。')
    }
  })
}

deleteModule(process.argv[2])
