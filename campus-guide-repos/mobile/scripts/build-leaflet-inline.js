// Tạo src/map/leafletInline.js từ thư viện leaflet (đã cài ở thư mục web) để bản đồ trong app
// không phải tải Leaflet từ mạng. Chỉ cần chạy lại khi muốn đổi phiên bản Leaflet.
// Cách chạy (từ thư mục mobile):  node scripts/build-leaflet-inline.js
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', '..', 'web', 'node_modules', 'leaflet', 'dist');
const js = fs.readFileSync(path.join(dist, 'leaflet.js'), 'utf8');
const css = fs.readFileSync(path.join(dist, 'leaflet.css'), 'utf8');
const out =
  '// FILE ĐƯỢC SINH TỰ ĐỘNG bởi scripts/build-leaflet-inline.js — đừng sửa tay.\n' +
  `export const LEAFLET_JS = ${JSON.stringify(js)};\n` +
  `export const LEAFLET_CSS = ${JSON.stringify(css)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'map', 'leafletInline.js'), out);
console.log('Đã tạo src/map/leafletInline.js');
