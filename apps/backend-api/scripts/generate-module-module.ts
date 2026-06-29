import { toKebabCase, toPascalCase } from './utils'
function generateModuleTemplate(moduleName) {
  const kebabCaseName = toKebabCase(moduleName)
  const pascalCaseName = toPascalCase(kebabCaseName)
  return `import { Module } from '@nestjs/common'
import { ${pascalCaseName}Controller } from '@/modules/${kebabCaseName}/${kebabCaseName}.controller'
import { ${pascalCaseName}Service } from '@/modules/${kebabCaseName}/${kebabCaseName}.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ${pascalCaseName} } from '@/modules/${kebabCaseName}/entities/${kebabCaseName}.entity'
import { ${pascalCaseName}Repository } from '@/modules/${kebabCaseName}/${kebabCaseName}.repository'

@Module({
  imports: [TypeOrmModule.forFeature([${pascalCaseName}])],
  controllers: [${pascalCaseName}Controller],
  providers: [${pascalCaseName}Service, ${pascalCaseName}Repository],
  exports: [${pascalCaseName}Service, ${pascalCaseName}Repository],
})
export class ${pascalCaseName}Module {}
`
}
export default generateModuleTemplate
