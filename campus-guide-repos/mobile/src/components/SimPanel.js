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
      <Text style={styles.title}>{t.simTitle}</Text>
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
  wrap: { gap: 6 },
  title: { fontSize: 13, fontWeight: '600', color: colors.text },
  chips: { gap: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: '#fff' },
});
