'use client';
import { distanceMeters } from '@/lib/geofence';

export default function PoiList({ pois, lang, t, position, insideIds, onSelect }) {
  return (
    <ul className="poi-list">
      {pois.map((poi) => {
        const d = position ? Math.round(distanceMeters(position, { lat: poi.latitude, lng: poi.longitude })) : null;
        const inside = insideIds && insideIds.has(poi.id);
        return (
          <li key={poi.id}>
            <button type="button" className={`poi-item${inside ? ' inside' : ''}`} onClick={() => onSelect(poi.id)}>
              <span className="poi-name">{poi.name[lang]}</span>
              <span className="poi-meta">
                {d === null ? t.noPosition : `${t.distance}: ${d} ${t.meters}`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
