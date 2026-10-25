'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import PoiForm from '@/components/PoiForm';

export default function NewPoiPage() {
  const router = useRouter();
  return (
    <>
      <p><Link href="/pois" className="link">← Danh sách địa điểm</Link></p>
      <h1>Thêm địa điểm</h1>
      <p className="muted small">Mã địa điểm và mã QR được tạo tự động sau khi lưu.</p>
      <PoiForm
        submitLabel="Lưu địa điểm"
        onSubmit={async (body) => {
          await api('/api/admin/pois', { method: 'POST', body });
          router.push('/pois');
        }}
      />
    </>
  );
}
