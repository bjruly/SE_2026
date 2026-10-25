// Tạo src/map/maplibreInline.js từ thư viện maplibre-gl (đã cài ở thư mục web) để bản đồ trong app
// không phải tải thư viện từ mạng. Chỉ cần chạy lại khi muốn đổi phiên bản MapLibre.
// Cách chạy (từ thư mục mobile, sau khi đã chạy npm install trong thư mục web):  node scripts/build-maplibre-inline.js
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', '..', 'web', 'node_modules', 'maplibre-gl', 'dist');
const js = fs.readFileSync(path.join(dist, 'maplibre-gl.js'), 'utf8');
const css = fs.readFileSync(path.join(dist, 'maplibre-gl.css'), 'utf8');
const out =
  '// FILE ĐƯỢC SINH TỰ ĐỘNG bởi scripts/build-maplibre-inline.js — đừng sửa tay.\n' +
  `export const MAPLIBRE_JS = ${JSON.stringify(js)};\n` +
  `export const MAPLIBRE_CSS = ${JSON.stringify(css)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'map', 'maplibreInline.js'), out);
console.log('Đã tạo src/map/maplibreInline.js');
