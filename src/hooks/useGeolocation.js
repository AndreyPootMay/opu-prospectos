import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        let permission = await Geolocation.checkPermissions();

        if (permission.location !== 'granted') {
          try {
            permission = await Geolocation.requestPermissions();
          } catch (permErr) {
            console.warn('Geolocation requestPermissions failed:', permErr);
          }
        }

        if (permission.location !== 'granted') {
          throw new Error('Permiso de ubicación denegado. Ve a Configuración > Apps > OPU Prospectos > Permisos y habilita la ubicación.');
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });

        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      } else {
        if (!navigator.geolocation) {
          throw new Error('Geolocalización no soportada en este navegador');
        }

        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });

        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      }
    } catch (err) {
      const message = err.message || 'Error al obtener ubicación';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { location, error, loading, getCurrentPosition };
}
