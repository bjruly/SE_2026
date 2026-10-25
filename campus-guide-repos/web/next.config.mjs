/** @type {import('next').NextConfig} */
const nextConfig = {
  // Xuất ra file tĩnh trong thư mục "out" (không cần máy chủ Node khi triển khai)
  output: 'export',
  devIndicators: false,
};

export default nextConfig;
