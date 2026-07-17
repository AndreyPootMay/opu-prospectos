import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

export default function PermissionsGate() {
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    requestAllPermissions();
  }, []);

  async function requestAllPermissions() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Capacitor.Plugins.App?.addListener('appStateChange', () => {});

      await Promise.allSettled([
        requestLocationPermissions(),
        requestCameraPermissions(),
      ]);
    } catch (err) {
      console.warn('PermissionsGate: error', err);
    }
  }

  async function requestLocationPermissions() {
    try {
      let permission = await Geolocation.checkPermissions();
      if (permission.location === 'granted') return;
      permission = await Geolocation.requestPermissions();
    } catch (err) {
      console.warn('PermissionsGate: location error', err);
    }
  }

  async function requestCameraPermissions() {
    try {
      let permission = await Camera.checkPermissions();
      if (permission.camera === 'granted' && (permission.photos === 'granted' || permission.readMediaImages === 'granted')) return;
      permission = await Camera.requestPermissions();
    } catch (err) {
      console.warn('PermissionsGate: camera error', err);
    }
  }

  return null;
}
