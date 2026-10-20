'use client';
import { useEffect, useRef, useState } from 'react';

// Quét mã QR bằng camera (thư viện html5-qrcode) hoặc nhập mã thủ công.
// Camera trên web chỉ hoạt động trên HTTPS hoặc localhost.
export default function QrScanner({ t, onCode, notFound }) {
  const scannerRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [manual, setManual] = useState('');

  const stop = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {
        /* đã dừng */
      }
    }
    setRunning(false);
  };

  const start = async () => {
    setCameraError(false);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (text) => {
          stop();
          onCode(text);
        },
        () => {},
      );
      setRunning(true);
    } catch {
      scannerRef.current = null;
      setCameraError(true);
      setRunning(false);
    }
  };

  useEffect(() => () => { stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="qr">
      <h3>{t.qrTitle}</h3>
      <div id="qr-reader" className="qr-reader" />
      {!running ? (
        <button type="button" className="btn primary" onClick={start}>{t.qrStart}</button>
      ) : (
        <button type="button" className="btn" onClick={stop}>{t.qrStop}</button>
      )}
      {cameraError && <p className="warn">{t.qrCameraError}</p>}

      <label className="manual">
        {t.qrManual}
        <span className="row">
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="DHSG-POI-001" />
          <button type="button" className="btn" onClick={() => onCode(manual)}>{t.qrOpen}</button>
        </span>
      </label>
      {notFound && <p className="warn">{t.qrNotFound}</p>}
    </div>
  );
}
