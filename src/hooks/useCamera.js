import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useCamera() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const takePhoto = () => {
    return new Promise(async (resolve) => {
      setLoading(true);
      setError(null);

      try {
        if (Capacitor.isNativePlatform()) {
          let permission = await Camera.checkPermissions();

          if (permission.camera !== 'granted' || (permission.photos !== 'granted' && permission.readMediaImages !== 'granted')) {
            permission = await Camera.requestPermissions();
          }

          if (permission.camera !== 'granted') {
            throw new Error('Permiso de cámara denegado. Actívalo en Configuración.');
          }

          const photo = await Camera.getPhoto({
            quality: 85,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
          });

          const file = await fetchFileFromUri(photo.webPath, photo.path);
          const previewUrl = photo.webPath;
          setPreview(previewUrl);
          resolve(file);
        } else {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';

          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              setPreview(previewUrl);
              resolve(file);
            } else {
              resolve(null);
            }
          };

          input.click();
        }
      } catch (err) {
        const message = err.message || 'Error al capturar foto';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    });
  };

  const pickFromGallery = () => {
    return new Promise(async (resolve) => {
      setLoading(true);
      setError(null);

      try {
        if (Capacitor.isNativePlatform()) {
          let permission = await Camera.checkPermissions();

          if (permission.photos !== 'granted' && permission.readMediaImages !== 'granted') {
            permission = await Camera.requestPermissions();
          }

          if (permission.photos !== 'granted' && permission.readMediaImages !== 'granted') {
            throw new Error('Permiso de galería denegado. Actívalo en Configuración.');
          }

          const photo = await Camera.getPhoto({
            quality: 85,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Photos,
          });

          const file = await fetchFileFromUri(photo.webPath, photo.path);
          const previewUrl = photo.webPath;
          setPreview(previewUrl);
          resolve(file);
        } else {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';

          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              setPreview(previewUrl);
              resolve(file);
            } else {
              resolve(null);
            }
          };

          input.click();
        }
      } catch (err) {
        const message = err.message || 'Error al seleccionar foto';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    });
  };

  const clearPreview = () => {
    if (preview && !preview.startsWith('capacitor://') && !preview.startsWith('content://')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
  };

  return { preview, loading, error, takePhoto, pickFromGallery, clearPreview };
}

async function fetchFileFromUri(webPath, nativePath) {
  const response = await fetch(webPath);
  const blob = await response.blob();
  const fileName = nativePath ? nativePath.split('/').pop() : `photo_${Date.now()}.jpg`;
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}
