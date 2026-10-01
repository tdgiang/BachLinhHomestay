import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  output: 'standalone',
  // Điều 11.2 Điều khoản sử dụng (bản ký ban hành) công bố URL này.
  async redirects() {
    return [
      { source: '/dieu-khoan-su-dung', destination: '/vi/terms', permanent: true },
      { source: '/:locale(vi|en)/dieu-khoan-su-dung', destination: '/:locale/terms', permanent: true },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'bachlinh.com.vn', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'www.bachlinh.com.vn', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'http',  hostname: 'localhost', port: '4000' },
      { protocol: 'http',  hostname: 'localhost', port: '9000' },
    ],
  },
});
