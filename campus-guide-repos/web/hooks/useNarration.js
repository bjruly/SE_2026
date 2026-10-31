'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS } from '@/lib/i18n';

// Đọc thuyết minh bằng giọng đọc có sẵn của trình duyệt/thiết bị (Web Speech API).
// status: 'idle' | 'playing' | 'paused'
export function useNarration() {
  const [status, setStatus] = useState('idle');
  const [currentId, setCurrentId] = useState(null);
  const [voiceWarning, setVoiceWarning] = useState(false);
  const [supported, setSupported] = useState(true);
  const token = useRef(0);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((poi, lang) => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const speech = LANGS.find((l) => l.code === lang).speech;
    const mine = ++token.current;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(`${poi.name[lang]}. ${poi.description[lang]}`);
    u.lang = speech;
    const voices = synth.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
    if (match) u.voice = match;
    setVoiceWarning(voices.length > 0 && !match);
    const finish = () => {
      if (token.current === mine) {
        setStatus('idle');
        setCurrentId(null);
      }
    };
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
    setStatus('playing');
    setCurrentId(poi.id);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setStatus('playing');
  }, []);

  const stop = useCallback(() => {
    token.current += 1;
    window.speechSynthesis.cancel();
    setStatus('idle');
    setCurrentId(null);
  }, []);

  return { status, currentId, voiceWarning, supported, speak, pause, resume, stop };
}
