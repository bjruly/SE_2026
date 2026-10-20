import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml } from '../map/buildHtml';

// Bản đồ Leaflet + OpenStreetMap nhúng trong WebView (cùng cách làm với bản web)
export default function MapWebView({ pois, lang, position, selectedId, insideIds, onSelect, onMapClick }) {
  const webRef = useRef(null);
  const [ready, setReady] = useState(false);
  const html = useMemo(() => buildMapHtml(), []);

  useEffect(() => {
    if (!ready || !webRef.current) return;
    const state = { pois, lang, position, selectedId, insideIds: Array.from(insideIds) };
    webRef.current.injectJavaScript(`window.__update(${JSON.stringify(state)}); true;`);
  }, [ready, pois, lang, position, selectedId, insideIds]);

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
