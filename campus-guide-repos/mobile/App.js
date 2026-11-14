import { useEffect, useRef, useState } from 'react';
import { AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
<<<<<<< HEAD
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
=======
        <View style={styles.brand}>
          <Image source={require('./assets/logo-sgu.png')} style={styles.brandMark} />
          <View style={styles.brandCopy}>
            <Text style={styles.brandEyebrow} numberOfLines={1}>{t.brandEyebrow}</Text>
            <Text style={styles.title} numberOfLines={1}>{t.appTitle}</Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>{t.brandSubtitle}</Text>
          </View>
        </View>
        <View style={styles.langs} accessibilityLabel={t.language}>
          {LANGS.map((l) => (
            <Pressable key={l.code} onPress={() => setLang(l.code)} style={[styles.lang, lang === l.code && styles.langActive]}>
              <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>{l.short}</Text>
            </Pressable>
          ))}
>>>>>>> main
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
          <View style={styles.mapScreen}>
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
            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheet}>
              <View style={styles.panelHeading}>
                <View style={styles.panelCopy}>
                  <Text style={styles.panelEyebrow}>{t.panelEyebrow}</Text>
                  <Text style={styles.panelTitle}>{t.panelTitle}</Text>
                  <Text style={styles.panelDescription}>{t.panelDescription}</Text>
                </View>
                <Text style={styles.panelMark}>⌖</Text>
              </View>
              <View style={[
                styles.statusCard,
                sim.mode === 'sim' ? styles.statusSim : gps.status === 'ok' ? styles.statusReady : gps.status === 'denied' ? styles.statusWarning : null,
              ]}>
                <View style={styles.statusMain}>
                  <View style={[
                    styles.statusDot,
                    sim.mode === 'sim' ? styles.statusDotSim : gps.status === 'ok' ? styles.statusDotReady : gps.status === 'denied' ? styles.statusDotWarning : null,
                  ]} />
                  <Text style={styles.status} numberOfLines={2}>{statusText}</Text>
                </View>
                <Text style={styles.dataSource}>{{
                  api: t.dataApi,
                  loading: t.dataLoading,
                  fallback: t.dataFallback,
                  local: t.dataLocal,
                }[source]}</Text>
                {position && (
                  <Text style={styles.coords}>{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</Text>
                )}
              </View>

              <View style={[styles.autoCard, auto && styles.autoCardOn]}>
                <View style={styles.autoCopy}>
                  <View style={[styles.autoIcon, auto && styles.autoIconOn]}>
                    <Text style={[styles.autoIconText, auto && styles.autoIconTextOn]}>♫</Text>
                  </View>
                  <View style={styles.autoText}>
                    <Text style={styles.autoLabel}>{t.autoFeature}</Text>
                    <Text style={styles.autoHint}>{auto ? t.autoEnabledHint : t.autoHint}</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: auto }}
                  accessibilityLabel={auto ? t.autoOn : t.autoOff}
                  style={[styles.autoToggle, auto && styles.autoToggleOn]}
                  onPress={toggleAuto}
                >
                  <Text style={[styles.autoToggleText, auto && styles.autoToggleTextOn]}>{auto ? t.autoOn : t.autoOff}</Text>
                  <View style={[styles.switchTrack, auto && styles.switchTrackOn]}>
                    <View style={[styles.switchKnob, auto && styles.switchKnobOn]} />
                  </View>
                </Pressable>
              </View>

              {selected && (
                <Pressable style={[shared.btn, styles.selectedButton]} onPress={() => setTab('list')}>
                  <Text style={[shared.btnText, styles.selectedButtonText]}>{selected.name[lang]} — {t.openDetail}</Text>
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
              <Text style={styles.sampleNote}>{t.sampleNote}</Text>
            </ScrollView>
          </View>
        )}

        {tab === 'list' && (selected ? (
          <PoiDetail poi={selected} lang={lang} t={t} narration={narration} onBack={() => setSelectedId(null)} onPlay={(poi) => playPoi(poi, 'manual')} />
        ) : (
          <View style={styles.listScreen}>
            <View style={styles.listHeading}>
              <View style={styles.panelCopy}>
                <Text style={styles.panelEyebrow}>{t.panelEyebrow}</Text>
                <Text style={styles.panelTitle}>{t.placesHeading}</Text>
                <Text style={styles.panelDescription}>{t.placesDescription}</Text>
              </View>
              <Text style={styles.countBadge}>{pois.length}</Text>
            </View>
            <PoiList pois={pois} lang={lang} t={t} position={position} insideIds={insideIds} onSelect={selectPoi} />
          </View>
        ))}

        {tab === 'qr' && <QrScanner t={t} onCode={openByQr} notFound={qrNotFound} />}
      </View>

      <View style={styles.tabs}>
        {[
          { key: 'map', label: t.tabMap, icon: '⌖' },
          { key: 'list', label: t.tabList, icon: '▤' },
          { key: 'qr', label: t.tabQr, icon: '▦' },
        ].map((x) => (
          <Pressable key={x.key} onPress={() => setTab(x.key)} style={[styles.tab, tab === x.key && styles.tabActive]}>
            <Text style={[styles.tabIcon, tab === x.key && styles.tabTextActive]}>{x.icon}</Text>
            <Text style={[styles.tabText, tab === x.key && styles.tabTextActive]}>{x.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  fill: { flex: 1 },
<<<<<<< HEAD
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
=======
  header: {
    minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: colors.navy,
>>>>>>> main
  },
  brand: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 48, height: 48, flex: 0, borderRadius: 24, backgroundColor: '#fff',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)',
  },
  brandCopy: { flex: 1, minWidth: 0 },
  brandEyebrow: { marginBottom: 2, color: '#a9e4dc', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700' },
  brandSubtitle: { marginTop: 2, color: 'rgba(255,255,255,0.76)', fontSize: 10 },
  langs: { flexDirection: 'row', gap: 4 },
  lang: {
    minWidth: 32, minHeight: 34, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 5, paddingHorizontal: 6, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.08)',
  },
  langActive: { borderColor: '#d5fbf4', backgroundColor: '#e7f5f2' },
  langText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  langTextActive: { color: colors.primary, fontWeight: '800' },
  body: { flex: 1, backgroundColor: colors.bg },
  mapScreen: { flex: 1 },
  mapBox: { flex: 1.08, minHeight: 190, backgroundColor: '#e5edf3' },
  sheetScroll: { flex: 1.1, backgroundColor: '#f8fafc' },
  sheet: { padding: 14, gap: 12, borderTopWidth: 3, borderTopColor: '#b7d8df' },
  panelHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  panelCopy: { flex: 1, minWidth: 0 },
  panelEyebrow: { marginBottom: 3, color: '#0f766e', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  panelTitle: { color: colors.navy, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  panelDescription: { marginTop: 3, color: colors.muted, fontSize: 12, lineHeight: 17 },
  panelMark: {
    width: 42, height: 42, textAlign: 'center', textAlignVertical: 'center',
    overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: '#cce8e4',
    color: '#0f766e', backgroundColor: '#e7f5f2', fontSize: 28, lineHeight: 40,
  },
  statusCard: {
    padding: 11, gap: 5, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#fff',
  },
  statusReady: { borderColor: '#bbf7d0', backgroundColor: '#f7fef9' },
  statusSim: { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  statusWarning: { borderColor: '#fecaca', backgroundColor: '#fff7f7' },
  statusMain: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#94a3b8' },
  statusDotReady: { backgroundColor: '#16a34a' },
  statusDotSim: { backgroundColor: '#d97706' },
  statusDotWarning: { backgroundColor: '#dc2626' },
  status: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#334155' },
  dataSource: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  coords: { color: colors.muted, fontSize: 10, fontVariant: ['tabular-nums'] },
  autoCard: {
    padding: 12, gap: 10, borderWidth: 1, borderColor: '#dbe5ee', borderRadius: 14,
    backgroundColor: '#f2f7fb',
  },
  autoCardOn: { borderColor: '#a7e2c0', backgroundColor: '#f0fdf4' },
  autoCopy: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  autoIcon: {
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
    borderRadius: 11, backgroundColor: '#e5f3f7',
  },
  autoIconOn: { backgroundColor: '#dcfce7' },
  autoIconText: { color: '#175b77', fontSize: 21, fontWeight: '700' },
  autoIconTextOn: { color: '#15803d' },
  autoText: { flex: 1, gap: 3 },
  autoLabel: { color: '#17324d', fontSize: 14, fontWeight: '700' },
  autoHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  autoToggle: {
    minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#dbe3eb', borderRadius: 10,
    backgroundColor: '#fff',
  },
  autoToggleOn: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  autoToggleText: { flex: 1, fontSize: 11, fontWeight: '700', color: '#475569' },
  autoToggleTextOn: { color: '#15803d' },
  switchTrack: { width: 36, height: 21, justifyContent: 'center', paddingHorizontal: 3, borderRadius: 11, backgroundColor: '#cbd5e1' },
  switchTrackOn: { backgroundColor: '#16a34a' },
  switchKnob: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#fff', elevation: 1 },
  switchKnobOn: { alignSelf: 'flex-end' },
  selectedButton: { borderColor: '#cce8e4', backgroundColor: '#fff' },
  selectedButtonText: { color: colors.primary },
  sampleNote: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  listScreen: { flex: 1, paddingTop: 16, backgroundColor: colors.bg },
  listHeading: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    marginHorizontal: 14, marginBottom: 8,
  },
  countBadge: {
    minWidth: 30, height: 30, overflow: 'hidden', borderRadius: 9, paddingHorizontal: 8,
    color: '#175b77', backgroundColor: '#e5f3f7', textAlign: 'center', textAlignVertical: 'center',
    fontSize: 13, fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row', paddingTop: 4, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#dbe5ee',
  },
  tab: {
    flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 1,
    borderTopWidth: 3, borderTopColor: 'transparent',
  },
  tabActive: { borderTopColor: colors.teal, backgroundColor: '#f4fafb' },
  tabIcon: { color: '#64748b', fontSize: 18, lineHeight: 21, fontWeight: '700' },
  tabText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  overlapChoice: {
    position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2, padding: 14,
    borderRadius: 14, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff',
    gap: 8, elevation: 5,
  },
  overlapTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  overlapOption: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#fff',
  },
  overlapOptionText: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
