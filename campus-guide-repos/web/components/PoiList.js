'use client';
import { distanceMeters } from '@/lib/geofence';
import { getPoiIcon } from '@/lib/poiIcons';

export default function PoiList({ pois, lang, t, position, insideIds, selectedId, onSelect }) {
  return (
    <ul className="poi-list">
      {pois.map((poi) => {
        const d = position ? Math.round(distanceMeters(position, { lat: poi.latitude, lng: poi.longitude })) : null;
        const inside = insideIds && insideIds.has(poi.id);
        const selected = selectedId === poi.id;
        return (
          <li key={poi.id}>
            <div className={`poi-card${inside ? ' inside' : ''}${selected ? ' selected' : ''}`}>
              <button type="button" className="poi-item" aria-pressed={selected} onClick={() => onSelect(poi.id)}>
                <span className="poi-icon" aria-hidden="true">{getPoiIcon(poi.id)}</span>
                <span className="poi-copy">
                  <span className="poi-name">{poi.name[lang]}</span>
                  <span className="poi-meta">
                    {d === null ? t.noPosition : `${t.distance}: ${d} ${t.meters}`}
                  </span>
                </span>
              </button>
              {selectedId === poi.id && (
                <details className="poi-narration">
                  <summary>{t.viewNarration}</summary>
                  <p>{poi.description[lang]}</p>
                </details>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
