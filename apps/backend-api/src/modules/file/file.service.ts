import { promises as fs } from 'fs'
import * as path from 'path'
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)
  private readonly DATA_DIR = path.join(process.cwd(), 'data')
  private readonly DEFAULT_PATH = path.join(this.DATA_DIR, 'common.json')

  private getFilePath(code?: string): string {
    return code ? path.join(this.DATA_DIR, `${code}.json`) : this.DEFAULT_PATH
  }

  private async ensureFileExists(filePath: string): Promise<void> {
    try {
      await fs.mkdir(this.DATA_DIR, { recursive: true })

      await fs.access(filePath)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(filePath, '[]', 'utf-8')
      } else {
        throw err
      }
    }
  }

  async readData(code?: string): Promise<any[]> {
    const filePath = this.getFilePath(code)

    await this.ensureFileExists(filePath)

    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return data.trim() ? JSON.parse(data) : []
    } catch (error) {
      this.logger.error(`Read file error on ${filePath}:`, error)
      return []
    }
  }

  async writeData(data: any[], code?: string): Promise<void> {
    const filePath = this.getFilePath(code)
    await this.ensureFileExists(filePath)

    try {
      const jsonString = JSON.stringify(data, null, 2)
      const tempPath = `${filePath}.tmp`
      await fs.writeFile(tempPath, jsonString, 'utf-8')
      await fs.rename(tempPath, filePath)
    } catch (error) {
      this.logger.error(`Write file error on ${filePath}:`, error)
      throw new InternalServerErrorException('Data persistence failed')
    }
  }
}
