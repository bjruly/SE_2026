'use client';
import { useState, useMemo } from 'react';
import { distanceMeters } from '@/lib/geofence';

/**
 * DistanceTool – Hiển thị khoảng cách giữa 2 điểm bất kỳ trên giao diện web.
 * Điểm A có thể là vị trí GPS thật/giả lập của người dùng, hoặc bất kỳ POI nào.
 * Điểm B là bất kỳ POI nào trong danh sách.
 */
export default function DistanceTool({ pois, lang, t, position }) {
  const [pointA, setPointA] = useState('__pos__'); // '__pos__' = vị trí người dùng
  const [pointB, setPointB] = useState('');

  // Lấy tọa độ từ ID lựa chọn
  const coordA = useMemo(() => {
    if (pointA === '__pos__') return position ?? null;
    const poi = pois.find((p) => p.id === pointA);
    if (!poi) return null;
    return { lat: poi.latitude, lng: poi.longitude };
  }, [pointA, position, pois]);

  const coordB = useMemo(() => {
    const poi = pois.find((p) => p.id === pointB);
    if (!poi) return null;
    return { lat: poi.latitude, lng: poi.longitude };
  }, [pointB, pois]);

  const distM = useMemo(() => {
    if (!coordA || !coordB) return null;
    return distanceMeters(coordA, coordB);
  }, [coordA, coordB]);

  // Format khoảng cách: dưới 1000m hiện "m", từ 1000m trở lên hiện "km"
  const distLabel = useMemo(() => {
    if (distM === null) return null;
    if (distM < 1000) return `${Math.round(distM)} ${t.meters}`;
    return `${(distM / 1000).toFixed(2)} km`;
  }, [distM, t.meters]);

  const nameA = pointA === '__pos__'
    ? t.distToolMyPos
    : (pois.find((p) => p.id === pointA)?.name?.[lang] ?? pointA);
  const nameB = pois.find((p) => p.id === pointB)?.name?.[lang] ?? '';

  const aOptions = [
    { id: '__pos__', label: t.distToolMyPos },
    ...pois.map((p) => ({ id: p.id, label: p.name?.[lang] ?? p.id })),
  ];
  const bOptions = pois.map((p) => ({ id: p.id, label: p.name?.[lang] ?? p.id }));

  return (
    <section className="dist-tool">
      <h3 className="dist-tool-title">📏 {t.distToolTitle}</h3>
      <p className="meta">{t.distToolHint}</p>

      <div className="dist-tool-selects">
        {/* Điểm A */}
        <div className="dist-tool-field">
          <label className="dist-tool-label">{t.distToolPointA}</label>
          <select
            className="dist-tool-select"
            value={pointA}
            onChange={(e) => setPointA(e.target.value)}
          >
            {aOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {pointA === '__pos__' && !position && (
            <p className="dist-tool-warn">{t.distToolNoPos}</p>
          )}
        </div>

        {/* Mũi tên nối 2 điểm */}
        <div className="dist-tool-arrow" aria-hidden="true">↕</div>

        {/* Điểm B */}
        <div className="dist-tool-field">
          <label className="dist-tool-label">{t.distToolPointB}</label>
          <select
            className="dist-tool-select"
            value={pointB}
            onChange={(e) => setPointB(e.target.value)}
          >
            <option value="">{t.distToolSelectPlace}</option>
            {bOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kết quả */}
      {distLabel !== null ? (
        <div className="dist-tool-result" role="status" aria-live="polite">
          <span className="dist-tool-result-icon" aria-hidden="true">📐</span>
          <div className="dist-tool-result-body">
            <span className="dist-tool-result-value">{distLabel}</span>
            <span className="dist-tool-result-desc">
              {nameA} → {nameB}
            </span>
          </div>
        </div>
      ) : (
        pointB !== '' && (
          <div className="dist-tool-result is-empty" role="status">
            <span>{t.distToolNeedPos}</span>
          </div>
        )
      )}
    </section>
  );
}
