import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, LocateFixed, MapPin, Navigation, Pause, Play, Radio, Languages, Volume2, VolumeX, CircleHelp, ChevronRight, CheckCircle2, AlertTriangle, Headphones, Compass, Map as MapIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import MapView from './components/MapView.jsx'
import { LANGUAGES, POIS } from './data/pois.js'
import { distanceMeters, formatDistance } from './utils/geo.js'
import { trackAnalyticsEvent } from './analytics.js'
import './qr-code.css'

const copy = {
  vi: { tagline: 'Đi gần — nghe chuyện hay', sub: 'Khám phá hương vị địa phương bằng âm thanh', map: 'Bản đồ', stops: 'Điểm dừng', nearby: 'Gần bạn', choose: 'Chọn điểm để nghe', auto: 'Thuyết minh tự động', autoDesc: 'Tự phát audio khi bạn đi vào vùng địa điểm', enable: 'Bật GPS & bắt đầu', disable: 'Tắt tự động', current: 'Vị trí hiện tại', waiting: 'Chưa bật GPS', listening: 'Đang theo dõi vị trí', permission: 'Trình duyệt cần quyền vị trí', requesting: 'Đang yêu cầu quyền vị trí', paused: 'Đã tạm dừng GPS', selected: 'Đang chọn', start: 'Bắt đầu nghe', directions: 'Chỉ đường', pause: 'Tạm dừng', resume: 'Nghe tiếp', stop: 'Dừng', radius: 'Bán kính kích hoạt', distance: 'Khoảng cách từ bạn', enableGpsDistance: 'Bật GPS để xem khoảng cách', noNearbyStops: 'Không có điểm dừng nào trong bán kính đã chọn.', noVoice: 'Trình duyệt không hỗ trợ đọc văn bản.', speaking: 'Đang thuyết minh', ready: 'Sẵn sàng thuyết minh', footer: 'Thông tin địa điểm có thể thay đổi. Vui lòng kiểm tra trước khi ghé thăm.', locationErr: 'Không lấy được vị trí. Hãy kiểm tra quyền GPS.', autoplay: 'Nếu trình duyệt chặn âm thanh, nhấn “Bắt đầu nghe” một lần.', last: 'Điểm đã kích hoạt gần nhất', noPOI: 'Chưa có điểm nào trong vùng kích hoạt.', resetNotice: 'Đã xóa trạng thái các điểm đã phát.', helpNotice: 'Bật GPS để tự động phát thuyết minh khi bạn đến gần một điểm. Bạn cũng có thể chọn điểm và nhấn Bắt đầu nghe.', qrTitle: 'Mở Q4 Food Stories', qrDescription: 'Dùng Camera điện thoại quét mã QR để mở ứng dụng trong trình duyệt.', qrLink: 'Hoặc mở trực tiếp tại dulichq4.netlify.app', qrInstall: 'Trong Safari, chọn Chia sẻ → Thêm vào Màn hình chính để cài ứng dụng.', mapLive: 'GPS ĐANG BẬT', mapOff: 'GPS CHƯA BẬT', howTitle: 'CÁCH HOẠT ĐỘNG', howDescription: 'Cho phép định vị để nhận hướng dẫn khi đến gần điểm dừng.' },
  en: { tagline: 'Get close — hear the story', sub: 'Explore local flavors through audio', map: 'Map', stops: 'Stops', nearby: 'Near you', choose: 'Choose a stop to listen', auto: 'Auto narration', autoDesc: 'Play audio when you enter a location zone', enable: 'Enable GPS & start', disable: 'Turn off auto', current: 'Current location', waiting: 'GPS is off', listening: 'Tracking location', permission: 'Browser location permission required', requesting: 'Requesting location permission', paused: 'GPS paused', selected: 'Selected', start: 'Start listening', directions: 'Get directions', pause: 'Pause', resume: 'Resume', stop: 'Stop', radius: 'Trigger radius', distance: 'Distance from you', enableGpsDistance: 'Enable GPS to see distances', noNearbyStops: 'No stops are within the selected radius.', noVoice: 'Speech synthesis is not supported by this browser.', speaking: 'Narrating now', ready: 'Ready to narrate', footer: 'Location details may change. Please verify before visiting.', status: 'Status', locationErr: 'Could not get location. Check GPS permission.', autoplay: 'If audio is blocked, press “Start listening” once.', last: 'Last triggered stop', noPOI: 'No stop is inside the trigger zone.', resetNotice: 'Cleared the list of stops already played.', helpNotice: 'Enable GPS to play narration automatically when you approach a stop. You can also select a stop and press Start listening.', qrTitle: 'Open Q4 Food Stories', qrDescription: 'Scan this QR code with your phone camera to open the app in your browser.', qrLink: 'Or open dulichq4.netlify.app directly', qrInstall: 'In Safari, tap Share → Add to Home Screen to install the app.', mapLive: 'GPS ACTIVE', mapOff: 'GPS OFF', howTitle: 'HOW IT WORKS', howDescription: 'Allow location access to receive narration near each stop.' },
  ja: { tagline: '近づくと、物語が聞こえる', sub: '音声でローカルフードを発見', map: '地図', stops: 'スポット', nearby: '近く', choose: '聞きたい場所を選択', auto: '自動音声ガイド', autoDesc: 'スポットの範囲に入ると音声を再生', enable: 'GPSを開始', disable: '自動再生を停止', current: '現在地', waiting: 'GPSオフ', listening: '位置情報を取得中', permission: '位置情報の許可が必要です', requesting: '位置情報の許可を確認中', paused: 'GPS一時停止中', selected: '選択中', start: '再生', directions: 'ルート案内', pause: '一時停止', resume: '再開', stop: '停止', radius: '起動半径', distance: '現在地からの距離', enableGpsDistance: '距離を表示するにはGPSを有効にしてください', noNearbyStops: '選択した範囲内にスポットはありません。', noVoice: 'このブラウザーは音声合成に対応していません。', speaking: '音声ガイド再生中', ready: '音声ガイド準備完了', footer: '場所の情報は変更される場合があります。訪問前にご確認ください。', status: '状態', locationErr: '位置情報を取得できません。GPS権限を確認してください。', autoplay: '音声がブロックされた場合は「再生」を一度押してください。', last: '最後に起動したスポット', noPOI: '起動範囲内にスポットはありません。', resetNotice: '再生済みスポットをリセットしました。', helpNotice: 'GPSを有効にすると、スポットに近づいた際に音声案内が自動再生されます。スポットを選択して再生することもできます。', qrTitle: 'Q4 Food Storiesを開く', qrDescription: 'スマートフォンのカメラでQRコードをスキャンしてアプリを開きます。', qrLink: 'または dulichq4.netlify.app を直接開く', qrInstall: 'Safariで「共有」→「ホーム画面に追加」を選ぶとインストールできます。', mapLive: 'GPS有効', mapOff: 'GPS未起動', howTitle: '使い方', howDescription: '位置情報を許可すると、スポットに近づいた際に音声案内を受け取れます。' },
  ko: { tagline: '가까이 가면 이야기가 들려요', sub: '오디오로 만나는 현지 음식', map: '지도', stops: '장소', nearby: '내 주변', choose: '들을 장소를 선택하세요', auto: '자동 음성 안내', autoDesc: '장소 반경에 들어오면 자동 재생', enable: 'GPS 시작', disable: '자동 안내 끄기', current: '현재 위치', waiting: 'GPS 꺼짐', listening: '위치 추적 중', permission: '위치 권한이 필요합니다', requesting: '위치 권한 요청 중', paused: 'GPS 일시 중지됨', selected: '선택됨', start: '듣기 시작', directions: '길찾기', pause: '일시정지', resume: '계속 듣기', stop: '중지', radius: '실행 반경', distance: '현재 위치와의 거리', enableGpsDistance: '거리를 보려면 GPS를 켜세요', noNearbyStops: '선택한 반경 안에 장소가 없습니다.', noVoice: '이 브라우저는 음성 합성을 지원하지 않습니다.', speaking: '안내 재생 중', ready: '안내 준비 완료', footer: '장소 정보는 변경될 수 있습니다. 방문 전에 확인해 주세요.', status: '상태', locationErr: '위치를 가져오지 못했습니다. GPS 권한을 확인하세요.', autoplay: '소리가 차단되면 “듣기 시작”을 한 번 누르세요.', last: '마지막으로 실행된 장소', noPOI: '실행 반경 안에 장소가 없습니다.', resetNotice: '재생한 장소 목록을 초기화했습니다.', helpNotice: 'GPS를 켜면 장소에 가까워질 때 음성 안내가 자동으로 재생됩니다. 장소를 선택하고 듣기 시작을 눌러 재생할 수도 있습니다.', qrTitle: 'Q4 Food Stories 열기', qrDescription: '휴대전화 카메라로 QR 코드를 스캔해 앱을 여세요.', qrLink: '또는 dulichq4.netlify.app 직접 열기', qrInstall: 'Safari에서 공유 → 홈 화면에 추가를 누르면 앱을 설치할 수 있습니다.', mapLive: 'GPS 사용 중', mapOff: 'GPS 꺼짐', howTitle: '사용 방법', howDescription: '위치 정보를 허용하면 장소에 가까워질 때 음성 안내를 받을 수 있습니다.' }
}

const actionLabels = {
  vi: { reset: 'Đặt lại lượt phát', help: 'Cách sử dụng', gpsError: 'Không thể xác định vị trí' },
  en: { reset: 'Reset played stops', help: 'How to use', gpsError: 'Unable to get location' },
  ja: { reset: '再生済みスポットをリセット', help: '使い方', gpsError: '位置情報を取得できません' },
  ko: { reset: '재생한 장소 초기화', help: '사용 방법', gpsError: '위치를 가져올 수 없습니다' }
}

function App() {
  const [lang, setLang] = useState('vi')
  const [selectedId, setSelectedId] = useState(POIS[0].id)
  const [userLocation, setUserLocation] = useState(null)
  const [gpsState, setGpsState] = useState('off')
  const [gpsError, setGpsError] = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [radius, setRadius] = useState(100)
  const [audioState, setAudioState] = useState('idle')
  const [lastTriggered, setLastTriggered] = useState(null)
  const [notice, setNotice] = useState('')
  const [mapController, setMapController] = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const watchRef = useRef(null)
  const spokenRef = useRef(new Set())
  const audioRef = useRef(null)
  const synthRef = useRef(null)
  const analyticsOpenTrackedRef = useRef(false)
  const analyticsPlaybackIdRef = useRef(0)
  const t = copy[lang]
  const action = actionLabels[lang]
  const selected = POIS.find(p => p.id === selectedId) || POIS[0]
  const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    if (analyticsOpenTrackedRef.current) return
    analyticsOpenTrackedRef.current = true
    trackAnalyticsEvent({ type: 'app_open' })
  }, [])

  const enriched = useMemo(() => POIS.map(poi => ({
    ...poi,
    distance: userLocation ? distanceMeters(userLocation, poi) : null
  })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)), [userLocation])
  const visiblePois = useMemo(
    () => userLocation ? enriched.filter(poi => poi.distance <= radius) : enriched,
    [enriched, radius, userLocation]
  )
  const selectedDistance = userLocation ? distanceMeters(userLocation, selected) : null
  const directionsUrl = useMemo(() => {
    const params = new URLSearchParams({
      api: '1',
      destination: `${selected.lat},${selected.lng}`,
      travelmode: 'walking'
    })
    if (userLocation) params.set('origin', `${userLocation.lat},${userLocation.lng}`)
    return `https://www.google.com/maps/dir/?${params.toString()}`
  }, [selected.lat, selected.lng, userLocation])

  const stopAudio = useCallback(() => {
    analyticsPlaybackIdRef.current += 1
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setAudioState('idle')
  }, [])

  const speakPOI = useCallback((poi, automatic = false) => {
    stopAudio()
    const playbackId = ++analyticsPlaybackIdRef.current
    let playbackTracked = false
    setSelectedId(poi.id)
    setLastTriggered(poi.id)
    const text = poi.description[lang] || poi.description.vi
    const trackPlaybackStart = () => {
      if (analyticsPlaybackIdRef.current !== playbackId || playbackTracked) return
      playbackTracked = true
      trackAnalyticsEvent({ type: 'narration_play', poiId: poi.id, language: lang })
    }
    const trackPlaybackComplete = () => {
      if (analyticsPlaybackIdRef.current === playbackId && playbackTracked) {
        trackAnalyticsEvent({ type: 'narration_complete', poiId: poi.id, language: lang })
      }
    }
    // Nếu sau này thêm file MP3, đặt poi.audioUrl[lang] hoặc poi.audioUrl.vi trong dữ liệu.
    const audioUrl = poi.audioUrl?.[lang] || poi.audioUrl?.vi
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onplay = () => { setAudioState('playing'); trackPlaybackStart() }
      audio.onpause = () => setAudioState('paused')
      audio.onended = () => { setAudioState('idle'); trackPlaybackComplete() }
      audio.onerror = () => { setAudioState('idle'); setNotice('Không tải được tệp âm thanh. Hãy thử phát lại hoặc kiểm tra kết nối mạng.') }
      audio.play().catch(() => { setAudioState('idle'); setNotice(t.autoplay) })
      return
    }
    if (!('speechSynthesis' in window)) {
      setNotice(t.noVoice)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language.speech
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onstart = () => { setAudioState('playing'); trackPlaybackStart() }
    utterance.onend = () => { setAudioState('idle'); trackPlaybackComplete() }
    utterance.onerror = () => { setAudioState('idle'); setNotice(t.autoplay) }
    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setNotice(automatic ? `${t.speaking}: ${poi.name[lang] || poi.name.vi}` : '')
  }, [lang, language.speech, stopAudio, t])

  const handlePosition = useCallback(pos => {
    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
    setUserLocation(loc)
    setGpsState('tracking')
    setGpsError('')
    if (!autoEnabled) return
    const inside = POIS
      .map(poi => ({ poi, distance: distanceMeters(loc, poi) }))
      .filter(x => x.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
    if (inside.length) {
      const next = inside[0].poi
      if (!spokenRef.current.has(next.id)) {
        spokenRef.current.add(next.id)
        speakPOI(next, true)
      }
    }
  }, [autoEnabled, radius, speakPOI])

  useEffect(() => {
    if (!autoEnabled || !userLocation) return
    const inside = POIS.map(poi => ({ poi, distance: distanceMeters(userLocation, poi) }))
      .filter(x => x.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
    if (inside.length) {
      const poi = inside[0].poi
      if (!spokenRef.current.has(poi.id)) {
        spokenRef.current.add(poi.id)
        speakPOI(poi, true)
      }
    }
  }, [autoEnabled, userLocation, radius, speakPOI])

  const enableGPS = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError(t.locationErr)
      setNotice(t.locationErr)
      return
    }
    setAutoEnabled(true)
    setGpsState('requesting')
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    watchRef.current = navigator.geolocation.watchPosition(
      pos => handlePosition(pos),
      err => {
        setGpsState('error')
        setAutoEnabled(false)
        if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
        setGpsError(err.code === 1 ? t.permission : t.locationErr)
        setNotice(err.code === 1 ? t.permission : t.locationErr)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }

  const disableAuto = () => {
    setAutoEnabled(false)
    setGpsState('off')
    setUserLocation(null)
    setGpsError('')
    spokenRef.current.clear()
    if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current)
    watchRef.current = null
    stopAudio()
  }

  const pauseResume = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setAudioState('playing') }
      else { window.speechSynthesis.pause(); setAudioState('paused') }
      return
    }
    if (audioRef.current) {
      if (audioRef.current.paused) audioRef.current.play().then(() => setAudioState('playing')).catch(() => setNotice(t.autoplay))
      else { audioRef.current.pause(); setAudioState('paused') }
    }
  }

  useEffect(() => () => {
    if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    if (audioRef.current) audioRef.current.pause()
  }, [])

  const choosePOI = (poi) => {
    setSelectedId(poi.id)
    mapController?.focus(poi.lat, poi.lng, 17)
  }

  const gpsLabel = gpsState === 'tracking' ? t.listening : gpsState === 'requesting' ? t.requesting : gpsState === 'paused' ? t.paused : gpsState === 'error' ? action.gpsError : t.waiting

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Q4 Food Stories">
          <span className="brand-mark"><AudioLines size={21} /></span>
          <span><b>Q4 Food Stories</b><small>QUẬN 4 · AUDIO WALK</small></span>
        </a>
        <div className="top-actions">
          <label className="language-select"><Languages size={17} /><select value={lang} onChange={e => { stopAudio(); setLang(e.target.value) }} aria-label="Chọn ngôn ngữ">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.short} · {l.label}</option>)}</select></label>
        </div>
      </header>

      <main className="main-layout">
        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> SMART AUDIO GUIDE <span>•</span> DISTRICT 4, HCMC</div>
          <h1>{t.tagline.split('—')[0]}<em>{t.tagline.includes('—') ? t.tagline.split('—')[1] : ''}</em></h1>
          <p>{t.sub}</p>
        </section>

        <section className="control-strip">
          <div className="gps-status">
            <span className={`gps-icon ${gpsState === 'tracking' ? 'on' : ''}`}><LocateFixed size={20} /></span>
            <div><b>{gpsLabel}</b><small>{gpsError || (userLocation ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` : t.autoplay)}</small></div>
          </div>
          <div className="control-buttons">
            {!autoEnabled
              ? <button className="btn-primary" onClick={enableGPS}><Navigation size={17} />{t.enable}</button>
              : <button className="btn-secondary" onClick={disableAuto}><VolumeX size={17} />{t.disable}</button>}
          </div>
        </section>

        <section className="workspace">
          <div className="map-panel">
            <div className="panel-heading">
              <div><span className="section-kicker">EXPLORE THE NEIGHBORHOOD</span><h2><MapIcon size={19} />{t.map}</h2></div>
              <span className="live-chip"><span />{gpsState === 'tracking' ? t.mapLive : t.mapOff}</span>
            </div>
            <MapView pois={visiblePois} selectedId={selectedId} userLocation={userLocation} radius={radius} emptyMessage={t.noNearbyStops} onSelect={id => choosePOI(POIS.find(p => p.id === id))} onMapReady={setMapController} />
            <div className="map-legend"><span><i className="legend-dot" />{t.stops}</span><span><i className="legend-dot blue" />{t.current}</span><span><i className="legend-radius" />{t.radius}</span><span className="map-note">OpenStreetMap</span></div>
          </div>

          <aside className="side-panel">
            <div className="panel-heading side-title">
              <div><span className="section-kicker">{t.nearby.toUpperCase()}</span><h2><Compass size={19} />{t.choose}</h2></div>
              <span className="count-pill">{visiblePois.length} / {POIS.length}</span>
            </div>
            <div className="poi-list">
              {visiblePois.map(poi => (
                <button key={poi.id} className={`poi-row ${selectedId === poi.id ? 'selected' : ''}`} onClick={() => choosePOI(poi)}>
                  <span className="poi-emoji" style={{ '--poi-color': poi.color }}>{poi.icon}</span>
                  <span className="poi-row-main"><b>{poi.name[lang] || poi.name.vi}</b><small>{poi.category[lang] || poi.category.vi}</small><small className="distance">{poi.distance !== null ? `${t.distance}: ${formatDistance(poi.distance)}` : t.enableGpsDistance}</small></span>
                  <ChevronRight size={17} className="poi-chevron" />
                </button>
              ))}
              {userLocation && visiblePois.length === 0 && <p className="empty-stops">{t.noNearbyStops}</p>}
            </div>
            <div className="geofence-box">
              <div className="geofence-title"><Radio size={17} /><b>{t.auto}</b><span className={`state-pill ${autoEnabled ? 'active' : ''}`}>{autoEnabled ? 'ON' : 'OFF'}</span></div>
              <p>{t.autoDesc}</p>
              <label className="radius-label"><span>{t.radius}</span><b>{radius} m</b></label>
              <input type="range" min="60" max="250" step="10" value={radius} onChange={e => setRadius(Number(e.target.value))} />
              <div className="range-ends"><span>60 m</span><span>250 m</span></div>
              <div className="geofence-actions">
                <button onClick={() => { spokenRef.current.clear(); setNotice(t.resetNotice) }}><span>↻</span> {action.reset}</button>
                <button onClick={() => setNotice(t.helpNotice)}><CircleHelp size={14} /> {action.help}</button>
              </div>
            </div>
          </aside>
        </section>

        {(!userLocation || selectedDistance <= radius) && <section className="detail-card">
          <div className="detail-image" style={{ '--detail-color': selected.color }}>
            <div className="image-topline"><span>Q4 · FOOD STORY</span><span className="image-number">{String(POIS.findIndex(p => p.id === selected.id) + 1).padStart(2, '0')} / {String(POIS.length).padStart(2, '0')}</span></div>
            <div className="detail-illustration"><span>{selected.icon}</span><i /><i /><i /></div>
            <div className="image-caption"><small>{selected.category[lang] || selected.category.vi}</small><h2>{selected.name[lang] || selected.name.vi}</h2></div>
          </div>
          <div className="detail-content">
            <div className="detail-meta"><span><MapPin size={15} />{selected.address}</span><span><LocateFixed size={15} />{selectedDistance !== null ? `${t.distance}: ${formatDistance(selectedDistance)}` : t.enableGpsDistance}</span></div>
            <p className="description">{selected.description[lang] || selected.description.vi}</p>
            <a className="btn-outline directions-link" href={directionsUrl} target="_blank" rel="noreferrer">
              <Navigation size={16} />{t.directions}
            </a>
            <div className="audio-player">
              <button className="play-button" onClick={() => audioState === 'playing' ? pauseResume() : speakPOI(selected, false)} aria-label={audioState === 'playing' ? t.pause : t.start}>
                {audioState === 'playing' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <div className="audio-track">
                <div className="audio-title"><b>{audioState === 'playing' ? t.speaking : audioState === 'paused' ? t.pause : t.ready}</b><span>{language.short} · {language.speech}</span></div>
                <div className={`waveform ${audioState === 'playing' ? 'playing' : ''}`}>{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ '--bar': `${10 + ((i * 17) % 25)}px`, '--delay': `${(i % 9) * 0.07}s` }} />)}</div>
              </div>
              <button className="stop-button" onClick={stopAudio} title={t.stop}><VolumeX size={18} /></button>
            </div>
            <p className="browser-note"><Volume2 size={14} /> {t.autoplay}</p>
          </div>
        </section>}

        <section className="how-it-works">
          <div className="how-title"><span className="section-kicker">{t.howTitle}</span><h2>GPS → Geofence → Audio</h2><p>{t.howDescription}</p></div>
          <div className="steps">
            <div className="step"><span>01</span><b>GPS</b><small>Nhận vị trí hoặc mô phỏng</small></div>
            <div className="step-arrow">→</div>
            <div className="step"><span>02</span><b>Geofence</b><small>Tính khoảng cách tới POI</small></div>
            <div className="step-arrow">→</div>
            <div className="step"><span>03</span><b>Language</b><small>Chọn nội dung theo ngôn ngữ</small></div>
            <div className="step-arrow">→</div>
            <div className="step"><span>04</span><b>Audio</b><small>Tự động đọc lời thuyết minh</small></div>
          </div>
        </section>

        <section className="qr-section" aria-labelledby="qr-title">
          <div className="qr-copy">
            <span className="section-kicker">Q4 FOOD STORIES</span>
            <h2 id="qr-title">{t.qrTitle}</h2>
            <p>{t.qrDescription}</p>
            <a href="https://dulichq4.netlify.app/" target="_blank" rel="noreferrer">{t.qrLink}</a>
            <small>{t.qrInstall}</small>
          </div>
          <div className="qr-code-card">
            <QRCodeSVG
              value="https://dulichq4.netlify.app/"
              size={192}
              level="H"
              includeMargin
              title="QR code for Q4 Food Stories"
            />
          </div>
        </section>

        <footer><div className="footer-brand"><span className="brand-mark"><AudioLines size={18} /></span><b>Q4 Food Stories</b></div><span>{t.footer}</span><span className="footer-right">React · Vite · PWA · MapLibre-style flow</span></footer>
      </main>

      {notice && <div className="toast" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button></div>}
    </div>
  )
}

export default App
