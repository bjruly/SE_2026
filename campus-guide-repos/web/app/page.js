'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { LANGS, STRINGS } from '@/lib/i18n';
import { createGeofenceTracker } from '@/lib/geofence';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNarration } from '@/hooks/useNarration';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { usePois } from '@/hooks/usePois';
import { sendEvent } from '@/lib/poiSource';
import { extractCode, findPoiByCode } from '@/lib/qr';
import PoiList from '@/components/PoiList';
import QrScanner from '@/components/QrScanner';
import SimulationPanel from '@/components/SimulationPanel';
import AppQrBubble from '@/components/AppQrBubble';

function LanguagePicker({ lang, onChange, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const selected = rootRef.current?.querySelector('[aria-checked="true"]');
    selected?.focus();

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleOptionKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const options = [...rootRef.current.querySelectorAll('[role="menuitemradio"]')];
    const currentIndex = options.indexOf(document.activeElement);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : (currentIndex + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length;
    options[nextIndex]?.focus();
  };

  return (
    <div className="lang-picker" ref={rootRef}>
      <span className="lang-label">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="lang-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="lang-code">{lang.toUpperCase()}</span>
        <span className="lang-current">{LANGS.find((item) => item.code === lang)?.label}</span>
        <svg className={`lang-chevron ${open ? 'is-open' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="lang-menu" role="menu" aria-label={label}>
          {LANGS.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === item.code}
              className={`lang-option ${lang === item.code ? 'selected' : ''}`}
              onClick={() => {
                onChange(item.code);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onKeyDown={handleOptionKeyDown}
            >
              <span className="lang-option-code">{item.code.toUpperCase()}</span>
              <span>{item.label}</span>
              {lang === item.code && <span className="lang-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Bản đồ (MapLibre) chỉ chạy trên trình duyệt nên nạp với ssr: false
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="map map-loading">…</div>,
});

// Thời gian nghỉ trước khi cùng một địa điểm được tự phát lại (giá trị tạm của bản demo)
const COOLDOWN_MS = 60000;

export default function Home() {
  useOnlinePresence();
  const [lang, setLang] = useState('vi');
  const [tab, setTab] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(auto);
  autoRef.current = auto;
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

  const playSelectedPoi = (id) => {
    const poi = pois.find((item) => item.id === id);
    if (!poi) return;
    setSelectedId(id);
    setTab('list');
    if (autoRef.current) playPoi(poi, 'manual');
  };

  const chooseOverlapPoi = (poi) => {
    handledOverlapRef.current = overlapPois.map((item) => item.id).sort().join('|');
    setOverlapPois([]);
    setSelectedId(poi.id);
    setTab('list');
    playPoi(poi, 'manual');
  };

  const chooseMapOverlap = (poiIds, positionAtClick) => {
    const overlapping = pois.filter((poi) => poiIds.includes(poi.id));
    if (overlapping.length < 2) return;
    narration.stop();
    setSelectedId(null);
    setOverlapPois(overlapping);
    setTab('list');
    if (sim.mode === 'sim') setSim({ mode: 'sim', pos: positionAtClick, key: 'custom' });
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
  const playingPoi = pois.find((poi) => poi.id === narration.currentId);
  const playbackPoi = playingPoi || selected;

  const handlePlaybackPlay = () => {
    if (narration.status === 'paused') {
      narration.resume();
      return;
    }
    if (selected) playPoi(selected, 'manual');
  };

  let statusText = t.noPosition;
  if (sim.mode === 'sim') statusText = t.simTitle.split(' (')[0];
  else if (gps.status === 'ok') statusText = t.gpsReal;
  else if (gps.status === 'waiting') statusText = t.gpsWaiting;
  else if (gps.status === 'denied') statusText = t.gpsDenied;
  else if (gps.status === 'unsupported') statusText = t.gpsUnsupported;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img
            className="brand-mark"
            src="/logo-sgu.png"
            alt="Logo Đại Học Sài Gòn"
          />
          <div className="brand-copy">
            <p className="brand-eyebrow">{t.brandEyebrow}</p>
            <h1>{t.appTitle}</h1>
            <p className="brand-subtitle">{t.brandSubtitle}</p>
          </div>
        </div>
        <LanguagePicker lang={lang} onChange={setLang} label={t.language} />
      </header>

      <main className="layout">
        <section className="map-wrap">
          <AppQrBubble t={t} />
          <div className="playback-bar">
            <div className="playback-info" role="status" aria-live="polite">
              <span className="now-playing-icon" aria-hidden="true">♫</span>
              <span className="playback-copy">
                <strong>
                  {narration.status === 'playing'
                    ? t.nowPlaying
                    : narration.status === 'paused'
                      ? t.nowPaused
                      : playbackPoi
                        ? t.playbackReady
                        : t.autoFeature}
                </strong>
                <span className="now-playing-name">{playbackPoi?.name[lang] || t.panelDescription}</span>
              </span>
            </div>
            <div className="playback-buttons">
              <button
                type="button"
                className="playback-button primary"
                onClick={handlePlaybackPlay}
                disabled={!narration.supported || !selected || narration.status === 'playing'}
              >
                {narration.status === 'paused' ? `▶ ${t.resume}` : `▶ ${t.play}`}
              </button>
              <button
                type="button"
                className="playback-button"
                onClick={narration.pause}
                disabled={narration.status !== 'playing'}
              >
                ⏸ {t.pause}
              </button>
            </div>
          </div>
          <MapView
            pois={pois}
            lang={lang}
            position={position}
            selectedId={selectedId}
            insideIds={insideIds}
            overlapPois={overlapPois}
            onSelect={playSelectedPoi}
            onOverlap={chooseMapOverlap}
            errorText={t.mapError}
            onMapClick={(pos) => {
              setSelectedId(null);
              setOverlapPois([]);
              if (sim.mode === 'sim') setSim({ mode: 'sim', pos, key: 'custom' });
            }}
          />
        </section>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-eyebrow">{t.panelEyebrow}</p>
              <h2>{t.panelTitle}</h2>
              <p>{t.panelDescription}</p>
            </div>
            <span className="panel-heading-mark" aria-hidden="true">⌖</span>
          </div>

          <div className={`status-card ${sim.mode === 'sim' ? 'is-sim' : gps.status === 'ok' ? 'is-ready' : gps.status === 'denied' ? 'is-warning' : ''}`}>
            <div className="status-main">
              <span className="status-dot" />
              <span>{statusText}</span>
            </div>
            <span className="data-source">{{ api: t.dataApi, loading: t.dataLoading, fallback: t.dataFallback, local: t.dataLocal }[source]}</span>
            {position && (
              <span className="coords">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
            )}
          </div>

          <section className={`auto-card ${auto ? 'is-on' : ''}`}>
            <div className="auto-card-copy">
              <span className="auto-card-icon" aria-hidden="true">♫</span>
              <div>
                <span className="auto-card-label">{t.autoFeature}</span>
                <p>{auto ? t.autoEnabledHint : t.autoHint}</p>
              </div>
            </div>
            <button
              type="button"
              className={`auto-switch ${auto ? 'on' : ''}`}
              onClick={toggleAuto}
              role="switch"
              aria-checked={auto}
              aria-label={auto ? t.autoOn : t.autoOff}
            >
              <span>{auto ? t.autoOn : t.autoOff}</span>
              <span className="switch-track" aria-hidden="true"><span /></span>
            </button>
          </section>

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

          {tab === 'list' && (
            <>
              <div className="section-heading">
                <div>
                  <h3>{t.placesHeading}</h3>
                  <p>{t.placesDescription}</p>
                </div>
                <span className="count-badge">{pois.length}</span>
              </div>
              <PoiList pois={pois} lang={lang} t={t} position={position} insideIds={insideIds} selectedId={selectedId} onSelect={playSelectedPoi} />
            </>
          )}
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
