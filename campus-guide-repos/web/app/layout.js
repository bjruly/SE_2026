import './globals.css';
import ServiceWorkerRegister from './ServiceWorkerRegister';

export const metadata = {
  title: 'Thuyết minh tự động – Đại Học Sài Gòn',
  description: 'Demo ứng dụng thuyết minh tự động đa ngôn ngữ (web PWA)',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d4ed8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
