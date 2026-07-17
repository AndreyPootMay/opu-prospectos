import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export default function PermissionsGate() {
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    requestLocationPermissions();
  }, []);

  async function requestLocationPermissions() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const permission = await Geolocation.checkPermissions();

      if (permission.location === 'granted') return;

      if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
        await Geolocation.requestPermissions();
      }
    } catch (err) {
      console.warn('PermissionsGate: error requesting location permissions', err);
    }
  }

  return null;
}
