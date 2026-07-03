import * as fs from 'fs'
import * as ts from 'typescript'

/**
 * 将任意格式的字符串转为全小写的中划线分隔格式（kebab-case）
 * 示例：
 *   toKebabCase('abcAbc')      // 'abc-abc'
 *   toKebabCase('AbcAbc')      // 'abc-abc'
 *   toKebabCase('abc-Abc')     // 'abc-abc'
 *   toKebabCase('helloWorld')  // 'hello-world'
 *   toKebabCase('HelloWorld')  // 'hello-world'
 *   toKebabCase('foo_bar')     // 'foo-bar'
 */
export function toKebabCase(str: string): string {
  if (!str) return ''

  // 1. 在大写字母前插入中划线（处理驼峰）
  let result = str.replace(/([a-z0-9])([A-Z])/g, '$1-$2')

  // 2. 将所有非字母数字的字符（空格、下划线、已有中划线等）统一替换为单个中划线
  result = result.replace(/[^a-zA-Z0-9]+/g, '-')

  // 3. 转为小写
  result = result.toLowerCase()

  // 4. 去除首尾多余的中划线
  result = result.replace(/^-|-$/g, '')

  return result
}

export function toSnakeCase(str: string): string {
  if (!str) return ''

  // 1. 在大写字母前插入下划线
  let result = str.replace(/([a-z0-9])([A-Z])/g, '$1_$2')

  // 2. 将所有非字母数字的字符替换为单个下划线
  result = result.replace(/[^a-zA-Z0-9]+/g, '_')

  // 3. 转小写并去首尾下划线
  return result.toLowerCase().replace(/^_+|_+$/g, '')
}

/**
 * 将全小写中划线格式的字符串转为小写驼峰（camelCase）
 * 输入必须符合 kebab-case（全小写，单词间用 '-' 分隔），否则结果可能不符合预期
 * 示例：toCamelCase('abc-abc') => 'abcAbc'
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * 将全小写中划线格式的字符串转为大写驼峰（PascalCase）
 * 输入必须符合 kebab-case（全小写，单词间用 '-' 分隔），否则结果可能不符合预期
 * 示例：toPascalCase('abc-abc') => 'AbcAbc'
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

export interface EntityProperty {
  name: string
  type: string
  comment?: string
}

/**
 * 通过 TypeScript AST 提取 Entity 类中的属性
 * @param entityFilePath Entity 文件的绝对路径
 */
export function parseEntityProperties(entityFilePath: string): EntityProperty[] {
  if (!fs.existsSync(entityFilePath)) {
    console.log('文件不存在')
    return []
  }

  const sourceCode = fs.readFileSync(entityFilePath, 'utf-8')
  const sourceFile = ts.createSourceFile(entityFilePath, sourceCode, ts.ScriptTarget.Latest, true)
  const properties: EntityProperty[] = []

  function visit(node: ts.Node) {
    if (ts.isPropertyDeclaration(node) && node.name) {
      const propName = node.name.getText(sourceFile)
      let propType = node.type ? node.type.getText(sourceFile) : 'any'

      // 1. 处理 Date -> string 的清洗
      // if (propType.includes('Date')) {
      //   propType = propType.replace(/Date/g, 'string');
      // }

      // 2. 增强版注释提取：同时兼容 JSDoc 和 TypeORM 装饰器里的 comment
      let comment = ''

      // 优先看有没有标准 JSDoc
      const jsDoc = (node as any).jsDoc
      if (jsDoc && jsDoc.length > 0) {
        comment = jsDoc[0].comment || ''
      }

      // 如果没有 JSDoc，去挖修饰器 @Column({ comment: "xxx" })
      if (!comment && node.modifiers) {
        node.modifiers.forEach((modifier) => {
          if (ts.isDecorator(modifier)) {
            const decoratorText = modifier.getText(sourceFile)
            // 用正则精准匹配装饰器对象参数里的 comment: "xxx" 或 comment 'xxx'
            const match = decoratorText.match(/comment:\s*["']([^"']+)["']/)
            if (match && match[1]) {
              comment = match[1]
            }
          }
        })
      }

      properties.push({
        name: propName,
        type: propType,
        comment: comment.trim(),
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  console.log(properties)

  return properties
}
export function getDateFieldsStr(prop: EntityProperty): string {
  return `
  @ApiPropertyOptional({ description: '${prop.comment || ''}开始', example: '2000-10-10 00:00:00' })
  @IsString()
  @IsOptional()
  ${prop.name}Start${prop.type.includes('null') ? '?' : ''}: string;\n\n
  @ApiPropertyOptional({ description: '${prop.comment || ''}结束', example: '2000-10-10 23:59:59' })
  @IsString()
  @IsOptional()
  ${prop.name}End${prop.type.includes('null') ? '?' : ''}: string;\n\n
`
}

export function getDateFieldsStrByDates(properties: EntityProperty[]) {
  let fieldsStr = ''
  properties.forEach((prop) => {
    if (prop.type.includes('Date') && prop.name !== 'deletedAt') {
      fieldsStr += getDateFieldsStr(prop)
    }
  })
  return fieldsStr
}

export function generateDtoFields(
  properties: EntityProperty[],
  type1: 'req' | 'resp' = 'req',
): string {
  let fieldsStr = ''

  properties.forEach((prop) => {
    const apiDesc = `description: '${prop.comment || ''}'`

    fieldsStr += `  @${prop.type.includes('null') ? 'ApiPropertyOptional' : 'ApiProperty'}({ ${apiDesc}, type: {typeValue} })\n`
    let typeValue = 'String'
    if (prop.type.includes('number')) {
      fieldsStr += `  @IsInt()\n`
      typeValue = 'Number'
    } else if (prop.type.includes('string')) {
      fieldsStr += `  @IsString()\n`
      typeValue = 'String'
    } else if (prop.type.includes('[]')) {
      fieldsStr += `  @IsArray()\n`
      typeValue = 'Array'
    }
    fieldsStr = renderStr(fieldsStr, { typeValue })
    if (prop.type.includes('null')) {
      fieldsStr += `  @IsOptional()\n`
    }

    if (type1 === 'resp') {
      fieldsStr += `  @Expose()\n`
    }

    fieldsStr += `  ${prop.name}${prop.type.includes('null') ? '?' : ''}: ${prop.type};\n\n`
  })

  return fieldsStr
}

function renderStr(template: string, context: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => context[key] || '')
}
