'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const LANG_LABEL = { vi: 'Tiếng Việt', en: 'English', zh: '中文' };
const SOURCE_LABEL = { auto: 'Tự động (vào vùng)', manual: 'Bấm phát tay' };

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function Bar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPage() {
  const [to, setTo] = useState(() => formatDate(new Date()));
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29);
    return formatDate(date);
  });
  const [appliedRange, setAppliedRange] = useState(() => {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 29);
    return { from: formatDate(start), to: formatDate(end) };
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [online, setOnline] = useState(null);
  const [onlineError, setOnlineError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    const query = new URLSearchParams(appliedRange);
    api(`/api/admin/stats?${query}`)
      .then((d) => {
        if (alive) {
          setData(d);
          setError('');
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [appliedRange]);

  const applyRange = (event) => {
    event.preventDefault();
    setRangeError('');
    if (!from || !to) {
      setRangeError('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
      return;
    }
    if (from > to) {
      setRangeError('Ngày bắt đầu phải trước hoặc trùng ngày kết thúc.');
      return;
    }
    const rangeDays = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000 + 1;
    if (rangeDays > 365) {
      setRangeError('Khoảng thời gian tối đa là 365 ngày.');
      return;
    }
    setAppliedRange({ from, to });
  };

  useEffect(() => {
    let alive = true;
    const loadOnline = () => {
      api('/api/admin/online')
        .then((result) => {
          if (!alive) return;
          setOnline(result);
          setOnlineError('');
        })
        .catch((e) => {
          if (alive) setOnlineError(e.message);
        });
    };
    loadOnline();
    const timer = window.setInterval(loadOnline, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const maxDay = Math.max(1, ...(data?.byDay || []).map((d) => d.listen + d.qrScan));
  const langs = data?.byLang.map((l) => l.lang) || [];
  const cell = (poiId, lang) => data?.byPoiLang.find((x) => x.poiId === poiId && x.lang === lang);

  return (
    <>
      <div className="page-head">
        <h1>Thống kê</h1>
        <form className="date-range-form" onSubmit={applyRange}>
          <label>
            Từ ngày
            <input type="date" value={from} max={to || formatDate(new Date())} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            Đến ngày
            <input type="date" value={to} max={formatDate(new Date())} min={from} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>Xem thống kê</button>
        </form>
      </div>
      {rangeError && <p className="error">{rangeError}</p>}
      {error && <p className="error">{error}</p>}
      {loading && (
        <div className="stats-loading" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Đang tải thống kê cho khoảng {appliedRange.from} đến {appliedRange.to}…</span>
        </div>
      )}
      {!loading && data && <p className="muted small">Từ {data.range.from} đến {data.range.to} (giờ UTC). Dữ liệu ẩn danh, không lưu vị trí hay thông tin cá nhân.</p>}

      {!loading && data && <>
      <div className="cards">
        <div className="card stat">
          <div className="num">{online ? online.total * 10 : '—'}</div>
          <div>Đang online</div>
          {online && <div className="muted small">Web: {online.byClient.web} · App: {online.byClient.mobile}</div>}
          {onlineError && <div className="error small">{onlineError}</div>}
          <div className="muted small">Phiên hoạt động trong 2 phút gần nhất · tự cập nhật mỗi 30 giây</div>
        </div>
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
      </>}
    </>
  );
}
