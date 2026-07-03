import * as fs from 'fs'
import * as path from 'path'
import generateControllerTemplate from './generate-module-controller'
import generateDtoTemplate from './generate-module-dto'
import generateE2eSpecTemplate from './generate-module-e2e-spec'
import generateModuleTemplate from './generate-module-module'
import generateRepositoryTemplate from './generate-module-repository'
import generateServiceTemplate from './generate-module-service'

function createModule(moduleName: string, moduleNameCn: string = '', forceCover = false) {
  if (!moduleName) {
    console.error('请提供模块名称！示例：pnpm run generate:module module-name')
    process.exit(1)
  }
  const kebabName = moduleName.toLowerCase()

  const targetDir = path.resolve(__dirname, `../src/modules/${kebabName}`)

  const templates = {
    [`${kebabName}.controller.ts`]: generateControllerTemplate(moduleName, moduleNameCn),
    [`${kebabName}.dto`]: generateDtoTemplate(moduleName),
    [`${kebabName}-controller.e2e-spec.ts`]: generateE2eSpecTemplate(moduleName),
    [`${kebabName}.module.ts`]: generateModuleTemplate(moduleName),
    [`${kebabName}.repository.ts`]: generateRepositoryTemplate(moduleName),
    [`${kebabName}.service.ts`]: generateServiceTemplate(moduleName, moduleNameCn),
  }

  console.log('准备生成代码')

  console.log('生成测试代码')

  Object.entries(templates).forEach(([key, value]) => {
    if (!key.endsWith('.ts')) {
      const fileType = key.slice(key.lastIndexOf('.') + 1)
      Object.entries(templates[key]).forEach(([fileName, fileContent]) => {
        const filePath = path.join(targetDir, fileType, fileName)

        const dirPath = path.dirname(filePath)

        try {
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
          }

          if (fs.existsSync(filePath)) {
            if (forceCover) {
              fs.writeFileSync(filePath, fileContent, 'utf-8')
            }
          } else {
            fs.writeFileSync(filePath, fileContent, 'utf-8')
          }
          console.log(`[生成成功] 文件已写入: ${fileName}`)
        } catch (error) {
          console.error(`[生成失败] 写入文件 ${fileName} 时出错:`, error)
        }
      })
    } else {
      const filePath = key.includes('e2e')
        ? path.join(targetDir, 'test', key)
        : path.join(targetDir, key)

      const dirPath = path.dirname(filePath)

      try {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }

        if (fs.existsSync(filePath)) {
          if (forceCover) {
            fs.writeFileSync(filePath, value as string, 'utf-8')
          }
        } else {
          fs.writeFileSync(filePath, value as string, 'utf-8')
        }
        console.log(`[生成成功] 文件已写入: ${key}`)
      } catch (error) {
        console.error(`[生成失败] 写入文件 ${key} 时出错:`, error)
      }
    }
  })

  // const dtoFile = path.join(targetDir, `/dto/test-${kebabName}.dto.ts`)

  // let isOk = true
  // if (fs.existsSync(dtoFile)) {
  //   if (!forceCover) {
  //     isOk = false
  //   }
  // }
  // if (isOk) {
  //   fs.writeFileSync(dtoFile, templates[`${kebabName}.dto.ts`])
  // }
}

// pnpm run generate:module user '用户'
createModule(process.argv[2], process.argv[3], process.argv[4] === 'y' || process.argv[4] === 'Y')
