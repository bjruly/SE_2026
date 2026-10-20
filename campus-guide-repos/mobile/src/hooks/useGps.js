import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Theo dõi GPS thật. Khi enabled = false thì không theo dõi.
// status: 'idle' | 'waiting' | 'ok' | 'denied' | 'unsupported'
export function useGps(enabled) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return undefined;
    }
    let cancelled = false;
    let subscription = null;

    (async () => {
      setStatus('waiting');
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
        (loc) => {
          setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy });
          setStatus('ok');
        },
      );
      if (cancelled && subscription) subscription.remove();
    })().catch(() => setStatus('unsupported'));

    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
  }, [enabled]);

  return { position, status };
}
