export const STORE_CATEGORIES = [
  'Alimentos y Bebidas',
  'Restaurantes',
  'Tiendas de Abarrotes',
  'Farmacias',
  'Ropa y Accesorios',
  'Electrónicos',
  'Hogar y Decoración',
  'Servicios',
  'Otros',
];

export const PRODUCT_CATEGORIES = [
  'Comida Rápida',
  'Comida Típica',
  'Pizzas',
  'Tacos',
  'Bebidas',
  'Postres',
  'Abarrotes',
  'Lácteos',
  'Carnes',
  'Frutas y Verduras',
  'Panadería',
  'Otros',
];

export const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

export function validateStore(store) {
  const errors = {};
  
  if (!store.name || store.name.trim().length < 2) {
    errors.name = 'El nombre de la tienda es requerido';
  }
  if (!store.contactName || store.contactName.trim().length < 2) {
    errors.contactName = 'El nombre del encargado es requerido';
  }
  if (!store.contactInfo || store.contactInfo.trim().length < 2) {
    errors.contactInfo = 'El contacto del encargado es requerido';
  }
  if (!store.category) {
    errors.category = 'Selecciona una categoría';
  }
  if (store.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email)) {
    errors.email = 'Ingresa un correo válido';
  }
  const phoneDigits = (store.phone || '').replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
  }
  if (!store.state) {
    errors.state = 'Selecciona un estado';
  }
  if (!store.city || store.city.trim().length < 2) {
    errors.city = 'La ciudad es requerida';
  }
  if (!store.address || store.address.trim().length < 3) {
    errors.address = 'La dirección es requerida';
  }
  
  return errors;
}

export function validateProduct(product) {
  const errors = {};
  
  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'El nombre del producto es requerido';
  }
  if (!product.description || product.description.trim().length < 5) {
    errors.description = 'La descripción es requerida';
  }
  if (!product.price || parseFloat(product.price) <= 0) {
    errors.price = 'Ingresa un precio válido';
  }
  if (!product.category) {
    errors.category = 'Selecciona una categoría';
  }
  
  return errors;
}

export function formatPhone(value) {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length >= 7) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length >= 4) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  return cleaned;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
