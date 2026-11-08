'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { circlePolygon } from '@/lib/circle';

const SGU_CENTER = [106.6822, 10.7599]; // [Kinh độ, Vĩ độ] ĐHSG 273 An Dương Vương
const SGU_DEFAULT_ZOOM = 17;

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

export default function MapPicker({ latitude, longitude, radiusMeters, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const hasValidCoords = !Number.isNaN(numLat) && !Number.isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
  const numRadius = Math.max(1, Math.min(1000, parseInt(radiusMeters, 10) || 25));

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter = hasValidCoords ? [numLng, numLat] : SGU_CENTER;
    const initialZoom = hasValidCoords ? 17.5 : SGU_DEFAULT_ZOOM;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      maxZoom: 19,
      minZoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      // Thêm source và layer cho vùng tròn geofence
      const initialGeoJson = hasValidCoords
        ? { type: 'Feature', geometry: circlePolygon(numLat, numLng, numRadius) }
        : { type: 'FeatureCollection', features: [] };

      map.addSource('picker-zone', {
        type: 'geojson',
        data: initialGeoJson,
      });

      map.addLayer({
        id: 'picker-zone-fill',
        type: 'fill',
        source: 'picker-zone',
        paint: {
          'fill-color': '#2563eb',
          'fill-opacity': 0.2,
        },
      });

      map.addLayer({
        id: 'picker-zone-stroke',
        type: 'line',
        source: 'picker-zone',
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 2,
        },
      });

      setLoaded(true);
    });

    // Sự kiện click lên bản đồ để chọn tọa độ
    map.on('click', (e) => {
      const lat = parseFloat(e.lngLat.lat.toFixed(6));
      const lng = parseFloat(e.lngLat.lng.toFixed(6));
      onChange({ latitude: String(lat), longitude: String(lng) });
    });

    mapRef.current = map;

    return () => {
      if (markerRef.current) markerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật marker và vùng tròn khi tọa độ hoặc bán kính thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hasValidCoords) {
      // Cập nhật marker
      if (!markerRef.current) {
        const marker = new maplibregl.Marker({ color: '#dc2626', draggable: true })
          .setLngLat([numLng, numLat])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onChange({
            latitude: String(parseFloat(lngLat.lat.toFixed(6))),
            longitude: String(parseFloat(lngLat.lng.toFixed(6))),
          });
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLngLat([numLng, numLat]);
      }

      // Cập nhật vùng tròn geofence
      if (loaded && map.getSource('picker-zone')) {
        map.getSource('picker-zone').setData({
          type: 'Feature',
          geometry: circlePolygon(numLat, numLng, numRadius),
        });
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (loaded && map.getSource('picker-zone')) {
        map.getSource('picker-zone').setData({ type: 'FeatureCollection', features: [] });
      }
    }
  }, [hasValidCoords, numLat, numLng, numRadius, loaded, onChange]);

  const goToSgu = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: SGU_CENTER, zoom: 17.5 });
    }
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#374151' }}>
          🗺️ Bản đồ chọn vị trí:
          <span style={{ fontWeight: '400', marginLeft: '6px', color: hasValidCoords ? '#16a34a' : '#6b7280' }}>
            {hasValidCoords ? `📍 (${numLat.toFixed(6)}, ${numLng.toFixed(6)}) · Vùng: ${numRadius}m` : '(Chưa chọn vị trí - chạm lên bản đồ)'}
          </span>
        </span>
        <button type="button" className="btn small" onClick={goToSgu} title="Di chuyển khung nhìn về trường ĐHSG">
          🏫 Về khuôn viên ĐHSG
        </button>
      </div>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '280px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          overflow: 'hidden',
          backgroundColor: '#e5e7eb',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.78rem', color: '#6b7280' }}>
        <span>💡 Click lên bản đồ hoặc kéo chấm đỏ để đặt vị trí.</span>
        <span>Vòng xanh hiển thị vùng kích hoạt ({numRadius}m)</span>
      </div>
    </div>
  );
}
