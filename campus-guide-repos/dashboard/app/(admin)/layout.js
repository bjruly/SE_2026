'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Shell from '@/components/Shell';

// Mọi trang trong nhóm (admin) đều yêu cầu đăng nhập
export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <p className="center muted">Đang tải…</p>;
  return <Shell>{children}</Shell>;
}
