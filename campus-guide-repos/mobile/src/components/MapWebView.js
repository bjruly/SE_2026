import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml } from '../map/buildHtml';

// Bản đồ Leaflet + CartoDB nhúng trong WebView (Mobile) hoặc iframe (khi mở trên Web)
export default function MapWebView({ pois, lang, position, selectedId, insideIds, onSelect, onMapClick }) {
  const webRef = useRef(null);
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);
  const html = useMemo(() => buildMapHtml(), []);

  // Cập nhật trạng thái bản đồ khi có thay đổi
  useEffect(() => {
    if (!ready) return;
    const state = { pois, lang, position, selectedId, insideIds: Array.from(insideIds) };

    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ __update: state }, '*');
      }
    } else if (webRef.current) {
      webRef.current.injectJavaScript(`window.__update(${JSON.stringify(state)}); true;`);
    }
  }, [ready, pois, lang, position, selectedId, insideIds]);

  // Lắng nghe sự kiện từ iframe trên trình duyệt Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event) => {
      let msg;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'ready') setReady(true);
      else if (msg.type === 'select') onSelect(msg.id);
      else if (msg.type === 'mapClick' && onMapClick) onMapClick({ lat: msg.lat, lng: msg.lng });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSelect, onMapClick]);

  const onMessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'ready') setReady(true);
    else if (msg.type === 'select') onSelect(msg.id);
    else if (msg.type === 'mapClick' && onMapClick) onMapClick({ lat: msg.lat, lng: msg.lng });
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.fill}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          onLoad={() => setReady(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost/' }}
        javaScriptEnabled
        onMessage={onMessage}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
