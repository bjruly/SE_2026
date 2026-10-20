import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, shared } from '../styles';

// Quét mã QR bằng camera (expo-camera) hoặc nhập mã thủ công
export default function QrScanner({ t, onCode, notFound }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const lastScan = useRef(0);

  const handleScan = ({ data }) => {
    const now = Date.now();
    if (now - lastScan.current < 2000) return; // tránh mở liên tục khi mã còn trong khung hình
    lastScan.current = now;
    onCode(data);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t.qrTitle}</Text>

      {!permission && <View style={styles.camera} />}
      {permission && !permission.granted && (
        <View style={styles.permission}>
          <Text style={shared.meta}>{t.qrNeedPermission}</Text>
          <Pressable style={[shared.btn, shared.btnPrimary]} onPress={requestPermission}>
            <Text style={[shared.btnText, shared.btnPrimaryText]}>{t.qrGrant}</Text>
          </Pressable>
        </View>
      )}
      {permission && permission.granted && (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
        />
      )}

      <Text style={shared.meta}>{t.qrManual}</Text>
      <View style={styles.row}>
        <TextInput
          style={[shared.input, styles.input]}
          value={manual}
          onChangeText={setManual}
          placeholder="DHSG-POI-001"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Pressable style={shared.btn} onPress={() => onCode(manual)}>
          <Text style={shared.btnText}>{t.qrOpen}</Text>
        </Pressable>
      </View>
      {notFound && <Text style={shared.warn}>{t.qrNotFound}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 12, gap: 10 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  camera: { flex: 1, minHeight: 220, borderRadius: 8, overflow: 'hidden', backgroundColor: '#111827' },
  permission: { flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1 },
});
