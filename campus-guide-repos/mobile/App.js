import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { COOLDOWN_MS } from './src/config';
import { LANGS, STRINGS } from './src/lib/i18n';
import { createGeofenceTracker } from './src/lib/geofence';
import { useGps } from './src/hooks/useGps';
import { useNarration } from './src/hooks/useNarration';
import { usePois } from './src/hooks/usePois';
import { sendEvent, sendPresence } from './src/lib/poiSource';
import { extractCode, findPoiByCode } from './src/lib/qr';
import MapWebView from './src/components/MapWebView';
import PoiList from './src/components/PoiList';
import PoiDetail from './src/components/PoiDetail';
import QrScanner from './src/components/QrScanner';
import SimPanel from './src/components/SimPanel';
import { colors, shared } from './src/styles';

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  useEffect(() => {
    let timer;
    let loggedFailure = false;
    const heartbeat = () => {
      sendPresence()
        .then(() => {
          loggedFailure = false;
        })
        .catch((error) => {
          if (!loggedFailure) console.error(error);
          loggedFailure = true;
        });
    };
    const update = (state) => {
      if (state === 'active') {
        heartbeat();
        if (!timer) timer = setInterval(heartbeat, 30000);
      } else if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    update(AppState.currentState || 'active');
    const subscription = AppState.addEventListener('change', update);
    return () => {
      subscription.remove();
      if (timer) clearInterval(timer);
    };
  }, []);

  const [lang, setLang] = useState('vi');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [tab, setTab] = useState('map'); // 'map' | 'list' | 'qr'
  const [selectedId, setSelectedId] = useState(null);
  const [auto, setAuto] = useState(false);
  const [sim, setSim] = useState({ mode: 'gps', pos: null, key: 'gps' });
  const [insideIds, setInsideIds] = useState(() => new Set());
  const [overlapPois, setOverlapPois] = useState([]);
  const [qrNotFound, setQrNotFound] = useState(false);

  const t = STRINGS[lang];
  const { pois, source } = usePois();
  const gps = useGps(sim.mode === 'gps');
  const position = sim.mode === 'sim' ? sim.pos : gps.position;
  const narration = useNarration();
  const trackerRef = useRef(null);
  const handledOverlapRef = useRef('');
  if (!trackerRef.current) trackerRef.current = createGeofenceTracker({ cooldownMs: COOLDOWN_MS });

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
  if (sim.mode === 'sim') statusText = t.simActive;
  else if (gps.status === 'ok') statusText = t.gpsReal;
  else if (gps.status === 'waiting') statusText = t.gpsWaiting;
  else if (gps.status === 'denied') statusText = t.gpsDenied;
  else if (gps.status === 'unsupported') statusText = t.gpsUnsupported;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{t.appTitle}</Text>
        <View style={styles.languagePicker}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.language || 'Language'}
            accessibilityState={{ expanded: languageOpen }}
            onPress={() => setLanguageOpen((open) => !open)}
            style={styles.languageButton}
          >
            <Text style={styles.languageButtonText}>{LANGS.find((l) => l.code === lang)?.short}</Text>
            <Text style={styles.languageChevron}>{languageOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {languageOpen && (
            <View style={styles.languageMenu} accessibilityRole="menu">
              {LANGS.map((l) => (
                <Pressable
                  key={l.code}
                  accessibilityRole="menuitem"
                  onPress={() => {
                    setLang(l.code);
                    setLanguageOpen(false);
                  }}
                  style={[styles.languageOption, lang === l.code && styles.languageOptionActive]}
                >
                  <Text style={[styles.languageOptionText, lang === l.code && styles.languageOptionTextActive]}>
                    {l.label}
                  </Text>
                  {lang === l.code && <Text style={styles.languageCheck}>✓</Text>}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        {overlapPois.length > 1 && (
          <View style={styles.overlapChoice} accessibilityLiveRegion="polite">
            <Text style={styles.overlapTitle}>{t.overlapTitle}</Text>
            <Text style={shared.meta}>{t.overlapHint}</Text>
            {overlapPois.map((poi) => (
              <Pressable key={poi.id} style={styles.overlapOption} onPress={() => chooseOverlapPoi(poi)}>
                <Text style={styles.overlapOptionText}>{poi.name[lang]}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {tab === 'map' && (
          <View style={styles.fill}>
            <View style={styles.mapBox}>
              <MapWebView
                pois={pois}
                lang={lang}
                position={position}
                selectedId={selectedId}
                insideIds={insideIds}
                onSelect={selectPoi}
                errorText={t.mapError}
                onMapClick={sim.mode === 'sim' ? (pos) => setSim({ mode: 'sim', pos, key: 'custom' }) : undefined}
              />
            </View>
            <View style={styles.sheet}>
              <View style={styles.statusRow}>
                <Text style={styles.status} numberOfLines={2}>{statusText}</Text>
                <Text style={styles.coords}>{{ api: t.dataApi, loading: t.dataLoading, fallback: t.dataFallback, local: t.dataLocal }[source]}</Text>
                {position && (
                  <Text style={styles.coords}>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</Text>
                )}
              </View>
              <Pressable style={[shared.btn, auto && shared.btnOn]} onPress={toggleAuto}>
                <Text style={[shared.btnText, auto && shared.btnPrimaryText]}>{auto ? t.autoOn : t.autoOff}</Text>
              </Pressable>
              {!auto && <Text style={shared.meta}>{t.autoHint}</Text>}
              {selected && (
                <Pressable style={shared.btn} onPress={() => setTab('list')}>
                  <Text style={shared.btnText}>{selected.name[lang]} — {t.openDetail}</Text>
                </Pressable>
              )}
              <SimPanel
                pois={pois}
                lang={lang}
                t={t}
                mode={sim.mode}
                activeKey={sim.key}
                onUseGps={() => setSim({ mode: 'gps', pos: null, key: 'gps' })}
                onSimulate={(pos, key) => setSim({ mode: 'sim', pos, key })}
              />
              <Text style={shared.meta}>{t.sampleNote}</Text>
            </View>
          </View>
        )}

        {tab === 'list' && (selected ? (
          <PoiDetail poi={selected} lang={lang} t={t} narration={narration} onBack={() => setSelectedId(null)} onPlay={(poi) => playPoi(poi, 'manual')} />
        ) : (
          <PoiList pois={pois} lang={lang} t={t} position={position} insideIds={insideIds} onSelect={selectPoi} />
        ))}

        {tab === 'qr' && <QrScanner t={t} onCode={openByQr} notFound={qrNotFound} />}
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'map', label: t.tabMap },
          { key: 'list', label: t.tabList },
          { key: 'qr', label: t.tabQr },
        ].map((x) => (
          <Pressable key={x.key} onPress={() => setTab(x.key)} style={[styles.tab, tab === x.key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === x.key && styles.tabTextActive]}>{x.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  languagePicker: { position: 'relative', zIndex: 10 },
  languageButton: {
    minWidth: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fff',
  },
  languageButtonText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  languageChevron: { color: colors.primary, fontSize: 10, marginLeft: 8 },
  languageMenu: {
    position: 'absolute', top: 42, right: 0, width: 170, paddingVertical: 4,
    borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  languageOption: {
    minHeight: 42, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  languageOptionActive: { backgroundColor: '#eef2ff' },
  languageOptionText: { color: colors.text, fontSize: 14 },
  languageOptionTextActive: { color: colors.primary, fontWeight: '700' },
  languageCheck: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  body: { flex: 1, backgroundColor: '#fff' },
  mapBox: { flex: 1, minHeight: 200 },
  sheet: { padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' },
  statusRow: { gap: 2 },
  status: { fontSize: 13, color: '#374151' },
  coords: { fontSize: 12, color: colors.muted },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderTopWidth: 3, borderTopColor: 'transparent' },
  tabActive: { borderTopColor: colors.primary },
  tabText: { fontSize: 14, color: colors.muted },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  overlapChoice: {
    position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2, padding: 12,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff',
    gap: 8, elevation: 4,
  },
  overlapTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  overlapOption: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: 12,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
  },
  overlapOptionText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
