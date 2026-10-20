'use client';
import { useEffect } from 'react';

// Đăng ký service worker (chỉ ở bản production) để app cài được và mở lại khi mạng yếu
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
