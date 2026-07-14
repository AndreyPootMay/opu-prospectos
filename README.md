# OPU Prospectos

App móvil SPA para registrar tiendas y productos como prospectos de negocio.

## Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Persistencia**: IndexedDB (offline-first)
- **Imágenes**: Cloudinary
- **Mobile**: Capacitor (GPS, Cámara, Galería)
- **Backend**: Yii2 API

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset
VITE_API_BASE_URL=http://tu-dominio/api/v1
```

3. Ejutar en desarrollo:
```bash
npm run dev
```

4. Build para producción:
```bash
npm run build
```

## Generar APK (Capacitor)

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

O automatizado via GitHub Actions con commit message "release apk".

## Estructura de Datos

### Tienda
- Nombre de la tienda
- Nombre del encargado
- Contacto del encargado
- Categoría
- Correo electrónico
- Teléfono
- WhatsApp
- Estado
- Ciudad
- Dirección
- Detalles de dirección
- Latitud/Longitud
- Logotipo (Cloudinary URL)

### Producto
- Nombre del producto
- Descripción
- Fotografía (Cloudinary URL, opcional)
- Precio
- Categoría
- Contiene alcohol
- Horario de venta

## Envío de Datos

Los prospectos se envían por correo a `sistemasopu@gmail.com` con:
- HTML formateado con todos los datos
- Payload JSON para procesamiento posterior
- Imágenes subidas a Cloudinary con URLs accesibles
