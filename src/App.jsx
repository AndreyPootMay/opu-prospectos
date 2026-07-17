import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import StoreFormPage from './pages/StoreFormPage';
import ProductsPage from './pages/ProductsPage';
import PreviewPage from './pages/PreviewPage';
import SubmittedPage from './pages/SubmittedPage';
import Navbar from './components/Navbar';
import PermissionsGate from './components/PermissionsGate';

const STORAGE_KEY = 'opu-prospectos-last-route';

function RoutePersistence() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedRoute = localStorage.getItem(STORAGE_KEY);
    if (savedRoute && savedRoute !== location.pathname && savedRoute !== '/') {
      navigate(savedRoute, { replace: true });
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, location.pathname);
  }, [location.pathname]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedRoute = localStorage.getItem(STORAGE_KEY);
        if (savedRoute && savedRoute !== window.location.hash.replace('#', '')) {
          window.location.hash = `#${savedRoute}`;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <PermissionsGate />
      <RoutePersistence />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nueva" element={<StoreFormPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/enviado" element={<SubmittedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
