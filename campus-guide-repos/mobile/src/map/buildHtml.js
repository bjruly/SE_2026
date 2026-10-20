import { LEAFLET_CSS, LEAFLET_JS } from './leafletInline';
import { TILE_ATTRIBUTION, TILE_URL } from '../config';

// Trang HTML chứa bản đồ Leaflet, hiển thị trong WebView.
// App gửi trạng thái vào bằng window.__update(state); bản đồ gửi sự kiện về bằng postMessage.
export function buildMapHtml() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
(function () {
  var map = L.map('map');
  L.tileLayer(${JSON.stringify(TILE_URL)}, { maxZoom: 19, attribution: ${JSON.stringify(TILE_ATTRIBUTION)} }).addTo(map);
  var group = L.layerGroup().addTo(map);
  var userMarker = null;
  var fitted = false;
  function post(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }

  map.on('click', function (e) { post({ type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng }); });

  window.__update = function (s) {
    group.clearLayers();
    s.pois.forEach(function (poi) {
      var inside = s.insideIds.indexOf(poi.id) >= 0;
      var selected = poi.id === s.selectedId;
      var color = inside ? '#16a34a' : selected ? '#1d4ed8' : '#2563eb';
      L.circle([poi.latitude, poi.longitude], {
        radius: poi.radiusMeters, color: color, weight: selected ? 3 : 1.5,
        fillOpacity: inside ? 0.3 : 0.12, interactive: false
      }).addTo(group);
      L.circleMarker([poi.latitude, poi.longitude], {
        radius: 10, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1
      }).bindTooltip(poi.name[s.lang]).on('click', function (e) {
        L.DomEvent.stopPropagation(e);
        post({ type: 'select', id: poi.id });
      }).addTo(group);
    });
    if (!fitted && s.pois.length) {
      map.fitBounds(L.latLngBounds(s.pois.map(function (p) { return [p.latitude, p.longitude]; })).pad(0.6));
      fitted = true;
    }
    if (s.position) {
      var ll = [s.position.lat, s.position.lng];
      if (!userMarker) {
        userMarker = L.circleMarker(ll, { radius: 10, color: '#fff', weight: 3, fillColor: '#dc2626', fillOpacity: 1, interactive: false }).addTo(map);
      } else { userMarker.setLatLng(ll); }
    } else if (userMarker) { userMarker.remove(); userMarker = null; }
  };

  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
