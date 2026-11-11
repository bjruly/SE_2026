import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { distanceMeters } from '../lib/geofence';
import { getPoiIcon } from '../lib/poiIcons';
import { colors, shared } from '../styles';

export default function PoiList({ pois, lang, t, position, insideIds, onSelect }) {
  return (
    <ScrollView contentContainerStyle={styles.list}>
      {pois.map((poi) => {
        const d = position
          ? Math.round(distanceMeters(position, { lat: poi.latitude, lng: poi.longitude }))
          : null;
        const inside = insideIds.has(poi.id);
        return (
          <Pressable
            key={poi.id}
            accessibilityRole="button"
            onPress={() => onSelect(poi.id)}
            style={({ pressed }) => [styles.card, inside && styles.inside, pressed && styles.pressed]}
          >
            <View style={[styles.icon, inside && styles.iconInside]}>
              <Text style={styles.iconText}>{getPoiIcon(poi.id)}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={2}>{poi.name[lang]}</Text>
              <Text style={styles.meta}>
                {d === null ? t.noPosition : `${t.distance}: ${d} ${t.meters}`}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 14, paddingBottom: 18, gap: 9 },
  card: {
    minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  pressed: { borderColor: '#9cc8d3', backgroundColor: '#f8fbfc' },
  inside: { borderColor: '#93c5fd', backgroundColor: '#eff6ff' },
  icon: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: '#e5f3f7',
  },
  iconInside: { backgroundColor: '#dbeafe' },
  iconText: { color: '#175b77', fontSize: 21 },
  copy: { flex: 1, gap: 3 },
  name: { fontWeight: '700', fontSize: 14, lineHeight: 19, color: colors.navy },
  meta: { fontSize: 11, color: colors.muted },
  arrow: { marginLeft: 2, color: '#94a3b8', fontSize: 24, fontWeight: '400' },
});
