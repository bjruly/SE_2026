import { MAPLIBRE_CSS, MAPLIBRE_JS } from './maplibreInline';
import { MAP_STYLE } from '../config';

// Trang HTML chứa bản đồ MapLibre GL (dữ liệu vector), hiển thị trong WebView (hoặc iframe khi chạy trên web).
// App gửi trạng thái vào bằng window.__update(state) hoặc postMessage({ __update: state });
// bản đồ gửi sự kiện về bằng postMessage ({ type: 'ready' | 'select' | 'mapClick' | 'mapError' }).
// Nếu style bản đồ không tải được trong 8 giây thì tự chuyển sang ô ảnh OpenStreetMap (chỉ thử một lần).
export function buildMapHtml() {
  const style = MAP_STYLE === 'osm' ? 'OSM' : JSON.stringify(MAP_STYLE);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>${MAPLIBRE_CSS}</style>
<style>html,body,#map{height:100%;margin:0;padding:0}</style>
</head>
<body>
<div id="map"></div>
<script>${MAPLIBRE_JS}</script>
<script>
(function () {
  var OSM = {
    version: 8,
    sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19,
      attribution: '&copy; OpenStreetMap contributors' } },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
  };
  var STYLE = ${style === 'OSM' ? 'OSM' : style};

  function post(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } else if (window.parent) {
      window.parent.postMessage(JSON.stringify(msg), '*');
    }
  }

  // Hình tròn (đa giác) bán kính met quanh một tọa độ, dùng vẽ vùng tự động phát
  function circle(lat, lng, r) {
    var R = 6371008.8, d = r / R, rad = Math.PI / 180, p1 = lat * rad, l1 = lng * rad, ring = [], steps = 48;
    for (var i = 0; i <= steps; i++) {
      var th = 2 * Math.PI * i / steps;
      var p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(th));
      var l2 = l1 + Math.atan2(Math.sin(th) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
      ring.push([l2 / rad, p2 / rad]);
    }
    return { type: 'Polygon', coordinates: [ring] };
  }

  var map;
  try {
    map = new maplibregl.Map({ container: 'map', style: STYLE, center: [106.682, 10.76], zoom: 16 });
  } catch (err) {
    post({ type: 'mapError' });
    return;
  }
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  if (window.__TM_EXPOSE) window.__TM_MAP = map; // chỉ dùng khi kiểm thử tự động

  var pending = null, loaded = false, fellBack = false, fitted = false;

  function addLayers() {
    if (map.getSource('zones')) return;
    var empty = { type: 'FeatureCollection', features: [] };
    map.addSource('zones', { type: 'geojson', data: empty });
    map.addSource('pois', { type: 'geojson', data: empty });
    map.addSource('user', { type: 'geojson', data: empty });
    map.addLayer({ id: 'zones-fill', type: 'fill', source: 'zones',
      paint: { 'fill-color': ['case', ['get', 'inside'], '#16a34a', '#2563eb'], 'fill-opacity': ['case', ['get', 'inside'], 0.3, 0.13] } });
    map.addLayer({ id: 'zones-line', type: 'line', source: 'zones',
      paint: { 'line-color': ['case', ['get', 'inside'], '#16a34a', '#2563eb'], 'line-width': ['case', ['get', 'selected'], 3, 1.5] } });
    map.addLayer({ id: 'poi-points', type: 'circle', source: 'pois',
      paint: { 'circle-radius': 11, 'circle-color': ['case', ['get', 'inside'], '#16a34a', ['get', 'selected'], '#1d4ed8', '#2563eb'],
        'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
    map.addLayer({ id: 'user-point', type: 'circle', source: 'user',
      paint: { 'circle-radius': 10, 'circle-color': '#dc2626', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 } });
  }

  function apply() {
    if (!pending || !map.getSource('zones')) return;
    var s = pending;
    var inside = {};
    s.insideIds.forEach(function (id) { inside[id] = true; });
    map.getSource('zones').setData({ type: 'FeatureCollection', features: s.pois.map(function (p) {
      return { type: 'Feature', geometry: circle(p.latitude, p.longitude, p.radiusMeters), properties: { inside: !!inside[p.id], selected: p.id === s.selectedId } };
    }) });
    map.getSource('pois').setData({ type: 'FeatureCollection', features: s.pois.map(function (p) {
      return { type: 'Feature', geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
        properties: { id: p.id, name: p.name[s.lang], inside: !!inside[p.id], selected: p.id === s.selectedId } };
    }) });
    map.getSource('user').setData({ type: 'FeatureCollection', features: s.position
      ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [s.position.lng, s.position.lat] }, properties: {} }] : [] });
    if (!fitted && s.pois.length) {
      var b = new maplibregl.LngLatBounds();
      s.pois.forEach(function (p) { b.extend([p.longitude, p.latitude]); });
      map.fitBounds(b, { padding: 60, maxZoom: 18, duration: 0 });
      fitted = true;
    }
  }

  function fallback() {
    if (fellBack || loaded) return;
    fellBack = true;
    map.setStyle(OSM);
  }
  var timer = setTimeout(fallback, 8000);

  map.on('style.load', function () { loaded = true; clearTimeout(timer); addLayers(); apply(); });
  map.on('error', function () { if (!loaded) fallback(); });

  map.on('click', 'poi-points', function (e) {
    var f = e.features && e.features[0];
    if (f) post({ type: 'select', id: f.properties.id });
  });
  map.on('click', function (e) {
    var hit = map.getLayer('poi-points') ? map.queryRenderedFeatures(e.point, { layers: ['poi-points'] }) : [];
    if (!hit.length) post({ type: 'mapClick', lat: e.lngLat.lat, lng: e.lngLat.lng });
  });

  window.__update = function (s) { pending = s; apply(); };
  window.addEventListener('message', function (e) {
    if (e.data && e.data.__update) window.__update(e.data.__update);
  });

  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
