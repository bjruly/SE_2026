'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS } from '@/lib/i18n';

// Phát thuyết minh: Ưu tiên file âm thanh nếu có (audioUrl); nếu không có hoặc lỗi thì dùng Web Speech API (TTS).
// status: 'idle' | 'playing' | 'paused'
export function useNarration() {
  const [status, setStatus] = useState('idle');
  const [currentId, setCurrentId] = useState(null);
  const [voiceWarning, setVoiceWarning] = useState(false);
  const [isAudioFile, setIsAudioFile] = useState(false);
  const [supported, setSupported] = useState(true);
  const token = useRef(0);
  const audioRef = useRef(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  useEffect(() => {
    setSupported('speechSynthesis' in window || typeof Audio !== 'undefined');
    return () => {
      cleanupAudio();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [cleanupAudio]);

  const speak = useCallback((poi, lang) => {
    const mine = ++token.current;

    // Dừng âm thanh và giọng đọc cũ
    cleanupAudio();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const finish = () => {
      if (token.current === mine) {
        cleanupAudio();
        setStatus('idle');
        setCurrentId(null);
        setIsAudioFile(false);
      }
    };

    // Hàm đọc bằng Web Speech API (TTS)
    const playTTS = () => {
      if (!('speechSynthesis' in window)) {
        finish();
        return;
      }
      setIsAudioFile(false);
      const synth = window.speechSynthesis;
      const langConfig = LANGS.find((l) => l.code === lang) || LANGS[0];
      const speechCode = langConfig.speech;
      const text = `${poi.name[lang] || ''}. ${poi.description[lang] || ''}`;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechCode;

      const voices = synth.getVoices();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
      if (match) u.voice = match;
      setVoiceWarning(voices.length > 0 && !match);

      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
      setStatus('playing');
      setCurrentId(poi.id);
    };

    // Kiểm tra xem địa điểm có file audio cho ngôn ngữ này không
    const audioUrl = poi.audioUrl?.[lang]?.trim();
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setIsAudioFile(true);
        setVoiceWarning(false);

        audio.onended = finish;
        audio.onerror = () => {
          // Nếu file audio lỗi (404, lỗi mạng), tự động fallback sang TTS
          if (token.current === mine) {
            cleanupAudio();
            playTTS();
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (token.current === mine) {
                setStatus('playing');
                setCurrentId(poi.id);
              }
            })
            .catch(() => {
              if (token.current === mine) {
                cleanupAudio();
                playTTS();
              }
            });
        } else {
          setStatus('playing');
          setCurrentId(poi.id);
        }
      } catch {
        playTTS();
      }
    } else {
      playTTS();
    }
  }, [cleanupAudio]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    setStatus('playing');
  }, []);

  const stop = useCallback(() => {
    token.current += 1;
    cleanupAudio();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setStatus('idle');
    setCurrentId(null);
    setIsAudioFile(false);
  }, [cleanupAudio]);

  return { status, currentId, voiceWarning, isAudioFile, supported, speak, pause, resume, stop };
}
