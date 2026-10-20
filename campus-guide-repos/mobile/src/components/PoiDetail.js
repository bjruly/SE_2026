import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shared } from '../styles';

export default function PoiDetail({ poi, lang, t, narration, onBack }) {
  const mine = narration.currentId === poi.id;
  const playing = mine && narration.status === 'playing';
  const paused = mine && narration.status === 'paused';

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Pressable onPress={onBack}>
        <Text style={styles.link}>{t.back}</Text>
      </Pressable>
      <Text style={styles.title}>{poi.name[lang]}</Text>
      <Text style={styles.desc}>{poi.description[lang]}</Text>
      <Text style={shared.meta}>
        {t.radius}: {poi.radiusMeters} {t.meters} · {t.qrCodeLabel}: {poi.qrCode}
      </Text>
      {narration.voiceWarning && <Text style={shared.warn}>{t.ttsNoVoice}</Text>}

      <View style={styles.controls}>
        {!playing && !paused && (
          <Pressable style={[shared.btn, shared.btnPrimary]} onPress={() => narration.speak(poi, lang)}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 14, gap: 8 },
  link: { color: colors.primary, fontSize: 15 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  desc: { fontSize: 16, lineHeight: 23, color: colors.text },
  controls: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
});
