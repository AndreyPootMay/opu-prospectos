import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SubmittedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center slide-up">
        <div className="w-20 h-20 opu-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">¡Enviado!</h1>
        
        <p className="text-gray-500 mb-2">
          Tu prospecto ha sido enviado exitosamente.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          El equipo de sistemas recibirá la información por correo electrónico para su revisión y alta en el sistema.
        </p>

        <div className="bg-white rounded-xl p-4 card-shadow mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 opu-gradient rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">Correo de notificación</p>
              <p className="text-xs text-gray-400">sistemasopu@gmail.com</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-primary press-effect"
        >
          Registrar Otra Tienda
        </button>
      </div>
    </div>
  );
}
