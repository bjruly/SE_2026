'use client';

export default function PoiDetail({ poi, lang, t, narration, onBack }) {
  const mine = narration.currentId === poi.id;
  const playing = mine && narration.status === 'playing';
  const paused = mine && narration.status === 'paused';

  return (
    <div className="detail">
      <button type="button" className="link" onClick={onBack}>{t.back}</button>
      <h2>{poi.name[lang]}</h2>
      <p className="desc">{poi.description[lang]}</p>
      <p className="meta">
        {t.radius}: {poi.radiusMeters} {t.meters} · {t.qrCodeLabel}: <code>{poi.qrCode}</code>
      </p>

      {!narration.supported && <p className="warn">{t.ttsUnsupported}</p>}
      {narration.voiceWarning && <p className="warn">{t.ttsNoVoice}</p>}

      <div className="controls">
        {!playing && !paused && (
          <button type="button" className="btn primary" disabled={!narration.supported} onClick={() => narration.speak(poi, lang)}>
            ▶ {t.play}
          </button>
        )}
        {playing && (
          <button type="button" className="btn" onClick={narration.pause}>⏸ {t.pause}</button>
        )}
        {paused && (
          <button type="button" className="btn primary" onClick={narration.resume}>▶ {t.resume}</button>
        )}
        {(playing || paused) && (
          <button type="button" className="btn" onClick={narration.stop}>⏹ {t.stop}</button>
        )}
      </div>
      {mine && <p className="meta">{t.nowPlaying}…</p>}
    </div>
  );
}
