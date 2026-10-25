'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { can, ROLE_LABEL } from '@/lib/permissions';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', role: 'editor', password: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await api('/api/admin/users'));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!can(me.role, 'user:manage')) return <p className="error">Bạn không có quyền xem trang này.</p>;

  async function create(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    setBusy(true);
    try {
      await api('/api/admin/users', { method: 'POST', body: form });
      setForm({ email: '', fullName: '', role: 'editor', password: '' });
      setMsg('Đã tạo tài khoản.');
      await load();
    } catch (err) {
      setError([err.message, ...(err.details || []).map((d) => `${d.path}: ${d.message}`)].join(' — '));
    } finally {
      setBusy(false);
    }
  }

  async function patch(u, body, okMsg) {
    setError('');
    setMsg('');
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body });
      setMsg(okMsg);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetPassword(u) {
    const p = window.prompt(`Mật khẩu mới cho ${u.email} (ít nhất 8 ký tự):`);
    if (p) patch(u, { password: p }, 'Đã đặt lại mật khẩu.');
  }

  return (
    <>
      <h1>Tài khoản admin</h1>
      {error && <p className="error">{error}</p>}
      {msg && <p className="ok">{msg}</p>}

      <form className="card form" onSubmit={create}>
        <h2>Thêm tài khoản</h2>
        <div className="grid2">
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Họ tên<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Vai trò
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="editor">Biên tập</option>
              <option value="admin">Quản trị</option>
            </select>
          </label>
          <label>Mật khẩu (ít nhất 8 ký tự)<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required /></label>
        </div>
        <button className="btn primary" type="submit" disabled={busy}>Tạo tài khoản</button>
      </form>

      <h2>Danh sách</h2>
      {!users && !error && <p className="muted">Đang tải…</p>}
      {users && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Email</th><th>Họ tên</th><th>Vai trò</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>{u.email}{self && <span className="muted small"> (bạn)</span>}</td>
                    <td>{u.fullName}</td>
                    <td>
                      <select value={u.role} disabled={self} onChange={(e) => patch(u, { role: e.target.value }, 'Đã đổi vai trò.')}>
                        <option value="editor">{ROLE_LABEL.editor}</option>
                        <option value="admin">{ROLE_LABEL.admin}</option>
                      </select>
                    </td>
                    <td>{u.isActive ? 'Hoạt động' : 'Đã khóa'}</td>
                    <td className="actions">
                      {!self && (
                        <button type="button" className="btn small" onClick={() => patch(u, { isActive: !u.isActive }, u.isActive ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.')}>
                          {u.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                      )}
                      <button type="button" className="btn small" onClick={() => resetPassword(u)}>Đặt lại mật khẩu</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
