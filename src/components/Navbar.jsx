import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const PROMOTER_KEY = 'opu-prospectos-promotor';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [promotor, setPromotor] = useState(() => localStorage.getItem(PROMOTER_KEY) || '');
  const [editingPromotor, setEditingPromotor] = useState(false);
  const [tempPromotor, setTempPromotor] = useState(promotor);

  useEffect(() => {
    localStorage.setItem(PROMOTER_KEY, promotor);
  }, [promotor]);

  if (location.pathname === '/enviado') return null;

  const handleSavePromotor = () => {
    setPromotor(tempPromotor.trim());
    setEditingPromotor(false);
  };

  return (
    <header className="opu-gradient text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.2"/>
            <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-lg">OPU Prospectos</span>
        </button>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              isOnline
                ? 'bg-white/20 text-white'
                : 'bg-red-500/80 text-white'
            }`}
            title={isOnline ? 'Conectado' : 'Sin conexión'}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/60'}`}></span>
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setTempPromotor(promotor);
                setEditingPromotor(!editingPromotor);
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1"
              title={promotor || 'Configurar promotor'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {promotor && (
                <span className="text-xs font-medium hidden sm:inline max-w-[80px] truncate">{promotor}</span>
              )}
            </button>

            {editingPromotor && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl p-3 w-64 z-50 slide-up">
                <label className="text-xs text-gray-500 font-medium block mb-1">Nombre del Promotor</label>
                <input
                  type="text"
                  value={tempPromotor}
                  onChange={(e) => setTempPromotor(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePromotor()}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSavePromotor}
                    className="flex-1 py-1.5 opu-gradient text-white rounded-lg text-sm font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingPromotor(false)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
