'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { circlePolygon } from '@/lib/circle';
import {
  CAMPUS_MAP_BOUNDS,
  CAMPUS_MAP_FIT_MAX_ZOOM,
  CAMPUS_MAP_INITIAL_ZOOM,
  CAMPUS_MAP_MAX_ZOOM,
  CAMPUS_MAP_MIN_ZOOM,
  getMapStyle,
  OSM_RASTER_STYLE,
} from '@/lib/mapConfig';

// Bản đồ MapLibre GL (dữ liệu vector, mặc định OpenFreeMap). Chỉ chạy trên trình duyệt (nạp bằng next/dynamic, ssr: false).
// Nếu style bản đồ không tải được trong 8 giây thì tự chuyển sang ô ảnh OpenStreetMap (chỉ thử một lần).
const STYLE_TIMEOUT_MS = 8000;
const HAND_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28"><path d="M7 13V5.5a1.7 1.7 0 0 1 3.4 0V12 4.5a1.7 1.7 0 0 1 3.4 0V12 5.5a1.7 1.7 0 0 1 3.4 0V13 8a1.7 1.7 0 0 1 3.4 0v9.5c0 5-3.5 8.5-8.5 8.5h-.8c-2.7 0-4.1-1.1-5.8-3.3L2.4 17a1.8 1.8 0 0 1 2.8-2.2L7 17z" fill="#000" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>',
)}") 7 3, pointer`;

function buildData({ pois, lang, position, selectedId, insideIds, overlapPois }) {
  const highlightedIds = new Set(overlapPois.map((poi) => poi.id));
  const isHighlighted = (poiId) => (
    selectedId
      ? poiId === selectedId
      : highlightedIds.size
        ? highlightedIds.has(poiId)
        : insideIds.has(poiId)
  );
  const zones = {
    type: 'FeatureCollection',
    features: pois.map((p) => ({
      type: 'Feature',
      geometry: circlePolygon(p.latitude, p.longitude, p.radiusMeters),
      properties: {
        id: p.id,
        highlighted: isHighlighted(p.id),
        selected: p.id === selectedId,
      },
    })),
  };
  const points = {
    type: 'FeatureCollection',
    features: pois.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
      properties: {
        id: p.id,
        name: p.name[lang],
        highlighted: isHighlighted(p.id),
        selected: p.id === selectedId,
      },
    })),
  };
  const user = {
    type: 'FeatureCollection',
    features: position ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [position.lng, position.lat] }, properties: {} }] : [],
  };
  return { zones, points, user };
}

export default function MapView({ pois, lang, position, selectedId, insideIds, overlapPois, onSelect, onOverlap, onMapClick, errorText }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const latest = useRef({});
  const [failed, setFailed] = useState(false);

  // luôn giữ giá trị mới nhất để các hàm xử lý sự kiện của bản đồ dùng
  useEffect(() => {
    latest.current = { pois, lang, position, selectedId, insideIds, overlapPois, onSelect, onOverlap, onMapClick };
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
      map = new maplibregl.Map({
        container: containerRef.current,
        style: getMapStyle(),
        center: [106.682, 10.76],
        zoom: CAMPUS_MAP_INITIAL_ZOOM,
        minZoom: CAMPUS_MAP_MIN_ZOOM,
        maxZoom: CAMPUS_MAP_MAX_ZOOM,
        maxBounds: CAMPUS_MAP_BOUNDS,
      });
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
        paint: {
          'fill-color': ['case', ['get', 'highlighted'], '#16a34a', '#2563eb'],
          'fill-opacity': ['case', ['get', 'highlighted'], 0.3, 0.13],
        },
      });
      map.addLayer({
        id: 'zones-line', type: 'line', source: 'zones',
        paint: {
          'line-color': ['case', ['get', 'highlighted'], '#16a34a', '#2563eb'],
          'line-width': ['case', ['get', 'selected'], 3, 1.5],
        },
      });
      map.addLayer({
        id: 'poi-points', type: 'circle', source: 'pois',
        paint: {
          'circle-radius': 9,
          'circle-color': ['case', ['get', 'highlighted'], '#16a34a', '#2563eb'],
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

    // Mở ở tầm nhìn toàn khuôn viên, không zoom sát vào nhóm điểm mẫu.
    map.fitBounds(CAMPUS_MAP_BOUNDS, {
      padding: 48,
      maxZoom: CAMPUS_MAP_FIT_MAX_ZOOM,
      duration: 0,
    });

    map.on('click', (e) => {
      const overlappingZones = map.getLayer('zones-fill')
        ? map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] })
        : [];
      const overlapIds = [...new Set(overlappingZones.map((feature) => feature.properties.id))];
      if (overlapIds.length > 1) {
        latest.current.onOverlap?.(overlapIds, { lat: e.lngLat.lat, lng: e.lngLat.lng });
        return;
      }

      const hit = map.getLayer('poi-points') ? map.queryRenderedFeatures(e.point, { layers: ['poi-points'] }) : [];
      if (hit.length > 0) {
        latest.current.onSelect?.(hit[0].properties.id);
      } else if (latest.current.onMapClick) {
        latest.current.onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });
    map.on('mouseenter', 'poi-points', () => { map.getCanvas().style.cursor = HAND_CURSOR; });
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
  }, [pois, lang, position, selectedId, insideIds, overlapPois]);

  if (failed) return <div className="map map-loading">{errorText}</div>;
  return <div ref={containerRef} className="map" />;
}
