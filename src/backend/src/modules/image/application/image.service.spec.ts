import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;
  let uploadDir: string;

  beforeEach(async () => {
    // ImageService lấy uploadDir từ process.cwd(), nên chạy trong thư mục tạm.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'img-svc-'));
    jest.spyOn(process, 'cwd').mockReturnValue(tmp);
    uploadDir = path.join(tmp, 'uploads');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: unknown) =>
              key === 'PUBLIC_URL' ? 'https://bachlinh.com.vn' : fallback,
          },
        },
      ],
    }).compile();
    service = module.get(ImageService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('extractKeyFromUrl', () => {
    it('lấy được key từ URL production', () => {
      expect(
        service.extractKeyFromUrl(
          'https://bachlinh.com.vn/uploads/rooms/2bdb204e-fdba-4ba1-8356-c9fe1d37ab93.webp',
        ),
      ).toBe('rooms/2bdb204e-fdba-4ba1-8356-c9fe1d37ab93.webp');
    });

    it('lấy được key từ URL localhost cũ', () => {
      expect(
        service.extractKeyFromUrl(
          'http://localhost:4000/uploads/rooms/abc.webp',
        ),
      ).toBe('rooms/abc.webp');
    });

    it('trả null cho URL không phải ảnh upload', () => {
      // Kiến trúc cũ dùng MinIO; URL kiểu này không còn file trên đĩa.
      expect(
        service.extractKeyFromUrl(
          'https://cdn.example.com/homestay-images/x.jpg',
        ),
      ).toBeNull();
      expect(service.extractKeyFromUrl('')).toBeNull();
    });
  });

  describe('delete', () => {
    it('xóa đúng file trong thư mục upload', async () => {
      const target = path.join(uploadDir, 'rooms', 'a.webp');
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, 'x');

      await service.delete('rooms/a.webp');

      expect(fs.existsSync(target)).toBe(false);
    });

    it('từ chối key thoát ra ngoài thư mục upload', async () => {
      const outside = path.join(uploadDir, '..', 'secret.txt');
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(outside, 'không được xóa');

      await service.delete('../secret.txt');

      expect(fs.existsSync(outside)).toBe(true);
    });

    it('không ném lỗi khi file đã biến mất', async () => {
      await expect(
        service.delete('rooms/khong-ton-tai.webp'),
      ).resolves.toBeUndefined();
    });
  });

  describe('upload', () => {
    it('chuyển ảnh sang webp và trả URL theo PUBLIC_URL', async () => {
      // PNG 1x1 hợp lệ.
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      );

      const { url, key } = await service.upload(
        { buffer: png } as Express.Multer.File,
        'rooms',
      );

      expect(key).toMatch(/^rooms\/[0-9a-f-]{36}\.webp$/);
      expect(url).toBe(`https://bachlinh.com.vn/uploads/${key}`);
      expect(fs.existsSync(path.join(uploadDir, key))).toBe(true);
      // Vòng lặp khép kín: URL vừa sinh ra phải tách lại đúng key.
      expect(service.extractKeyFromUrl(url)).toBe(key);
    });
  });
});
