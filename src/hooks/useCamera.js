import { useState } from 'react';

export function useCamera() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const takePhoto = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setLoading(true);
          try {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            resolve(file);
          } catch (err) {
            setError(err.message);
            resolve(null);
          } finally {
            setLoading(false);
          }
        } else {
          resolve(null);
        }
      };
      
      input.click();
    });
  };

  const pickFromGallery = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setLoading(true);
          try {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            resolve(file);
          } catch (err) {
            setError(err.message);
            resolve(null);
          } finally {
            setLoading(false);
          }
        } else {
          resolve(null);
        }
      };
      
      input.click();
    });
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
  };

  return { preview, loading, error, takePhoto, pickFromGallery, clearPreview };
}
