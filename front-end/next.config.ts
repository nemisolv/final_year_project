/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== THÊM KHỐI CẤU HÌNH NÀY VÀO =====
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/public/**',
      },
    ],
  },
  // ==========================================
  async rewrites() {
    return [
      // ...
    ];
  },
};

module.exports = nextConfig;