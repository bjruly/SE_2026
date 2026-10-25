'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PoiForm from '@/components/PoiForm';

export default function EditPoiPage() {
  const { id } = useParams();
  const router = useRouter();
  const [poi, setPoi] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api(`/api/admin/pois/${id}`).then(setPoi).catch((e) => setError(e.message));
  }, [id]);

  return (
    <>
      <p><Link href="/pois" className="link">← Danh sách địa điểm</Link></p>
      <h1>Sửa địa điểm {id}</h1>
      {error && <p className="error">{error}</p>}
      {poi && (
        <>
          <p className="muted small">Mã QR: <code>{poi.qrCode}</code> (không đổi khi sửa, để mã QR đã in vẫn dùng được).</p>
          {saved && <p className="ok">Đã lưu.</p>}
          <PoiForm
            initial={poi}
            submitLabel="Lưu thay đổi"
            onSubmit={async (body) => {
              const updated = await api(`/api/admin/pois/${id}`, { method: 'PUT', body });
              setPoi(updated);
              setSaved(true);
              router.refresh();
            }}
          />
        </>
      )}
    </>
  );
}
