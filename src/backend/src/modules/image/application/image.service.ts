import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = config.get<number>('MINIO_PORT', 9000);
    const useSSL = config.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.endpoint = `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`;
    this.bucket = config.get<string>('MINIO_BUCKET', 'homestay-images');

    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true, // required for MinIO
    });
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

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read' as any,
      }),
    );

    const url = `${this.endpoint}/${this.bucket}/${key}`;
    this.logger.log(`Image uploaded: ${key}`);
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Image deleted: ${key}`);
  }

  generatePublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
