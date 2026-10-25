'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { can, ROLE_LABEL } from '@/lib/permissions';

const NAV = [
  { href: '/', label: 'Thống kê' },
  { href: '/pois', label: 'Địa điểm' },
  { href: '/qr', label: 'Mã QR' },
  { href: '/users', label: 'Tài khoản admin', permission: 'user:manage' },
  { href: '/account', label: 'Tài khoản của tôi' },
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Thuyết minh ĐHSG</div>
        <nav>
          {NAV.filter((n) => !n.permission || can(user.role, n.permission)).map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="who">
          <div>{user.fullName}</div>
          <div className="muted small">{ROLE_LABEL[user.role]}</div>
          <button type="button" className="btn small" onClick={logout}>Đăng xuất</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
