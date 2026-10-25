'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const APP_URL = 'https://se-2026-psi.vercel.app/';

export default function AppQrBubble({ t }) {
  const [open, setOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setQrCode('');
    setError(false);
    QRCode.toDataURL(APP_URL, { errorCorrectionLevel: 'M', margin: 2, width: 220 })
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      })
      .catch((generationError) => {
        console.error('Could not generate the app QR code.', generationError);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [open]);

  return (
    <div className="map-qr">
      <button
        type="button"
        className="map-qr-bubble"
        aria-label={t.mapQrOpen}
        aria-expanded={open}
        aria-controls="map-app-qr"
        onClick={() => setOpen((value) => !value)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14h3v3h-3zM19 14h2v2h-2zM19 19h2v2h-2zM14 19h2v2h-2z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <section id="map-app-qr" className="map-qr-card" aria-label={t.mapQrTitle}>
          <button
            type="button"
            className="map-qr-close"
            aria-label={t.mapQrClose}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <h2>{t.mapQrTitle}</h2>
          {error ? (
            <p className="map-qr-message" role="alert">{t.mapQrError}</p>
          ) : qrCode ? (
            <img className="map-qr-image" src={qrCode} alt={t.mapQrTitle} />
          ) : (
            <p className="map-qr-message" aria-live="polite">{t.mapQrLoading}</p>
          )}
          <p className="map-qr-url">{APP_URL}</p>
        </section>
      )}
    </div>
  );
}
