'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { circlePolygon } from '@/lib/circle';
import { getMapStyle, OSM_RASTER_STYLE } from '@/lib/mapConfig';

// Bản đồ MapLibre GL (dữ liệu vector, mặc định OpenFreeMap). Chỉ chạy trên trình duyệt (nạp bằng next/dynamic, ssr: false).
// Nếu style bản đồ không tải được trong 8 giây thì tự chuyển sang ô ảnh OpenStreetMap (chỉ thử một lần).
const STYLE_TIMEOUT_MS = 8000;

function buildData({ pois, lang, position, selectedId, insideIds }) {
  const zones = {
    type: 'FeatureCollection',
    features: pois.map((p) => ({
      type: 'Feature',
      geometry: circlePolygon(p.latitude, p.longitude, p.radiusMeters),
      properties: { inside: insideIds.has(p.id), selected: p.id === selectedId },
    })),
  };
  const points = {
    type: 'FeatureCollection',
    features: pois.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
      properties: { id: p.id, name: p.name[lang], inside: insideIds.has(p.id), selected: p.id === selectedId },
    })),
  };
  const user = {
    type: 'FeatureCollection',
    features: position ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [position.lng, position.lat] }, properties: {} }] : [],
  };
  return { zones, points, user };
}

export default function MapView({ pois, lang, position, selectedId, insideIds, onSelect, onMapClick, errorText }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const latest = useRef({});
  const [failed, setFailed] = useState(false);

  // luôn giữ giá trị mới nhất để các hàm xử lý sự kiện của bản đồ dùng
  useEffect(() => {
    latest.current = { pois, lang, position, selectedId, insideIds, onSelect, onMapClick };
  });

  const sync = () => {
    const map = mapRef.current;
    if (!map || !map.getSource('zones')) return;
    const data = buildData(latest.current);
    map.getSource('zones').setData(data.zones);
    map.getSource('pois').setData(data.points);
    map.getSource('user').setData(data.user);
  };

  // Tạo bản đồ một lần
  useEffect(() => {
    let map;
    try {
      map = new maplibregl.Map({ container: containerRef.current, style: getMapStyle(), center: [106.682, 10.76], zoom: 16 });
    } catch {
      setFailed(true);
      return undefined;
    }
    mapRef.current = map;
    // Chỉ dùng khi kiểm thử tự động: NEXT_PUBLIC_EXPOSE_MAP=1 để truy cập bản đồ qua window.__map
    if (process.env.NEXT_PUBLIC_EXPOSE_MAP === '1') window.__map = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    // (Thêm lại) các lớp vẽ vùng, địa điểm và vị trí người dùng mỗi khi style được nạp
    const addLayers = () => {
      if (map.getSource('zones')) return;
      const empty = { type: 'FeatureCollection', features: [] };
      map.addSource('zones', { type: 'geojson', data: empty });
      map.addSource('pois', { type: 'geojson', data: empty });
      map.addSource('user', { type: 'geojson', data: empty });
      map.addLayer({
        id: 'zones-fill', type: 'fill', source: 'zones',
        paint: { 'fill-color': ['case', ['get', 'inside'], '#16a34a', '#2563eb'], 'fill-opacity': ['case', ['get', 'inside'], 0.3, 0.13] },
      });
      map.addLayer({
        id: 'zones-line', type: 'line', source: 'zones',
        paint: { 'line-color': ['case', ['get', 'inside'], '#16a34a', '#2563eb'], 'line-width': ['case', ['get', 'selected'], 3, 1.5] },
      });
      map.addLayer({
        id: 'poi-points', type: 'circle', source: 'pois',
        paint: {
          'circle-radius': 9,
          'circle-color': ['case', ['get', 'inside'], '#16a34a', ['get', 'selected'], '#1d4ed8', '#2563eb'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });
      map.addLayer({
        id: 'user-point', type: 'circle', source: 'user',
        paint: { 'circle-radius': 9, 'circle-color': '#dc2626', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 },
      });
      sync();
    };

    let loaded = false;
    let fellBack = false;
    const useOsmFallback = () => {
      if (fellBack || loaded) return;
      fellBack = true;
      map.setStyle(OSM_RASTER_STYLE);
    };
    const timer = setTimeout(useOsmFallback, STYLE_TIMEOUT_MS);

    map.on('style.load', () => {
      loaded = true;
      clearTimeout(timer);
      addLayers();
    });
    map.on('error', () => {
      if (!loaded) useOsmFallback();
    });

    // Khung nhìn ban đầu: ôm vừa tất cả địa điểm
    const first = latest.current.pois;
    if (first && first.length) {
      const bounds = new maplibregl.LngLatBounds();
      first.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 18, duration: 0 });
    }

    map.on('click', 'poi-points', (e) => {
      const f = e.features && e.features[0];
      if (f && latest.current.onSelect) latest.current.onSelect(f.properties.id);
    });
    map.on('click', (e) => {
      const hit = map.getLayer('poi-points') ? map.queryRenderedFeatures(e.point, { layers: ['poi-points'] }) : [];
      if (hit.length === 0 && latest.current.onMapClick) latest.current.onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
    map.on('mouseenter', 'poi-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'poi-points', () => { map.getCanvas().style.cursor = ''; });

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật dữ liệu khi trạng thái đổi
  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois, lang, position, selectedId, insideIds]);

  if (failed) return <div className="map map-loading">{errorText}</div>;
  return <div ref={containerRef} className="map" />;
}
