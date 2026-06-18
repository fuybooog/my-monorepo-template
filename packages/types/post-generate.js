const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const apiFilePath = path.resolve(__dirname, './src/api.ts')
const outFilePath = path.resolve(__dirname, './src/api.type.ts')

if (!fs.existsSync(apiFilePath)) {
  console.error('未找到 api.ts 文件')
  process.exit(1)
}

const sourceCode = fs.readFileSync(apiFilePath, 'utf8')
const sourceFile = ts.createSourceFile(apiFilePath, sourceCode, ts.ScriptTarget.Latest, true)

const dtoList = []
const operationList = []

function visit(node) {
  if (ts.isInterfaceDeclaration(node) && node.name.text === 'components') {
    const schemasType = node.members.find((member) => member.name && member.name.text === 'schemas')
    if (schemasType && schemasType.type && ts.isTypeLiteralNode(schemasType.type)) {
      schemasType.type.members.forEach((member) => {
        if (member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) {
          dtoList.push(member.name.text)
        }
      })
    }
  }

  if (ts.isInterfaceDeclaration(node) && node.name.text === 'operations') {
    node.members.forEach((member) => {
      if (member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) {
        operationList.push(member.name.text)
      }
    })
  }
  
  ts.forEachChild(node, visit)
}

visit(sourceFile)

if (dtoList.length > 0 || operationList.length > 0) {
  let indexContent = `/**\n * 本文件由官方 TS-AST 编译器脚本自动生成，请勿手动修改。\n */\n\n`
  indexContent += `import { components, operations } from './api';\n\n`
  indexContent += `export type { components, operations };\n\n`

  indexContent += 'export namespace Backend {\n'
  
  dtoList.forEach((dto) => {
    indexContent += `  export type ${dto} = components['schemas']['${dto}'];\n`
  })

  if (operationList.length > 0) {
    indexContent += '\n  /* ====== 动态 AST 自动桥接的 Response 类型 ====== */\n'
    operationList.forEach((op) => {
      const cleanName = op.replace(/^\w+Controller_/, '') 
      const resTypeName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + 'Res'

      indexContent += `  export type ${resTypeName} = \n`
      indexContent += `    operations['${op}']['responses'] extends { '200': { content: { 'application/json': infer R } } } ? R :\n`
      indexContent += `    operations['${op}']['responses'] extends { '201': { content: { 'application/json': infer R } } } ? R : unknown;\n\n`
    })
  }

  indexContent += '}\n'

  fs.writeFileSync(outFilePath, indexContent, 'utf8')
  console.log('[Success] Backend 命名空间类型生成成功！')
} else {
  console.error('AST 无法解析结构')
}