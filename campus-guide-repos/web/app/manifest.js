export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Thuyết minh tự động – ĐHSG',
    short_name: 'Thuyết minh',
    description: 'Demo ứng dụng thuyết minh tự động đa ngôn ngữ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d4ed8',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
