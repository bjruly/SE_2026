import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard – Thuyết minh tự động ĐHSG',
  description: 'Trang quản trị địa điểm, mã QR và thống kê',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
