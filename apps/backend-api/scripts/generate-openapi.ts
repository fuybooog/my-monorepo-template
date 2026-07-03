import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from '../src/app.module'
import * as fs from 'fs'
import * as path from 'path'

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false })

  const config = new DocumentBuilder().setTitle('BACKED API').setVersion('1.0').build()

  const document = SwaggerModule.createDocument(app, config)
  const outputDir = path.resolve(__dirname, '../../../packages/types')
  const outputPath = path.join(outputDir, 'openapi.json')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2))

  console.log('✅ [Backend] openapi.json 生成成功！', outputPath)
  await app.close()
  process.exit(0)
}

generate()
