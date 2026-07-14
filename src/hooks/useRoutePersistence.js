import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'opu-prospectos-last-route';

export function useRoutePersistence() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRoute = localStorage.getItem(STORAGE_KEY);
    if (savedRoute && savedRoute !== location.pathname && savedRoute !== '/') {
      navigate(savedRoute, { replace: true });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedRoute = localStorage.getItem(STORAGE_KEY);
        if (savedRoute && savedRoute !== window.location.pathname) {
          window.location.hash = `#${savedRoute}`;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
