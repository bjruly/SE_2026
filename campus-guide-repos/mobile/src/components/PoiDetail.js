import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPoiIcon } from '../lib/poiIcons';
import { colors, shared } from '../styles';

export default function PoiDetail({ poi, lang, t, narration, onBack, onPlay }) {
  const mine = narration.currentId === poi.id;
  const playing = mine && narration.status === 'playing';
  const paused = mine && narration.status === 'paused';

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.link}>{t.back}</Text>
      </Pressable>
      <View style={styles.hero}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>{getPoiIcon(poi.id)}</Text>
        </View>
        <Text style={styles.title}>{poi.name[lang]}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.desc}>{poi.description[lang]}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t.radius}</Text>
          <Text style={styles.metaValue}>{poi.radiusMeters} {t.meters}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t.qrCodeLabel}</Text>
          <Text style={styles.metaValue}>{poi.qrCode}</Text>
        </View>
      </View>
      {narration.voiceWarning && <Text style={shared.warn}>{t.ttsNoVoice}</Text>}

      <View style={styles.playCard}>
        <Text style={styles.playHeading}>{playing ? t.nowPlaying : t.play}</Text>
        <View style={styles.controls}>
          {!playing && !paused && (
            <Pressable style={[shared.btn, shared.btnPrimary]} onPress={() => onPlay(poi)}>
              <Text style={[shared.btnText, shared.btnPrimaryText]}>▶ {t.play}</Text>
            </Pressable>
          )}
          {playing && (
            <Pressable style={shared.btn} onPress={narration.pause}>
              <Text style={shared.btnText}>⏸ {t.pause}</Text>
            </Pressable>
          )}
          {paused && (
            <Pressable style={[shared.btn, shared.btnPrimary]} onPress={narration.resume}>
              <Text style={[shared.btnText, shared.btnPrimaryText]}>▶ {t.resume}</Text>
            </Pressable>
          )}
          {(playing || paused) && (
            <Pressable style={shared.btn} onPress={narration.stop}>
              <Text style={shared.btnText}>⏹ {t.stop}</Text>
            </Pressable>
          )}
        </View>
        {mine && <Text style={shared.meta}>{t.nowPlaying}…</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 16, gap: 13, backgroundColor: colors.bg },
  backButton: { alignSelf: 'flex-start', paddingVertical: 5, paddingRight: 8 },
  link: { color: colors.teal, fontSize: 14, fontWeight: '700' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  icon: {
    width: 48, height: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: 15, backgroundColor: '#e5f3f7',
  },
  iconText: { color: '#175b77', fontSize: 25 },
  title: { flex: 1, fontSize: 21, lineHeight: 27, fontWeight: '800', color: colors.navy },
  card: {
    padding: 15, gap: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  desc: { fontSize: 15, lineHeight: 23, color: '#334155' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#eef2f6' },
  metaLabel: { color: colors.muted, fontSize: 12 },
  metaValue: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  playCard: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#dbe5ee', backgroundColor: '#f2f7fb' },
  playHeading: { color: colors.navy, fontSize: 14, fontWeight: '700' },
  controls: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
});
