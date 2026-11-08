import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { distanceMeters } from '../lib/geofence';
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
          <Pressable key={poi.id} onPress={() => onSelect(poi.id)} style={[styles.item, inside && styles.inside]}>
            <Text style={styles.name}>{poi.name[lang]}</Text>
            <Text style={shared.meta}>
              {d === null ? t.noPosition : `${t.distance}: ${d} ${t.meters}`}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 8 },
  item: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', gap: 2 },
  inside: { borderColor: colors.green, backgroundColor: '#f0fdf4' },
  name: { fontWeight: '600', fontSize: 16, color: colors.text },
});
