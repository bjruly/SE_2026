'use client';
import { useEffect } from 'react';
import { sendPresence } from '@/lib/poiSource';

const HEARTBEAT_MS = 30000;

export function useOnlinePresence() {
  useEffect(() => {
    let timer;
    let loggedFailure = false;
    const heartbeat = () => {
      sendPresence()
        .then(() => {
          loggedFailure = false;
        })
        .catch((error) => {
          if (!loggedFailure) console.error(error);
          loggedFailure = true;
        });
    };
    const update = () => {
      if (document.visibilityState === 'visible') {
        heartbeat();
        if (!timer) timer = window.setInterval(heartbeat, HEARTBEAT_MS);
      } else if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      if (timer) window.clearInterval(timer);
    };
  }, []);
}
