const POI_ICONS = {
  'poi-001': '🎓',
  'poi-002': '🌿',
  'poi-003': '🏛️',
  'poi-004': '⚽',
  'poi-005': '📚',
};

export function getPoiIcon(poiId) {
  return POI_ICONS[poiId] || '📍';
}
