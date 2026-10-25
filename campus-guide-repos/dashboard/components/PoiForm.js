'use client';
import { useState } from 'react';

const LANGS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

const EMPTY = {
  latitude: '',
  longitude: '',
  radiusMeters: '25',
  active: true,
  translations: {
    vi: { name: '', description: '', audioUrl: '' },
    en: { name: '', description: '', audioUrl: '' },
    zh: { name: '', description: '', audioUrl: '' },
  },
};

// Chuyển địa điểm từ API sang giá trị của form
export function poiToForm(poi) {
  if (!poi) return EMPTY;
  const translations = {};
  for (const { code } of LANGS) {
    translations[code] = {
      name: poi.name[code] || '',
      description: poi.description[code] || '',
      audioUrl: poi.audioUrl[code] || '',
    };
  }
  return {
    latitude: String(poi.latitude),
    longitude: String(poi.longitude),
    radiusMeters: String(poi.radiusMeters),
    active: poi.active,
    translations,
  };
}

// Chuyển giá trị form thành nội dung gửi lên API
function formToBody(f) {
  const translations = {};
  for (const { code } of LANGS) {
    const t = f.translations[code];
    translations[code] = { name: t.name, description: t.description, audioUrl: t.audioUrl.trim() === '' ? null : t.audioUrl };
  }
  return {
    latitude: Number(f.latitude),
    longitude: Number(f.longitude),
    radiusMeters: Number(f.radiusMeters),
    active: f.active,
    translations,
  };
}

export default function PoiForm({ initial, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => poiToForm(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setTr = (lang, k, v) =>
    setForm((f) => ({ ...f, translations: { ...f.translations, [lang]: { ...f.translations[lang], [k]: v } } }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setDetails([]);
    if ([form.latitude, form.longitude, form.radiusMeters].some((v) => v === '' || Number.isNaN(Number(v)))) {
      setError('Vĩ độ, kinh độ và bán kính phải là số.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit(formToBody(form));
    } catch (err) {
      setError(err.message);
      setDetails(err.details || []);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="grid3">
        <label>Vĩ độ (latitude)
          <input inputMode="decimal" value={form.latitude} onChange={(e) => setField('latitude', e.target.value)} placeholder="10.7600" required />
        </label>
        <label>Kinh độ (longitude)
          <input inputMode="decimal" value={form.longitude} onChange={(e) => setField('longitude', e.target.value)} placeholder="106.6820" required />
        </label>
        <label>Bán kính vùng (mét)
          <input inputMode="numeric" value={form.radiusMeters} onChange={(e) => setField('radiusMeters', e.target.value)} required />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} />
        Đang hoạt động (hiện trong web và app)
      </label>

      {LANGS.map(({ code, label }) => (
        <fieldset key={code}>
          <legend>{label}</legend>
          <label>Tên
            <input value={form.translations[code].name} onChange={(e) => setTr(code, 'name', e.target.value)} required />
          </label>
          <label>Nội dung thuyết minh
            <textarea rows={4} value={form.translations[code].description} onChange={(e) => setTr(code, 'description', e.target.value)} required />
          </label>
          <label>Đường dẫn audio (tùy chọn, hiện app chưa dùng)
            <input value={form.translations[code].audioUrl} onChange={(e) => setTr(code, 'audioUrl', e.target.value)} placeholder="https://..." />
          </label>
        </fieldset>
      ))}

      {error && <p className="error">{error}</p>}
      {details.length > 0 && (
        <ul className="error">
          {details.map((d, i) => <li key={i}>{d.path}: {d.message}</li>)}
        </ul>
      )}
      <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Đang lưu…' : submitLabel}</button>
    </form>
  );
}
