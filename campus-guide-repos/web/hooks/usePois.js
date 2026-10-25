'use client';
import { useEffect, useState } from 'react';
import { API_URL, fallbackPois, fetchPois } from '@/lib/poiSource';

// Trả về danh sách địa điểm và nguồn của nó:
//   'loading'  đang gọi API (tạm thời dùng dữ liệu dự phòng để giao diện hiện ngay)
//   'api'      dữ liệu từ backend
//   'fallback' API lỗi hoặc mất mạng, dùng file pois.json dự phòng
//   'local'    chưa cấu hình NEXT_PUBLIC_API_URL, dùng file pois.json
export function usePois() {
  const [state, setState] = useState({ pois: fallbackPois, source: API_URL ? 'loading' : 'local' });

  useEffect(() => {
    if (!API_URL) return undefined;
    let alive = true;
    fetchPois()
      .then((pois) => alive && setState({ pois, source: 'api' }))
      .catch(() => alive && setState({ pois: fallbackPois, source: 'fallback' }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
