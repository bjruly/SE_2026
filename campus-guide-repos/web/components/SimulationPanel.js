'use client';

// Giả lập vị trí để thử tính năng tự động phát mà không cần đi bộ thật
export default function SimulationPanel({ pois, lang, t, mode, activeKey, onUseGps, onSimulate }) {
  const value = mode === 'gps' ? 'gps' : activeKey;

  const onChange = (e) => {
    const v = e.target.value;
    if (v === 'gps') return onUseGps();
    if (v === 'far') {
      const lat = pois.reduce((s, p) => s + p.latitude, 0) / pois.length + 0.002;
      const lng = pois.reduce((s, p) => s + p.longitude, 0) / pois.length;
      return onSimulate({ lat, lng }, 'far');
    }
    const poi = pois.find((p) => p.id === v);
    if (poi) onSimulate({ lat: poi.latitude, lng: poi.longitude }, poi.id);
    return undefined;
  };

  return (
    <div className="sim">
      <h3>{t.simTitle}</h3>
      <select value={value} onChange={onChange} aria-label={t.simTitle}>
        <option value="gps">{t.simUseGps}</option>
        <option value="far">{t.simFar}</option>
        {pois.map((p) => (
          <option key={p.id} value={p.id}>{`${t.simAt} ${p.name[lang]}`}</option>
        ))}
        {value === 'custom' && <option value="custom">…</option>}
      </select>
      {mode === 'sim' && <p className="meta">{t.simTapMap}</p>}
    </div>
  );
}
