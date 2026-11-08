# GeoFastPe — React

## Requisitos
- Node.js 18 o superior
- npm

## Instalación y ejecución
```bash
npm install
npm run dev
```

## Compilar
```bash
npm run build
npm run preview
```

## Estructura
```text
src/
├── components/
│   └── views/             # Vistas separadas de la interfaz
├── engine/
│   └── geoFastEngine.js   # Funciones y lógica original de GeoFastPe
├── styles/
│   └── global.css         # Estilos originales
├── App.jsx
└── main.jsx
```

## Conservación de funcionalidad
El motor JavaScript original se conserva íntegro dentro de `src/engine/geoFastEngine.js`.
Se encapsuló en `initializeGeoFastPe()` para ejecutarlo desde `useEffect` de React.
Los IDs y el marcado de las vistas se mantienen para que los selectores y eventos
originales sigan funcionando. No se eliminaron funciones ni se rediseñaron sus reglas.
MapLibre GL se importa como dependencia y se carga desde el CDN en `index.html`.


## Interfaz comunitaria añadida
- Mapa a pantalla completa como fondo permanente.
- Sidebar con Inicio, Servicios, Solidaridad, Emergencias, Reportes, Eventos, Mensajes, Mi Perfil y Configuración.
- Panel derecho de resultados que responde a la sección seleccionada.
- Filtro de radio sincronizado con el radar circular del mapa: los marcadores y la lista usan el mismo radio.
- Inicio muestra todos los servicios; Servicios, Solidaridad y Emergencias filtran por tipo.
- Reportes, Eventos, Mensajes, Perfil y Configuración incluyen plantillas visuales preparadas para conectar con endpoints/backend.

## Nota sobre datos
El HTML original contiene servicios simulados (gasfitería, solidaridad y emergencia), que se mantienen y ahora alimentan el panel lateral. No se encontraron modelos ni endpoints de reportes, eventos, mensajería o perfiles en el archivo original; esas secciones se entregan como plantillas de interfaz sin inventar persistencia ni operaciones de backend.
