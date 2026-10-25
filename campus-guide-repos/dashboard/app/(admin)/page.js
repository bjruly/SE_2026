'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const LANG_LABEL = { vi: 'Tiếng Việt', en: 'English', zh: '中文' };
const SOURCE_LABEL = { auto: 'Tự động (vào vùng)', manual: 'Bấm phát tay' };

function Bar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setError('');
    api(`/api/admin/stats?days=${days}`)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [days]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Đang tải thống kê…</p>;

  const maxDay = Math.max(1, ...data.byDay.map((d) => d.listen + d.qrScan));
  const langs = data.byLang.map((l) => l.lang);
  const cell = (poiId, lang) => data.byPoiLang.find((x) => x.poiId === poiId && x.lang === lang);

  return (
    <>
      <div className="page-head">
        <h1>Thống kê</h1>
        <label className="inline">
          Khoảng thời gian
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
          </select>
        </label>
      </div>
      <p className="muted small">Từ {data.range.from} đến {data.range.to} (giờ UTC). Dữ liệu ẩn danh, không lưu vị trí hay thông tin cá nhân.</p>

      <div className="cards">
        <div className="card stat"><div className="num">{data.totals.listen}</div><div>Lượt nghe</div></div>
        <div className="card stat"><div className="num">{data.totals.qrScan}</div><div>Lượt quét QR</div></div>
      </div>

      <h2>Theo địa điểm</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Địa điểm</th><th>Lượt nghe</th><th>Lượt quét QR</th></tr></thead>
          <tbody>
            {data.byPoi.map((p) => (
              <tr key={p.poiId}><td>{p.name || p.poiId} <span className="muted small">({p.poiId})</span></td><td>{p.listen}</td><td>{p.qrScan}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Theo ngôn ngữ</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ngôn ngữ</th><th>Lượt nghe</th><th>Lượt quét QR</th></tr></thead>
          <tbody>
            {data.byLang.map((l) => (
              <tr key={l.lang}><td>{LANG_LABEL[l.lang] || l.lang}</td><td>{l.listen}</td><td>{l.qrScan}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Theo địa điểm và ngôn ngữ</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Địa điểm</th>{langs.map((l) => <th key={l}>{LANG_LABEL[l] || l} (nghe / quét)</th>)}</tr>
          </thead>
          <tbody>
            {data.byPoi.map((p) => (
              <tr key={p.poiId}>
                <td>{p.name || p.poiId}</td>
                {langs.map((l) => {
                  const c = cell(p.poiId, l);
                  return <td key={l}>{c ? `${c.listen} / ${c.qrScan}` : '0 / 0'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Cách phát (lượt nghe)</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Cách phát</th><th>Số lượt</th></tr></thead>
          <tbody>
            {data.bySource.length === 0 && <tr><td colSpan={2} className="muted">Chưa có dữ liệu</td></tr>}
            {data.bySource.map((s) => (
              <tr key={s.source}><td>{SOURCE_LABEL[s.source] || s.source}</td><td>{s.count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Theo ngày</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ngày</th><th>Nghe</th><th>Quét QR</th><th className="grow">Biểu đồ</th></tr></thead>
          <tbody>
            {data.byDay.map((d) => (
              <tr key={d.day}>
                <td>{d.day}</td><td>{d.listen}</td><td>{d.qrScan}</td>
                <td><Bar value={d.listen + d.qrScan} max={maxDay} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
