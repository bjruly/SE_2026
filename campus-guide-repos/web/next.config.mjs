/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // Xuất ra file tĩnh trong thư mục "out" (không cần máy chủ Node khi triển khai)
  output: 'export',
  devIndicators: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
