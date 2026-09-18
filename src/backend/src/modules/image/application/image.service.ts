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

  /**
   * Lấy key lưu trữ từ URL công khai đã ghi trong DB.
   *
   * URL có dạng `<base>/uploads/rooms/<uuid>.webp` → key `rooms/<uuid>.webp`.
   * Chấp nhận cả URL cũ sinh ra khi `PUBLIC_URL` khác với hiện tại, vì chỉ dựa
   * vào đoạn `/uploads/` chứ không so sánh toàn bộ host.
   */
  extractKeyFromUrl(url: string): string | null {
    const marker = '/uploads/';
    const at = url.indexOf(marker);
    if (at === -1) return null;
    const key = url.slice(at + marker.length);
    return key.length > 0 ? key : null;
  }

  // Không async: xoá file là đồng bộ. Giữ Promise<void> để chỗ gọi không phải
  // đổi, nhưng bỏ `async` để lint không báo hàm async thiếu await.
  delete(key: string): Promise<void> {
    const filePath = path.resolve(this.uploadDir, key);

    // Key đến từ URL lưu trong DB. Chốt lại trong uploadDir để một key dị dạng
    // (`../../etc/passwd`) không xóa được file ngoài thư mục upload.
    if (!filePath.startsWith(path.resolve(this.uploadDir) + path.sep)) {
      this.logger.warn(`Rejected delete outside upload dir: ${key}`);
      return Promise.resolve();
    }

    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      this.logger.log(`Image deleted: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to delete image: ${key} — ${err}`);
    }
    return Promise.resolve();
  }

  generatePublicUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }
}
