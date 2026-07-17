import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProspect } from '../services/db';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCamera } from '../hooks/useCamera';
import { uploadToCloudinary } from '../services/cloudinary';
import { validateStore, STORE_CATEGORIES, MEXICAN_STATES, formatPhone, generateUUID } from '../utils/validators';
import { playSuccess, playError } from '../utils/sounds';
import ImagePicker from '../components/ImagePicker';
import toast from 'react-hot-toast';

const INITIAL_STORE = {
  name: '',
  contactName: '',
  contactInfo: '',
  category: '',
  email: '',
  phone: '',
  whatsapp: '',
  state: 'Quintana Roo',
  city: 'Cancún',
  address: '',
  addressDetails: '',
  latitude: '',
  longitude: '',
  logo: null,
  logoPreview: null,
  logoUrl: '',
  facadePreview: null,
  facadeUrl: '',
};

export default function StoreFormPage() {
  const navigate = useNavigate();
  const { location, loading: geoLoading, getCurrentPosition } = useGeolocation();
  const { preview: logoPreview, takePhoto, pickFromGallery, clearPreview } = useCamera();
  
  const [store, setStore] = useState(INITIAL_STORE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [facadeFile, setFacadeFile] = useState(null);
  const { preview: facadePreview, takePhoto: takeFacadePhoto, pickFromGallery: pickFacadeGallery, clearPreview: clearFacadePreview } = useCamera();

  useEffect(() => {
    if (location) {
      setStore(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      }));
    }
  }, [location]);

  useEffect(() => {
    if (logoPreview) {
      setStore(prev => ({ ...prev, logoPreview }));
    }
  }, [logoPreview]);

  useEffect(() => {
    if (facadePreview) {
      setStore(prev => ({ ...prev, facadePreview }));
    }
  }, [facadePreview]);

  const handleChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setStore(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoto = async () => {
    try {
      const file = await takePhoto();
      if (file) setLogoFile(file);
    } catch (err) {
      toast.error(err.message || 'Error al capturar foto');
    }
  };

  const handleGallery = async () => {
    try {
      const file = await pickFromGallery();
      if (file) setLogoFile(file);
    } catch (err) {
      toast.error(err.message || 'Error al seleccionar foto');
    }
  };

  const handleClearPhoto = () => {
    clearPreview();
    setLogoFile(null);
    setStore(prev => ({ ...prev, logoPreview: null, logoUrl: '' }));
  };

  const handleFacadeCapture = async () => {
    try {
      const file = await takeFacadePhoto();
      if (file) setFacadeFile(file);
    } catch (err) {
      toast.error(err.message || 'Error al capturar foto');
    }
  };

  const handleFacadeGallery = async () => {
    try {
      const file = await pickFacadeGallery();
      if (file) setFacadeFile(file);
    } catch (err) {
      toast.error(err.message || 'Error al seleccionar foto');
    }
  };

  const handleClearFacade = () => {
    clearFacadePreview();
    setFacadeFile(null);
    setStore(prev => ({ ...prev, facadePreview: null, facadeUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateStore(store);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      let logoUrl = '';
      let facadeUrl = '';
      
      if (logoFile) {
        toast.loading('Subiendo logo...', { id: 'upload' });
        const result = await uploadToCloudinary(logoFile, 'prospectos/logos');
        logoUrl = result.url;
        toast.success('Logo subido', { id: 'upload' });
      }

      if (facadeFile) {
        toast.loading('Subiendo fachada...', { id: 'upload' });
        const result = await uploadToCloudinary(facadeFile, 'prospectos/fachadas');
        facadeUrl = result.url;
        toast.success('Fachada subida', { id: 'upload' });
      }

      const prospectData = {
        id: crypto.randomUUID ? crypto.randomUUID() : generateUUID(),
        store: {
          ...store,
          logoUrl,
          facadeUrl,
          phone: store.phone.replace(/\D/g, ''),
          whatsapp: store.whatsapp.replace(/\D/g, ''),
        },
        products: [],
        createdAt: Date.now(),
      };

      const saved = await saveProspect(prospectData);
      playSuccess();
      toast.success('Tienda guardada');
      navigate('/productos', { state: { prospectId: saved.id } });
    } catch (error) {
      console.error('Error saving store:', error);
      playError();
      toast.error('Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6 slide-up">
          <h1 className="text-xl font-bold text-gray-800">Registrar Tienda</h1>
          <p className="text-sm text-gray-500">Datos generales de la tienda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 fade-in">
          <div>
            <label className="label-field">Nombre de la Tienda <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="Ej: Taquería El Güero"
              value={store.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label-field">Nombre del Encargado <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.contactName ? 'border-red-400' : ''}`}
              placeholder="Nombre completo"
              value={store.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
            />
            {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
          </div>

          <div>
            <label className="label-field">Contacto del Encargado <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.contactInfo ? 'border-red-400' : ''}`}
              placeholder="Teléfono o cargo"
              value={store.contactInfo}
              onChange={(e) => handleChange('contactInfo', e.target.value)}
            />
            {errors.contactInfo && <p className="text-red-500 text-xs mt-1">{errors.contactInfo}</p>}
          </div>

          <div>
            <label className="label-field">Categoría <span className="text-red-500">*</span></label>
            <select
              className={`input-field ${errors.category ? 'border-red-400' : ''}`}
              value={store.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {STORE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="label-field">Correo Electrónico</label>
            <input
              type="email"
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              placeholder="correo@ejemplo.com"
              value={store.email}
              inputMode="email"
              autoComplete="email"
              onChange={(e) => handleChange('email', e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Teléfono <span className="text-red-500">*</span></label>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                placeholder="(000) 000-0000"
                value={store.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="label-field">WhatsApp</label>
              <input
                type="tel"
                className="input-field"
                placeholder="(000) 000-0000"
                value={store.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Estado <span className="text-red-500">*</span></label>
              <select
                className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                value={store.state}
                onChange={(e) => handleChange('state', e.target.value)}
              >
                <option value="">Seleccionar</option>
                {MEXICAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="label-field">Ciudad <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                placeholder="Ciudad"
                value={store.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="label-field">Dirección <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`input-field ${errors.address ? 'border-red-400' : ''}`}
              placeholder="Calle y número"
              value={store.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="label-field">Detalles de Dirección</label>
            <input
              type="text"
              className="input-field"
              placeholder="Referencia, colonia, etc."
              value={store.addressDetails}
              onChange={(e) => handleChange('addressDetails', e.target.value)}
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <label className="label-field">Ubicación GPS</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await getCurrentPosition();
                    toast.success('Ubicación obtenida');
                  } catch (err) {
                    toast.error(err.message || 'Error al obtener ubicación');
                  }
                }}
                disabled={geoLoading}
                className="flex items-center gap-2 px-4 py-2 opu-gradient text-white rounded-lg text-sm font-medium disabled:opacity-50 press-effect"
              >
                {geoLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {geoLoading ? 'Obteniendo...' : 'Obtener GPS'}
              </button>
              {store.latitude && store.longitude && (
                <span className="text-xs text-gray-500">
                  {parseFloat(store.latitude).toFixed(4)}, {parseFloat(store.longitude).toFixed(4)}
                </span>
              )}
            </div>
          </div>

          <ImagePicker
            label="Logotipo"
            preview={store.logoPreview}
            onCapture={handlePhoto}
            onGallery={handleGallery}
            onClear={handleClearPhoto}
          />

          <ImagePicker
            label="Foto de Fachada"
            preview={facadePreview}
            onCapture={handleFacadeCapture}
            onGallery={handleFacadeGallery}
            onClear={handleClearFacade}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center justify-center gap-2 press-effect"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar y Agregar Productos
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
