'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api, WEB_URL } from '@/lib/api';

// Mỗi địa điểm có 2 kiểu mã QR:
//  - "Mã": chứa đúng chuỗi mã QR (ví dụ DHSG-POI-001), dùng cho chức năng "Quét QR" trong web/app.
//  - "Liên kết": chứa đường dẫn tới web (…/?qr=DHSG-POI-001), quét bằng camera điện thoại là mở thẳng địa điểm.
function QrCard({ poi }) {
  const [codeImg, setCodeImg] = useState('');
  const [linkImg, setLinkImg] = useState('');
  const link = WEB_URL ? `${WEB_URL}/?qr=${encodeURIComponent(poi.qrCode)}` : '';

  useEffect(() => {
    const opts = { width: 512, margin: 2, errorCorrectionLevel: 'M' };
    QRCode.toDataURL(poi.qrCode, opts).then(setCodeImg).catch(() => {});
    if (link) QRCode.toDataURL(link, opts).then(setLinkImg).catch(() => {});
  }, [poi.qrCode, link]);

  const download = (dataUrl, name) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  return (
    <div className="card qr-card">
      <h3>{poi.name.vi}</h3>
      <p className="muted small">{poi.id} · <code>{poi.qrCode}</code></p>
      <div className="qr-pair">
        <div>
          {codeImg ? <img src={codeImg} alt={`QR mã ${poi.qrCode}`} /> : <div className="qr-ph" />}
          <button type="button" className="btn small" disabled={!codeImg} onClick={() => download(codeImg, `${poi.qrCode}.png`)}>Tải QR (mã)</button>
        </div>
        {link && (
          <div>
            {linkImg ? <img src={linkImg} alt={`QR liên kết ${poi.qrCode}`} /> : <div className="qr-ph" />}
            <button type="button" className="btn small" disabled={!linkImg} onClick={() => download(linkImg, `${poi.qrCode}-lien-ket.png`)}>Tải QR (liên kết)</button>
          </div>
        )}
      </div>
      {link && <p className="muted small break">{link}</p>}
    </div>
  );
}

export default function QrPage() {
  const [pois, setPois] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/pois').then(setPois).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <h1>Mã QR</h1>
      <p className="muted small">
        QR dạng <b>mã</b> dùng cho chức năng “Quét QR” trong web và app.
        {WEB_URL ? <> QR dạng <b>liên kết</b> mở thẳng web ({WEB_URL}) khi quét bằng camera điện thoại.</> : <> Chưa đặt NEXT_PUBLIC_WEB_URL nên chưa tạo được QR dạng liên kết.</>}
      </p>
      {error && <p className="error">{error}</p>}
      {!pois && !error && <p className="muted">Đang tải…</p>}
      <div className="qr-grid">
        {pois && pois.map((p) => <QrCard key={p.id} poi={p} />)}
      </div>
    </>
  );
}
