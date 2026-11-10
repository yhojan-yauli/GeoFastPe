# GeoFastPe - cambios frontend

## Aplicado
- Se conserva MapLibre montado al cambiar de sección; queda visible detrás de los apartados.
- Eventos y reportes se consultan mediante sus endpoints existentes y se incorporan al motor del mapa como puntos EVENTO y REPORTE.
- El filtrado por tipo distingue eventos de reportes y mantiene el filtro por radio.
- Las publicaciones del mapa muestran título, tipo, descripción, categoría, ubicación, estado, autor y fecha cuando esos datos existen.
- La búsqueda primero revisa los puntos/publicaciones ya cargados en el radar y después consulta `/geo/buscar`; los lugares devueltos se limitan al radio activo.
- Se agrega caché local de puntos del mapa y publicaciones para recuperar la última información consultada sin conexión.
- Se incorpora Service Worker para cachear recursos estáticos, estilos/tiles de mapa y GET públicos de la API ya visitados.
- Sidebar contraíble, mejoras responsive y ajuste del modal de autenticación para evitar desbordamientos y barras visibles.
- Se evita inicializar dos veces el motor MapLibre en desarrollo al retirar React.StrictMode del punto de entrada.

## Consideraciones reales del backend entregado
- `GET /mapa/puntos` solo devuelve SERVICIO, EMERGENCIA, VENTA y SOLIDARIDAD. No incluye eventos ni reportes. El frontend los agrega consultando `GET /eventos?tab=proximos` y `GET /reportes`, que sí existen en el backend recibido.
- La mensajería del backend es privada: `GET /conversaciones` solo lista conversaciones donde el usuario autenticado es miembro. No existe un feed público de mensajes de todos los usuarios ni un endpoint general para buscar usuarios/añadir destinatarios a una conversación. Por eso el frontend no puede mostrar mensajes públicos de terceros ni iniciar un chat arbitrario sin ampliar el backend.
- El modo offline conserva los tiles y datos que el navegador ya descargó/consultó. No descarga previamente todo el mapa del Perú; una zona nunca visitada requiere conexión para obtener sus tiles iniciales.
- La búsqueda geográfica usa `/geo/buscar`, que delega en el proveedor externo del backend; sin conexión solo puede buscar entre puntos ya guardados/cargados.

## Ejecución
Desde `frontend/`: `npm install` y `npm run dev`. El Service Worker funciona en localhost o en un sitio servido por HTTPS. Configura `VITE_API_URL` según la dirección del backend.
