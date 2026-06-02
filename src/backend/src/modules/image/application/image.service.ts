import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    const port = config.get<number>('PORT', 4000);
    const apiUrl = config.get<string>('PUBLIC_URL', `http://localhost:${port}`);
    this.baseUrl = apiUrl;
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'rooms',
  ): Promise<{ url: string; key: string }> {
    const webpBuffer = await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const key = `${folder}/${randomUUID()}.webp`;
    const filePath = path.join(this.uploadDir, key);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, webpBuffer);

    const url = `${this.baseUrl}/uploads/${key}`;
    this.logger.log(`Image saved: ${filePath}`);
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      this.logger.log(`Image deleted: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to delete image: ${key} — ${err}`);
    }
  }

  generatePublicUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}
