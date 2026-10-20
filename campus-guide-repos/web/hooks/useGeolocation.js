'use client';
import { useEffect, useState } from 'react';

// Theo dõi GPS thật của thiết bị. Khi enabled = false thì không theo dõi.
// status: 'idle' | 'waiting' | 'ok' | 'denied' | 'unsupported'
export function useGeolocation(enabled) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return undefined;
    }
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return undefined;
    }
    setStatus('waiting');
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setStatus('ok');
      },
      (err) => setStatus(err.code === 1 ? 'denied' : 'waiting'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { position, status };
}
