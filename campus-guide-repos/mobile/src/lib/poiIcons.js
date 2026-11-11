const POI_ICONS = {
  'poi-001': '🎓',
  'poi-002': '🌿',
  'poi-003': '🏛️',
};

export function getPoiIcon(poiId) {
  return POI_ICONS[poiId] || '📍';
}
