'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Bản đồ Leaflet + OpenStreetMap. Chỉ chạy trên trình duyệt (được nạp bằng next/dynamic, ssr: false).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export default function MapView({ pois, lang, position, selectedId, insideIds, onSelect, onMapClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const poiLayerRef = useRef(null);
  const userRef = useRef(null);
  const clickRef = useRef(onMapClick);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    clickRef.current = onMapClick;
    selectRef.current = onSelect;
  });

  // Tạo bản đồ một lần
  useEffect(() => {
    const map = L.map(containerRef.current);
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
    const bounds = L.latLngBounds(pois.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds.pad(0.6));
    map.on('click', (e) => clickRef.current && clickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    poiLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      userRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vẽ các địa điểm và vùng của chúng
  useEffect(() => {
    const group = poiLayerRef.current;
    if (!group) return;
    group.clearLayers();
    pois.forEach((poi) => {
      const inside = insideIds && insideIds.has(poi.id);
      const selected = poi.id === selectedId;
      const color = inside ? '#16a34a' : selected ? '#1d4ed8' : '#2563eb';
      L.circle([poi.latitude, poi.longitude], {
        radius: poi.radiusMeters,
        color,
        weight: selected ? 3 : 1.5,
        fillOpacity: inside ? 0.3 : 0.12,
        interactive: false,
      }).addTo(group);
      L.circleMarker([poi.latitude, poi.longitude], { radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 })
        .bindTooltip(poi.name[lang], { permanent: false })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current && selectRef.current(poi.id);
        })
        .addTo(group);
    });
  }, [pois, lang, selectedId, insideIds]);

  // Vẽ vị trí hiện tại của người dùng
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!position) {
      if (userRef.current) {
        userRef.current.remove();
        userRef.current = null;
      }
      return;
    }
    const ll = [position.lat, position.lng];
    if (!userRef.current) {
      userRef.current = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#dc2626', fillOpacity: 1, interactive: false }).addTo(map);
    } else {
      userRef.current.setLatLng(ll);
    }
  }, [position]);

  return <div ref={containerRef} className="map" />;
}
