'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { LANGS, STRINGS } from '@/lib/i18n';
import { createGeofenceTracker } from '@/lib/geofence';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNarration } from '@/hooks/useNarration';
import { usePois } from '@/hooks/usePois';
import { sendEvent } from '@/lib/poiSource';
import { extractCode, findPoiByCode } from '@/lib/qr';
import PoiList from '@/components/PoiList';
import PoiDetail from '@/components/PoiDetail';
import QrScanner from '@/components/QrScanner';
import SimulationPanel from '@/components/SimulationPanel';

// Bản đồ (MapLibre) chỉ chạy trên trình duyệt nên nạp với ssr: false
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="map map-loading">…</div>,
});

// Thời gian nghỉ trước khi cùng một địa điểm được tự phát lại (giá trị tạm của bản demo)
const COOLDOWN_MS = 60000;

export default function Home() {
  const [lang, setLang] = useState('vi');
  const [tab, setTab] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [auto, setAuto] = useState(false);
  const [sim, setSim] = useState({ mode: 'gps', pos: null, key: 'gps' });
  const [insideIds, setInsideIds] = useState(() => new Set());
  const [overlapPois, setOverlapPois] = useState([]);
  const [qrNotFound, setQrNotFound] = useState(false);

  const t = STRINGS[lang];
  const { pois, source } = usePois();
  const gps = useGeolocation(sim.mode === 'gps');
  const position = sim.mode === 'sim' ? sim.pos : gps.position;
  const narration = useNarration();
  const trackerRef = useRef(null);
  const handledOverlapRef = useRef('');
  if (!trackerRef.current) trackerRef.current = createGeofenceTracker({ cooldownMs: COOLDOWN_MS });

  // Tự động mở địa điểm nếu người dùng quét QR từ camera điện thoại có kèm đường link (?poi=... hoặc ?qr=...)
  // Chạy lại khi danh sách địa điểm từ máy chủ về, vì địa điểm trong link có thể chỉ có ở dữ liệu máy chủ.
  const urlHandled = useRef(false);
  useEffect(() => {
    if (urlHandled.current || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('poi') || params.get('qr');
    if (!code) {
      urlHandled.current = true;
      return;
    }
    const match = findPoiByCode(pois, code);
    if (match) {
      urlHandled.current = true;
      setSelectedId(match.id);
      setTab('list');
      sendEvent({ poiId: match.id, type: 'qr_scan', lang });
    } else if (source !== 'loading') {
      urlHandled.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois, source]);

  // Phát thuyết minh và ghi nhận một lượt nghe (how: 'auto' = vào vùng, 'manual' = bấm nút phát)
  const playPoi = (poi, how) => {
    narration.speak(poi, lang);
    sendEvent({ poiId: poi.id, type: 'listen', lang, source: how });
  };

  const evaluate = (pos, autoOn) => {
    const r = trackerRef.current.update(pos, pois);
    setInsideIds(r.insideIds);
    if (r.nearbyPois.length > 1) {
      const overlapKey = r.nearbyPois.map((poi) => poi.id).sort().join('|');
      setOverlapPois(handledOverlapRef.current === overlapKey ? [] : r.nearbyPois);
      return;
    }
    handledOverlapRef.current = '';
    setOverlapPois([]);
    if (r.candidate && autoOn) {
      trackerRef.current.markPlayed(r.candidate.id);
      playPoi(r.candidate, 'auto');
      setSelectedId(r.candidate.id);
      setTab('list');
    }
  };

  // Mỗi khi vị trí đổi thì kiểm tra có vừa đi vào vùng nào không
  useEffect(() => {
    if (position) {
      if (sim.mode === 'sim') trackerRef.current.clearCooldowns();
      evaluate(position, auto);
    } else {
      trackerRef.current.clearInside();
      setInsideIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, sim.mode]);

  const toggleAuto = () => {
    const next = !auto;
    setAuto(next);
    if (next) {
      trackerRef.current.reset();
      if (position) evaluate(position, true);
    }
  };

  const selectPoi = (id) => {
    setSelectedId(id);
    setTab('list');
  };

  const chooseOverlapPoi = (poi) => {
    handledOverlapRef.current = overlapPois.map((item) => item.id).sort().join('|');
    setOverlapPois([]);
    selectPoi(poi.id);
  };

  const openByQr = (raw) => {
    const poi = findPoiByCode(pois, extractCode(raw));
    if (poi) {
      setQrNotFound(false);
      selectPoi(poi.id);
      sendEvent({ poiId: poi.id, type: 'qr_scan', lang });
    } else {
      setQrNotFound(true);
    }
  };

  const selected = pois.find((p) => p.id === selectedId) || null;

  let statusText = t.noPosition;
  if (sim.mode === 'sim') statusText = t.simTitle.split(' (')[0];
  else if (gps.status === 'ok') statusText = t.gpsReal;
  else if (gps.status === 'waiting') statusText = t.gpsWaiting;
  else if (gps.status === 'denied') statusText = t.gpsDenied;
  else if (gps.status === 'unsupported') statusText = t.gpsUnsupported;

  return (
    <div className="app">
      <header className="header">
        <h1>{t.appTitle}</h1>
        <label className="lang">
          <span>{t.language}</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
      </header>

      <main className="layout">
        <section className="map-wrap">
          <MapView
            pois={pois}
            lang={lang}
            position={position}
            selectedId={selectedId}
            insideIds={insideIds}
            onSelect={selectPoi}
            errorText={t.mapError}
            onMapClick={
              sim.mode === 'sim' ? (pos) => setSim({ mode: 'sim', pos, key: 'custom' }) : undefined
            }
          />
        </section>

        <aside className="panel">
          <div className="status">
            <span>{statusText}</span>
            <span className="muted">{{ api: t.dataApi, loading: t.dataLoading, fallback: t.dataFallback, local: t.dataLocal }[source]}</span>
            {position && (
              <span className="coords">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
            )}
          </div>

          <button type="button" className={`btn auto ${auto ? 'on' : ''}`} onClick={toggleAuto}>
            {auto ? t.autoOn : t.autoOff}
          </button>
          {!auto && <p className="meta">{t.autoHint}</p>}

          {overlapPois.length > 1 && (
            <section className="overlap-choice" aria-live="polite">
              <h3>{t.overlapTitle}</h3>
              <p className="meta">{t.overlapHint}</p>
              <div className="overlap-options">
                {overlapPois.map((poi) => (
                  <button key={poi.id} type="button" className="btn" onClick={() => chooseOverlapPoi(poi)}>
                    {poi.name[lang]}
                  </button>
                ))}
              </div>
            </section>
          )}

          <nav className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
              {t.tabList}
            </button>
            <button type="button" role="tab" aria-selected={tab === 'qr'} className={tab === 'qr' ? 'active' : ''} onClick={() => setTab('qr')}>
              {t.tabQr}
            </button>
          </nav>

          {tab === 'list' && (selected ? (
            <PoiDetail poi={selected} lang={lang} t={t} narration={narration} onBack={() => setSelectedId(null)} onPlay={(poi) => playPoi(poi, 'manual')} />
          ) : (
            <PoiList pois={pois} lang={lang} t={t} position={position} insideIds={insideIds} onSelect={selectPoi} />
          ))}
          {tab === 'qr' && <QrScanner t={t} onCode={openByQr} notFound={qrNotFound} />}

          <SimulationPanel
            pois={pois}
            lang={lang}
            t={t}
            mode={sim.mode}
            activeKey={sim.key}
            onUseGps={() => setSim({ mode: 'gps', pos: null, key: 'gps' })}
            onSimulate={(pos, key) => setSim({ mode: 'sim', pos, key })}
          />
          <p className="meta">{t.sampleNote}</p>
        </aside>
      </main>
    </div>
  );
}
