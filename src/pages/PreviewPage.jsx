import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProspect, markAsSynced } from '../services/db';
import { submitProspect } from '../services/api';
import { playSubmit, playError } from '../utils/sounds';
import toast from 'react-hot-toast';

export default function PreviewPage() {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const [prospectId, setProspectId] = useState(locationState?.prospectId);
  const [prospect, setProspect] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prospectId) {
      loadProspect(prospectId);
    } else {
      navigate('/');
    }
  }, [prospectId]);

  const loadProspect = async (id) => {
    const data = await getProspect(id);
    if (data) {
      setProspect(data);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const promotor = localStorage.getItem('opu-prospectos-promotor') || '';
      const payload = {
        tienda: {
          nombre: prospect.store.name,
          nombre_encargado: prospect.store.contactName,
          contacto_encargado: prospect.store.contactInfo,
          categoria: prospect.store.category,
          correo: prospect.store.email,
          telefono: prospect.store.phone.replace(/\D/g, ''),
          whatsapp: prospect.store.whatsapp?.replace(/\D/g, '') || '',
          estado: prospect.store.state,
          ciudad: prospect.store.city,
          direccion: prospect.store.address,
          detalles_direccion: prospect.store.addressDetails,
          latitud: prospect.store.latitude,
          longitud: prospect.store.longitude,
          logo_url: prospect.store.logoUrl || '',
          fachada_url: prospect.store.facadeUrl || '',
        },
        productos: prospect.products.map(p => ({
          nombre: p.name,
          descripcion: p.description,
          precio: p.price,
          categoria: p.category,
          contiene_alcohol: p.containsAlcohol === '1',
          horario_venta: p.saleHours || '',
          foto_url: p.photoUrl || '',
        })),
        metadata: {
          prospecto_id: prospect.id,
          fecha_registro: new Date(prospect.createdAt).toISOString(),
          total_productos: prospect.products.length,
        },
        promotor,
      };

      const result = await submitProspect(payload);
      
      await markAsSynced(prospectId);
      
      playSubmit();
      toast.success('Prospecto enviado exitosamente');
      navigate('/enviado');
    } catch (error) {
      console.error('Error submitting:', error);
      playError();
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!prospect) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-opu-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { store, products } = prospect;

  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6 slide-up">
          <h1 className="text-xl font-bold text-gray-800">Vista Previa</h1>
          <p className="text-sm text-gray-500">Revisa la información antes de enviar</p>
        </div>

        <div className="space-y-4 fade-in">
          <div className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center gap-3 mb-3">
              {store.logoPreview ? (
                <img src={store.logoPreview} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 opu-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div>
                <h2 className="font-bold text-gray-800">{store.name}</h2>
                <span className="text-xs opu-gradient text-white px-2 py-0.5 rounded-full">{store.category}</span>
              </div>
            </div>
            {store.facadePreview && (
              <div className="mb-3">
                <img src={store.facadePreview} alt="Fachada" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}

            <div className="space-y-2 text-sm">
              <InfoRow icon="user" label="Encargado" value={store.contactName} />
              <InfoRow icon="phone" label="Contacto" value={store.contactInfo} />
              <InfoRow icon="mail" label="Email" value={store.email} />
              <InfoRow icon="call" label="Teléfono" value={store.phone} />
              {store.whatsapp && <InfoRow icon="whatsapp" label="WhatsApp" value={store.whatsapp} />}
              <InfoRow icon="location" label="Dirección" value={`${store.address}, ${store.city}, ${store.state}`} />
              {store.addressDetails && <InfoRow icon="info" label="Detalles" value={store.addressDetails} />}
              {store.latitude && store.longitude && (
                <InfoRow icon="gps" label="GPS" value={`${parseFloat(store.latitude).toFixed(4)}, ${parseFloat(store.longitude).toFixed(4)}`} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 card-shadow">
            <h3 className="font-semibold text-gray-800 mb-3">Productos ({products.length})</h3>
            {products.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin productos registrados</p>
            ) : (
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div key={product.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 mt-1">#{index + 1}</span>
                    {product.photoPreview ? (
                      <img src={product.photoPreview} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-opu-pink font-bold text-sm">${parseFloat(product.price).toFixed(2)}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{product.category}</span>
                        {product.containsAlcohol === '1' && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded"> alcohol</span>
                        )}
                      </div>
                      {product.saleHours && (
                        <p className="text-xs text-gray-400 mt-0.5">  Horario: {product.saleHours}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-opu-pink mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-pink-700">
                <p className="font-medium">Información</p>
                <p className="text-pink-600">Los datos serán enviados por correo al equipo de sistemas para su revisión y alta en el sistema.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/productos', { state: { prospectId } })}
            className="w-full py-3 border-2 border-opu-pink text-opu-pink font-semibold rounded-xl press-effect flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {products.length === 0 ? 'Agregar Productos' : 'Editar Productos'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex items-center justify-center gap-2 press-effect"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Prospecto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const icons = {
    user: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    phone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    mail: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    call: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    whatsapp: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    location: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    info: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    gps: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>,
  };

  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icons[icon]}</span>
      <div>
        <span className="text-gray-400 text-xs">{label}</span>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
}
