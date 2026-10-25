'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/permissions';

export default function PoiListPage() {
  const { user } = useAuth();
  const [pois, setPois] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setPois(await api('/api/admin/pois'));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(p) {
    if (!window.confirm(`Xóa địa điểm "${p.name.vi}"? Toàn bộ thống kê của địa điểm này cũng bị xóa. Không thể hoàn tác.`)) return;
    try {
      await api(`/api/admin/pois/${p.id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Địa điểm</h1>
        {can(user.role, 'poi:create') && <Link className="btn primary" href="/pois/new">+ Thêm địa điểm</Link>}
      </div>
      {error && <p className="error">{error}</p>}
      {!pois && !error && <p className="muted">Đang tải…</p>}
      {pois && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã</th><th>Tên (Tiếng Việt)</th><th>Tọa độ</th><th>Bán kính</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {pois.length === 0 && <tr><td colSpan={6} className="muted">Chưa có địa điểm nào</td></tr>}
              {pois.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name.vi}</td>
                  <td>{p.latitude}, {p.longitude}</td>
                  <td>{p.radiusMeters} m</td>
                  <td>{p.active ? 'Hoạt động' : 'Đã tắt'}</td>
                  <td className="actions">
                    {can(user.role, 'poi:update') && <Link className="btn small" href={`/pois/${p.id}`}>Sửa</Link>}
                    {can(user.role, 'poi:delete') && <button type="button" className="btn small danger" onClick={() => remove(p)}>Xóa</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
