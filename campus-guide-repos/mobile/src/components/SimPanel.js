import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shared } from '../styles';

// Giả lập vị trí để thử tính năng tự động phát mà không cần đi bộ thật
export default function SimPanel({ pois, lang, t, mode, activeKey, onUseGps, onSimulate }) {
  const current = mode === 'gps' ? 'gps' : activeKey;

  const chooseFar = () => {
    const lat = pois.reduce((s, p) => s + p.latitude, 0) / pois.length + 0.002;
    const lng = pois.reduce((s, p) => s + p.longitude, 0) / pois.length;
    onSimulate({ lat, lng }, 'far');
  };

  const chips = [
    { key: 'gps', label: t.simUseGps, onPress: onUseGps },
    { key: 'far', label: t.simFar, onPress: chooseFar },
    ...pois.map((p) => ({
      key: p.id,
      label: `${t.simAt} ${p.name[lang]}`,
      onPress: () => onSimulate({ lat: p.latitude, lng: p.longitude }, p.id),
    })),
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t.simTitle}</Text>
        <Text style={styles.marker}>⌖</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {chips.map((c) => (
          <Pressable key={c.key} onPress={c.onPress} style={[styles.chip, current === c.key && styles.chipActive]}>
            <Text style={[styles.chipText, current === c.key && styles.chipTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {mode === 'sim' && <Text style={shared.meta}>{t.simTapMap}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700', color: colors.navy },
  marker: { color: colors.teal, fontSize: 17, fontWeight: '700' },
  chips: { gap: 7, paddingRight: 4 },
  chip: { minHeight: 34, justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: '#dbe3eb', backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff' },
});
