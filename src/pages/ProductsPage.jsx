import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProspect, updateProspect } from '../services/db';
import { uploadToCloudinary } from '../services/cloudinary';
import { validateProduct, PRODUCT_CATEGORIES, generateUUID } from '../utils/validators';
import ImagePicker from '../components/ImagePicker';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const INITIAL_PRODUCT = {
  name: '',
  description: '',
  price: '',
  category: '',
  containsAlcohol: '0',
  saleHours: '',
  photoPreview: null,
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const [prospectId, setProspectId] = useState(locationState?.prospectId);
  const [prospect, setProspect] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(INITIAL_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

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
      setProducts(data.products || []);
    } else {
      navigate('/');
    }
  };

  const handleProductChange = (field, value) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoto = async () => {
    const file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => resolve(e.target.files[0] || null);
      input.click();
    });
    if (file) {
      setPhotoFile(file);
      setCurrentProduct(prev => ({ ...prev, photoPreview: URL.createObjectURL(file) }));
    }
  };

  const handleGallery = async () => {
    const file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => resolve(e.target.files[0] || null);
      input.click();
    });
    if (file) {
      setPhotoFile(file);
      setCurrentProduct(prev => ({ ...prev, photoPreview: URL.createObjectURL(file) }));
    }
  };

  const handleClearPhoto = () => {
    if (currentProduct.photoPreview) {
      URL.revokeObjectURL(currentProduct.photoPreview);
    }
    setPhotoFile(null);
    setCurrentProduct(prev => ({ ...prev, photoPreview: null }));
  };

  const handleEdit = (product) => {
    setCurrentProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      containsAlcohol: product.containsAlcohol,
      saleHours: product.saleHours || '',
      photoPreview: product.photoPreview || null,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    if (confirm('¿Eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Producto eliminado');
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateProduct(currentProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = '';
      
      if (photoFile) {
        toast.loading('Subiendo foto...', { id: 'upload' });
        const result = await uploadToCloudinary(photoFile, 'prospectos/productos');
        photoUrl = result.url;
        toast.success('Foto subida', { id: 'upload' });
      }

      const productData = {
        id: editingId || (crypto.randomUUID ? crypto.randomUUID() : generateUUID()),
        name: currentProduct.name,
        description: currentProduct.description,
        price: parseFloat(currentProduct.price),
        category: currentProduct.category,
        containsAlcohol: currentProduct.containsAlcohol,
        saleHours: currentProduct.saleHours,
        photoUrl,
        photoPreview: currentProduct.photoPreview,
      };

      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? productData : p));
        toast.success('Producto actualizado');
      } else {
        setProducts(prev => [...prev, productData]);
        toast.success('Producto agregado');
      }

      setCurrentProduct(INITIAL_PRODUCT);
      setPhotoFile(null);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      await updateProspect(prospectId, { products });
      if (products.length === 0) {
        toast('Tienda sin productos, se enviará así', { icon: ' ' });
      } else {
        toast.success(`${products.length} producto(s) guardado(s)`);
      }
      navigate('/preview', { state: { prospectId } });
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error al guardar');
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6 slide-up">
          <h1 className="text-xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-500">
            {prospect?.store?.name || 'Cargando...'} — {products.length} producto(s)
          </p>
        </div>

        {!showForm ? (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mb-6 flex items-center justify-center gap-2 slide-up press-effect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Producto
            </button>

            {products.length === 0 ? (
              <EmptyState
                title="Sin productos"
                subtitle="Puedes agregar productos o continuar sin ellos"
              />
            ) : (
              <div className="space-y-3 mb-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleSaveAll}
              className="btn-primary flex items-center justify-center gap-2 press-effect"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {products.length === 0 ? 'Continuar Sin Productos' : 'Continuar a Vista Previa'}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmitProduct} className="space-y-4 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setCurrentProduct(INITIAL_PRODUCT);
                  handleClearPhoto();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="label-field">Nombre del Producto <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Ej: Tacos al Pastor"
                value={currentProduct.name}
                onChange={(e) => handleProductChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-field">Descripción <span className="text-red-500">*</span></label>
              <textarea
                className={`input-field min-h-[80px] ${errors.description ? 'border-red-400' : ''}`}
                placeholder="Descripción del producto"
                value={currentProduct.description}
                onChange={(e) => handleProductChange('description', e.target.value)}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Precio <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className={`input-field pl-8 ${errors.price ? 'border-red-400' : ''}`}
                    placeholder="0.00"
                    value={currentProduct.price}
                    onChange={(e) => handleProductChange('price', e.target.value)}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="label-field">Categoría <span className="text-red-500">*</span></label>
                <select
                  className={`input-field ${errors.category ? 'border-red-400' : ''}`}
                  value={currentProduct.category}
                  onChange={(e) => handleProductChange('category', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Contiene Alcohol</label>
                <select
                  className="input-field"
                  value={currentProduct.containsAlcohol}
                  onChange={(e) => handleProductChange('containsAlcohol', e.target.value)}
                >
                  <option value="0">No</option>
                  <option value="1">Sí</option>
                </select>
              </div>
              <div>
                <label className="label-field">Horario de Venta</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: 10:00-22:00"
                  value={currentProduct.saleHours}
                  onChange={(e) => handleProductChange('saleHours', e.target.value)}
                />
              </div>
            </div>

            <ImagePicker
              label="Fotografía del Producto"
              preview={currentProduct.photoPreview}
              onCapture={handlePhoto}
              onGallery={handleGallery}
              onClear={handleClearPhoto}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setCurrentProduct(INITIAL_PRODUCT);
                  handleClearPhoto();
                }}
                className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2 press-effect"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  editingId ? 'Actualizar' : 'Agregar'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
