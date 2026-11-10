import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { API_URL } from '../config';
import { fallbackPois, fetchPois } from '../lib/poiSource';

// Trả về danh sách địa điểm và nguồn của nó:
//   'loading'  đang gọi API (tạm thời dùng dữ liệu dự phòng để giao diện hiện ngay)
//   'api'      dữ liệu từ backend
//   'fallback' API lỗi hoặc mất mạng, dùng file pois.json dự phòng
//   'local'    chưa cấu hình EXPO_PUBLIC_API_URL, dùng file pois.json
export function usePois() {
  const [state, setState] = useState({ pois: fallbackPois, source: API_URL ? 'loading' : 'local' });

  useEffect(() => {
    if (!API_URL) return undefined;
    let alive = true;

    const load = () => {
      fetchPois()
        .then((pois) => alive && setState({ pois, source: 'api' }))
        .catch(() => alive && setState((current) => ({
          pois: current.source === 'api' ? current.pois : fallbackPois,
          source: current.source === 'api' ? 'api' : 'fallback',
        })));
    };

    load();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') load();
    });
    const timer = setInterval(load, 30000);

    return () => {
      alive = false;
      subscription.remove();
      clearInterval(timer);
    };
  }, []);

  return state;
}
