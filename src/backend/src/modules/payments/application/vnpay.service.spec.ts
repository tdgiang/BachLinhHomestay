import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from './vnpay.service';

const mockConfig = {
  get: jest.fn((key: string, def = '') => {
    const map: Record<string, string> = {
      VNPAY_TMN_CODE:    'TESTCODE',
      VNPAY_HASH_SECRET: 'test-secret-key-32-chars-padding!',
      VNPAY_URL:         'https://sandbox.vnpay.vn',
      VNPAY_RETURN_URL:  'http://localhost:3000/payment/callback',
    };
    return map[key] ?? def;
  }),
};

describe('VnpayService', () => {
  let service: VnpayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VnpayService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get(VnpayService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('createPaymentUrl', () => {
    it('returns a URL string starting with the VNPay base URL', () => {
      const url = service.createPaymentUrl({
        bookingCode: 'HMS-ABC123',
        amount: 500000,
        ipAddr: '127.0.0.1',
      });
      expect(typeof url).toBe('string');
      expect(url).toContain('vnp_TmnCode=TESTCODE');
      expect(url).toContain('vnp_Amount=50000000'); // ×100
      expect(url).toContain('vnp_TxnRef=HMS-ABC123');
      expect(url).toContain('vnp_SecureHash=');
    });

    it('multiplies amount by 100 (VNPay format)', () => {
      const url = service.createPaymentUrl({ bookingCode: 'X', amount: 1000 });
      expect(url).toContain('vnp_Amount=100000');
    });
  });

  describe('verifyCallback', () => {
    it('returns valid=false when secure hash is wrong', () => {
      const result = service.verifyCallback({
        vnp_TxnRef:     'HMS-001',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'wrong-hash',
      });
      expect(result.valid).toBe(false);
    });

    it('returns correct responseCode', () => {
      const result = service.verifyCallback({
        vnp_TxnRef:       'HMS-001',
        vnp_ResponseCode: '24',
        vnp_SecureHash:   'wrong',
      });
      expect(result.responseCode).toBe('24');
    });
  });
});
