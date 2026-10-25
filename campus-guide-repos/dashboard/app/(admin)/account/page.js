'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/permissions';

export default function AccountPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setOk(false);
    setBusy(true);
    try {
      await api('/api/auth/change-password', { method: 'POST', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      setOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Tài khoản của tôi</h1>
      <div className="card">
        <p><b>{user.fullName}</b></p>
        <p className="muted">{user.email} · {ROLE_LABEL[user.role]}</p>
      </div>
      <form className="card form" onSubmit={submit}>
        <h2>Đổi mật khẩu</h2>
        <label>Mật khẩu hiện tại<input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></label>
        <label>Mật khẩu mới (ít nhất 8 ký tự)<input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} minLength={8} required /></label>
        {error && <p className="error">{error}</p>}
        {ok && <p className="ok">Đã đổi mật khẩu.</p>}
        <button className="btn primary" type="submit" disabled={busy}>Đổi mật khẩu</button>
      </form>
    </>
  );
}
