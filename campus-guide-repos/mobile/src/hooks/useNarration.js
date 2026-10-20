import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { LANGS } from '../lib/i18n';

// Đọc thuyết minh bằng giọng đọc có sẵn của thiết bị (expo-speech).
// status: 'idle' | 'playing' | 'paused'
export function useNarration() {
  const [status, setStatus] = useState('idle');
  const [currentId, setCurrentId] = useState(null);
  const [voiceWarning, setVoiceWarning] = useState(false);
  const token = useRef(0);

  useEffect(() => () => { Speech.stop(); }, []);

  const speak = useCallback((poi, lang) => {
    const code = LANGS.find((l) => l.code === lang).speech;
    Speech.stop();
    token.current += 1;
    const mine = token.current;
    const finish = () => {
      if (token.current === mine) {
        setStatus('idle');
        setCurrentId(null);
      }
    };
    Speech.speak(`${poi.name[lang]}. ${poi.description[lang]}`, {
      language: code,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
    setStatus('playing');
    setCurrentId(poi.id);

    // Cảnh báo nếu thiết bị chưa có giọng đọc cho ngôn ngữ này
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (token.current !== mine) return;
        const has = voices.some((v) => (v.language || '').toLowerCase().startsWith(lang));
        setVoiceWarning(voices.length > 0 && !has);
      })
      .catch(() => {});
  }, []);

  const pause = useCallback(() => {
    try {
      Speech.pause();
      setStatus('paused');
    } catch {
      // Nếu thiết bị không hỗ trợ tạm dừng thì dừng hẳn
      token.current += 1;
      Speech.stop();
      setStatus('idle');
      setCurrentId(null);
    }
  }, []);

  const resume = useCallback(() => {
    try {
      Speech.resume();
      setStatus('playing');
    } catch {
      setStatus('idle');
    }
  }, []);

  const stop = useCallback(() => {
    token.current += 1;
    Speech.stop();
    setStatus('idle');
    setCurrentId(null);
  }, []);

  return { status, currentId, voiceWarning, speak, pause, resume, stop };
}
