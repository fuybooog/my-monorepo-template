import * as fs from 'fs'
import * as path from 'path'
import generateDtoTemplate from './generate-module-dto'

function createBaseDto(moduleName: string) {
  if (!moduleName) {
    console.error('请提供模块名称！示例：pnpm run generate:dto module-name')
    process.exit(1)
  }
  const kebabName = moduleName.toLowerCase()

  const targetDir = path.resolve(__dirname, `../src/modules/${kebabName}`)

  const templates = {
    [`${kebabName}.dto`]: generateDtoTemplate(moduleName),
  }

  console.log('准备生成代码')

  console.log('生成测试代码')

  Object.entries(templates).forEach(([key, value]) => {
    const fileType = key.slice(key.lastIndexOf('.') + 1)
    Object.entries(templates[key]).forEach(([fileName, fileContent]) => {
      if (!fileName.includes('base.')) {
        return
      }
      const filePath = path.join(targetDir, fileType, fileName)

      const dirPath = path.dirname(filePath)

      try {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }

        fs.writeFileSync(filePath, fileContent, 'utf-8')
        console.log(`[生成成功] 文件已写入: ${fileName}`)
      } catch (error) {
        console.error(`[生成失败] 写入文件 ${fileName} 时出错:`, error)
      }
    })
  })
}

// pnpm run generate:dto user
createBaseDto(process.argv[2])
