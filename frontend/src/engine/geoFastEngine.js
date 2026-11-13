/*
 * Motor original de GeoFastPe.
 * Se conserva íntegro el JavaScript del HTML entregado; únicamente se encapsula
 * para inicializarlo desde el ciclo de vida de React.
 */
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { API_BASE } from '../api/client.js';
import { iconMarkup } from '../components/common/mapIcons.js';

export function initializeGeoFastPe() {
        if (window.GeoFastPe?.__initialized) return window.GeoFastPe;

        // ============================================================
        // 1. CONFIG
        // ============================================================
        const CITIES = {
            lima: { lat: -12.046374, lng: -77.042793, zoom: 14, name: 'Lima' },
            arequipa: { lat: -16.409047, lng: -71.537451, zoom: 14, name: 'Arequipa' },
            cusco: { lat: -13.531950, lng: -71.967463, zoom: 14, name: 'Cusco' }
        };
        const ROUTE_URLS = {
            driving: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
            walking: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving',
            cycling: 'https://routing.openstreetmap.de/routed-bike/route/v1/driving'
        };
        const STYLE_URLS = {
            light: 'https://tiles.openfreemap.org/styles/liberty',
            transport: 'https://tiles.openfreemap.org/styles/bright'
        };
        const TRANSPORT_COLORS = {
            motorway:    { fill: '#e63946', casing: '#a51d2d' },
            trunk:       { fill: '#f77f00', casing: '#b85600' },
            primary:     { fill: '#fcbf49', casing: '#c49000' },
            secondary:   { fill: '#06d6a0', casing: '#048a68' },
            tertiary:    { fill: '#118ab2', casing: '#0b5f7b' },
            residential: { fill: '#94a3b8', casing: '#64748b' },
            path:        { fill: '#a78bfa', casing: '#7c5fd6' }
        };
        const DEM_URL = 'https://tiles.mapterhorn.com/tilejson.json';

        let currentCenter = { lat: CITIES.lima.lat, lng: CITIES.lima.lng };
        let currentCityName = 'Lima';
        let currentRadius = 1000;
        let isEmergencyMode = false;
        let selectedServiceCategory = 'Todos';
        let is3DMode = false;
        let isDarkMode = false;
        let routingMode = false;
        let currentRouteMode = 'driving';
        let centerPin = null;
        let searchMarker = null;
        let routeGeoJSON = null;
        let currentLayerName = 'light';
        let terrainEnabled = false;
        let currentWeatherData = null;
        let lastRouteDestination = null;
        let routeDestinationMarker = null;

        // Ubicación real del usuario (GPS)
        let userLocation = null;
        let userLocationMarker = null;
        let userWatchId = null;
        let followUser = true;
        let userCenteredOnce = false;
        let lastAreaRefreshAt = 0;
        let lastUserFix = null;
        let lastGeoError = null;

        // ============================================================
        // 2. MAPA
        // ============================================================
        const map = new maplibregl.Map({
            container: 'map',
            style: STYLE_URLS.light,
            center: [currentCenter.lng, currentCenter.lat],
            zoom: 14,
            pitch: 0,
            bearing: 0
        });
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), 'top-right');

        // Puntos del mapa cargados desde la API (GET /mapa/puntos)
        let servicesData = [];
        let puntosSeq = 0;

        let toastTimer;
        function toast(msg) {
            const el = document.getElementById('status-toast');
            el.innerText = msg;
            el.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
        }

        // Indicador persistente: muestra si la ubicación es GPS real o aproximada.
        function setGpsStatus(text, kind = '') {
            let el = document.getElementById('gps-status');
            if (!el) {
                el = document.createElement('div');
                el.id = 'gps-status';
                document.body.appendChild(el);
            }
            el.className = `gps-status${text ? ' visible' : ''}${kind ? ` ${kind}` : ''}`;
            el.textContent = text || '';
        }

        // ============================================================
        // 3. INICIALIZACIÓN
        // ============================================================
        map.on('load', () => {
            removeBase3DLayers();
            createCenterPin();
            addRadiusCircle();
            updateServices();
            updateLegendVisibility();
            updateConnectivityBadge();
            autoLoadWeather();
            setInterval(autoLoadWeather, 5 * 60 * 1000);
            startUserLocationTracking();
            toast('GeoFastPe listo');
        });

        // Elimina los fill-extrusion del estilo base, PERO NUNCA el custom
        function removeBase3DLayers() {
            try {
                const layers = map.getStyle().layers || [];
                layers.forEach(layer => {
                    if (layer.type === 'fill-extrusion' && layer.id !== 'custom-3d-buildings') {
                        try { map.removeLayer(layer.id); } catch(e) {}
                    }
                });
            } catch(e) { console.warn('removeBase3DLayers:', e); }
        }

        // ============================================================
        // 4. BUILDERS DE ESTILO
        // ============================================================

        // CLARO: filtrado 2D puro
        async function buildLightStyle() {
            try {
                const resp = await fetch(STYLE_URLS.light);
                const style = await resp.json();
                style.layers = style.layers.filter(l => l.type !== 'fill-extrusion');
                return style;
            } catch(e) {
                console.error('buildLightStyle:', e);
                return STYLE_URLS.light;
            }
        }

        // OSCURO: 2D + paleta oscura
        async function buildDarkStyle() {
            const resp = await fetch(STYLE_URLS.light);
            const style = await resp.json();
            style.layers = style.layers.filter(l => l.type !== 'fill-extrusion');

            style.layers.forEach(layer => {
                const id = layer.id.toLowerCase();
                layer.paint = layer.paint || {};
                if (layer.type === 'background') {
                    layer.paint['background-color'] = '#0a1525';
                } else if (layer.type === 'fill') {
                    if (id.includes('water')) layer.paint['fill-color'] = '#0d2847';
                    else if (id.includes('park') || id.includes('grass') || id.includes('wood') || id.includes('forest'))
                        layer.paint['fill-color'] = '#0d1f2d';
                    else if (id.includes('building')) layer.paint['fill-color'] = '#1a2838';
                    else if (id.includes('land') || id.includes('residential') || id.includes('landuse') ||
                             id.includes('sand') || id.includes('ice') || id.includes('glacier'))
                        layer.paint['fill-color'] = '#0f1a26';
                } else if (layer.type === 'line') {
                    if (id.includes('water')) layer.paint['line-color'] = '#1e4a73';
                    else if (id.includes('motorway') || id.includes('trunk'))
                        layer.paint['line-color'] = '#e8eef4';
                    else if (id.includes('primary') || id.includes('secondary'))
                        layer.paint['line-color'] = '#d0d8e2';
                    else if (id.includes('tertiary') || id.includes('residential') ||
                             id.includes('service') || id.includes('road') ||
                             id.includes('highway') || id.includes('street') ||
                             id.includes('bridge') || id.includes('tunnel') ||
                             id.includes('path') || id.includes('track') ||
                             id.includes('pedestrian') || id.includes('footway') ||
                             id.includes('cycleway') || id.includes('living_street'))
                        layer.paint['line-color'] = '#b0b8c2';
                } else if (layer.type === 'symbol') {
                    if (layer.paint && layer.paint['text-color'] !== undefined) {
                        layer.paint['text-color'] = '#f0f4f8';
                        layer.paint['text-halo-color'] = '#0a1525';
                        layer.paint['text-halo-width'] = 1.5;
                    }
                }
            });
            return style;
        }

        // TRANSPORTE
        async function buildTransportStyle() {
            const resp = await fetch(STYLE_URLS.transport);
            const style = await resp.json();
            style.layers = style.layers.filter(l => l.type !== 'fill-extrusion');
            applyRoadColorsToStyle(style);
            return style;
        }

        // SATÉLITE
        async function buildSatelliteStyle() {
            try {
                const resp = await fetch(STYLE_URLS.transport);
                const bright = await resp.json();

                const roadHints = ['road', 'highway', 'street', 'motorway', 'trunk', 'primary',
                                    'secondary', 'tertiary', 'residential', 'service', 'path',
                                    'bridge', 'tunnel', 'pedestrian', 'cycleway', 'track'];
                const roadLayers = [];
                const labelLayers = [];

                bright.layers.forEach(layer => {
                    if (layer.type === 'line') {
                        const id = layer.id.toLowerCase();
                        if (roadHints.some(h => id.includes(h))) {
                            roadLayers.push(JSON.parse(JSON.stringify(layer)));
                        }
                    } else if (layer.type === 'symbol') {
                        labelLayers.push(layer);
                    }
                });

                const usedSources = new Set();
                [...roadLayers, ...labelLayers].forEach(l => { if (l.source) usedSources.add(l.source); });

                const sources = {
                    'satellite-imagery': {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256, maxzoom: 19,
                        attribution: 'Imagery © Esri'
                    }
                };
                usedSources.forEach(s => { if (bright.sources[s]) sources[s] = bright.sources[s]; });

                const satStyle = {
                    version: 8,
                    glyphs: bright.glyphs,
                    sprite: bright.sprite,
                    sources,
                    layers: [
                        { id: 'satellite-imagery-layer', type: 'raster', source: 'satellite-imagery' },
                        ...roadLayers,
                        ...labelLayers
                    ]
                };
                applyRoadColorsToStyle(satStyle);
                return satStyle;
            } catch (e) {
                console.error('buildSatelliteStyle:', e);
                return {
                    version: 8,
                    sources: { 'satellite-imagery': {
                        type: 'raster',
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256, maxzoom: 19
                    }},
                    layers: [{ id: 'satellite-imagery-layer', type: 'raster', source: 'satellite-imagery' }]
                };
            }
        }

        function applyRoadColorsToStyle(style) {
            style.layers.forEach(layer => {
                if (layer.type !== 'line') return;
                const id = layer.id.toLowerCase();
                const isCasing = id.includes('casing') || id.includes('outline');
                layer.paint = layer.paint || {};
                if (id.includes('motorway')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.motorway.casing : TRANSPORT_COLORS.motorway.fill;
                } else if (id.includes('trunk')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.trunk.casing : TRANSPORT_COLORS.trunk.fill;
                } else if (id.includes('primary')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.primary.casing : TRANSPORT_COLORS.primary.fill;
                } else if (id.includes('secondary')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.secondary.casing : TRANSPORT_COLORS.secondary.fill;
                } else if (id.includes('tertiary')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.tertiary.casing : TRANSPORT_COLORS.tertiary.fill;
                } else if (id.includes('residential') || id.includes('minor') || id.includes('service') || id.includes('living_street')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.residential.casing : TRANSPORT_COLORS.residential.fill;
                } else if (id.includes('pedestrian') || id.includes('path') || id.includes('footway') || id.includes('cycleway') || id.includes('track')) {
                    layer.paint['line-color'] = isCasing ? TRANSPORT_COLORS.path.casing : TRANSPORT_COLORS.path.fill;
                }
            });
        }

        // RELIEVE: liberty filtrado + hillshade + CUSTOM 3D EN EL MISMO JSON
        async function buildReliefStyle() {
            try {
                const response = await fetch(STYLE_URLS.light);
                const style = await response.json();

                // 1. Filtrar 3D base (para no duplicar)
                style.layers = style.layers.filter(l => l.type !== 'fill-extrusion');

                // 2. Añadir DEM
                style.sources['mapterhorn-dem'] = {
                    type: 'raster-dem',
                    url: DEM_URL,
                    tileSize: 256
                };

                // 3. Añadir hillshade antes del primer symbol
                const firstSymbolIndex = style.layers.findIndex(l => l.type === 'symbol');
                const hillshadeLayer = {
                    id: 'relief-hillshade',
                    type: 'hillshade',
                    source: 'mapterhorn-dem',
                    paint: {
                        'hillshade-exaggeration': 0.5,
                        'hillshade-shadow-color': '#5a4a3a',
                        'hillshade-highlight-color': '#ffffff',
                        'hillshade-accent-color': '#8a7a6a'
                    }
                };
                if (firstSymbolIndex !== -1) style.layers.splice(firstSymbolIndex, 0, hillshadeLayer);
                else style.layers.push(hillshadeLayer);

                // 4. AÑADIR EL CUSTOM 3D DIRECTAMENTE AL JSON (así no se pierde)
                let sourceName = 'openmaptiles';
                if (!style.sources[sourceName]) {
                    for (let s in style.sources) {
                        if (style.sources[s].type === 'vector') { sourceName = s; break; }
                    }
                }

                if (style.sources[sourceName]) {
                    const firstSymbol = style.layers.find(l => l.type === 'symbol');
                    const custom3DLayer = {
                        'id': 'custom-3d-buildings',
                        'source': sourceName,
                        'source-layer': 'building',
                        'type': 'fill-extrusion',
                        'minzoom': 14,
                        'paint': {
                            'fill-extrusion-color': [
                                'interpolate', ['linear'],
                                ['coalesce', ['get', 'render_height'], ['get', 'height'], 15],
                                0,   '#b8c0ca',
                                50,  '#9ca3af',
                                150, '#d1d5db'
                            ],
                            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], ['*', ['get', 'levels'], 3], 15],
                            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                            'fill-extrusion-opacity': 0.92,
                            'fill-extrusion-vertical-gradient': true
                        }
                    };

                    if (firstSymbol) {
                        const idx = style.layers.indexOf(firstSymbol);
                        style.layers.splice(idx, 0, custom3DLayer);
                    } else {
                        style.layers.push(custom3DLayer);
                    }
                }

                return style;
            } catch (e) {
                console.error('buildReliefStyle:', e);
                return STYLE_URLS.light;
            }
        }

        // ============================================================
        // 5. CAMBIO DE CAPA
        // ============================================================
        async function switchBaseLayer(layerName) {
            if (layerName === currentLayerName) return;
            currentLayerName = layerName;
            isDarkMode = (layerName === 'dark');

            const state = {
                center: map.getCenter(),
                zoom: map.getZoom(),
                bearing: map.getBearing(),
                pitch: (layerName === 'light' || layerName === 'dark') ? 0 : map.getPitch()
            };

            let newStyle;
            if (layerName === 'light') newStyle = await buildLightStyle();
            else if (layerName === 'dark') newStyle = await buildDarkStyle();
            else if (layerName === 'transport') newStyle = await buildTransportStyle();
            else if (layerName === 'satellite') newStyle = await buildSatelliteStyle();
            else if (layerName === 'relief') newStyle = await buildReliefStyle();

            const transform = (prev, next) => {
                next.center = [state.center.lng, state.center.lat];
                next.zoom = state.zoom;
                next.bearing = state.bearing;
                next.pitch = state.pitch;
                return next;
            };

            map.setStyle(newStyle, { transformStyle: transform });

            map.once('style.load', () => {
                map.once('idle', () => {
                    // Solo elimina 3D BASE (nunca el custom que viene en el JSON de relieve)
                    removeBase3DLayers();

                    if (layerName !== 'relief') disableTerrain();
                    if (layerName === 'relief') enableTerrain();

                    forceRecreateRadiusCircle();
                    createCenterPin();
                    updateServices();
                    updateLegendVisibility();

                    if (routeGeoJSON) redrawRoute();

                    // Re-aplicar nubes
                    if (currentWeatherData) {
                        try {
                            startClouds(
                                currentWeatherData.cloud_cover,
                                currentWeatherData.wind_direction_10m,
                                currentWeatherData.wind_speed_10m
                            );
                        } catch(e) { console.warn('Cloud reapply:', e); }
                    }
                });
            });

            toast(`Capa: ${layerName}`);
        }

        function enableTerrain() {
            if (!map.getSource('mapterhorn-dem')) {
                map.addSource('mapterhorn-dem', { type: 'raster-dem', url: DEM_URL, tileSize: 256 });
            }
            map.setTerrain({ source: 'mapterhorn-dem', exaggeration: 1.5 });
            terrainEnabled = true;
        }

        function disableTerrain() {
            if (terrainEnabled) {
                map.setTerrain(null);
                terrainEnabled = false;
            }
        }

        // ============================================================
        // 6. LEYENDA
        // ============================================================
        function updateLegendVisibility() {
            const legend = document.getElementById('transport-legend');
            if (currentLayerName === 'transport' || currentLayerName === 'satellite') legend.classList.add('show');
            else legend.classList.remove('show');
        }

        // ============================================================
        // 7. PIN
        // ============================================================
        function pinSVG(color) {
            return `<svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2C9 2 2 9 2 18C2 28 18 46 18 46C18 46 34 28 34 18C34 9 27 2 18 2Z" fill="${color}" stroke="white" stroke-width="2.5"/>
                <circle cx="18" cy="18" r="6" fill="white"/>
            </svg>`;
        }

        function createCenterPin() {
            if (centerPin) centerPin.remove();
            const el = document.createElement('div');
            el.className = 'user-pin-svg';
            el.innerHTML = pinSVG('#3b82f6');
            el.title = 'Arrastra para cambiar de zona';

            centerPin = new maplibregl.Marker({ element: el, draggable: true, anchor: 'bottom' })
                .setLngLat([currentCenter.lng, currentCenter.lat])
                .addTo(map);

            centerPin.on('dragend', () => {
                followUser = false;
                const pos = centerPin.getLngLat();
                currentCenter = { lat: pos.lat, lng: pos.lng };
                currentCityName = 'Zona personalizada';
                addRadiusCircle();
                updateServices();
                autoLoadWeather();
                toast(`Zona: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
            });
        }

        // ============================================================
        // 8. CÍRCULO
        // ============================================================
        function createGeoJSONCircle(center, radiusInKm, points = 512) {
            const coords = { latitude: center[1], longitude: center[0] };
            const ret = [];
            const dx = radiusInKm / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
            const dy = radiusInKm / 110.574;
            for (let i = 0; i < points; i++) {
                const theta = (i / points) * (2 * Math.PI);
                ret.push([coords.longitude + dx * Math.cos(theta), coords.latitude + dy * Math.sin(theta)]);
            }
            ret.push(ret[0]);
            return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ret] } };
        }

        function forceRecreateRadiusCircle() {
            ['radius-line', 'radius-line-outer', 'radius-fill'].forEach(id => {
                if (map.getLayer(id)) map.removeLayer(id);
            });
            if (map.getSource('radius-circle')) map.removeSource('radius-circle');
            addRadiusCircle();
        }

        function addRadiusCircle() {
            const geojson = createGeoJSONCircle([currentCenter.lng, currentCenter.lat], currentRadius / 1000, 512);

            if (map.getSource('radius-circle')) {
                map.getSource('radius-circle').setData(geojson);
                if (map.getLayer('radius-line')) {
                    try { map.setPaintProperty('radius-line', 'line-dasharray', null); } catch(e) {}
                }
                if (map.getLayer('radius-line-outer')) {
                    try { map.setPaintProperty('radius-line-outer', 'line-dasharray', null); } catch(e) {}
                }
            } else {
                map.addSource('radius-circle', { type: 'geojson', data: geojson });
                const fillColor = isDarkMode ? '#60a5fa' : '#3b82f6';
                const lineOuterColor = '#93c5fd';
                const lineMainColor = isDarkMode ? '#bfdbfe' : '#1e40af';

                map.addLayer({
                    id: 'radius-fill', type: 'fill', source: 'radius-circle',
                    paint: { 'fill-color': fillColor, 'fill-opacity': 0.18 }
                });
                map.addLayer({
                    id: 'radius-line-outer', type: 'line', source: 'radius-circle',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': lineOuterColor,
                        'line-width': 6, 'line-opacity': 0.45 }
                });
                map.addLayer({
                    id: 'radius-line', type: 'line', source: 'radius-circle',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': lineMainColor, 'line-width': 6, 'line-opacity': 0.45 }
                });
            }
        }

        // ============================================================
        // 9. MARCADORES
        // ============================================================
        let markers = [];
function tipoDePuntos() {
    if (isEmergencyMode || selectedServiceCategory === 'Emergencia')
        return 'EMERGENCIA';

    if (selectedServiceCategory === 'Servicios')
        return 'SERVICIO';

    if (selectedServiceCategory === 'Ventas')
        return 'VENTA';

    if (selectedServiceCategory === 'Solidaridad')
        return 'SOLIDARIDAD';

    if (selectedServiceCategory === 'Reportes')
        return 'REPORTE';

    if (selectedServiceCategory === 'Eventos')
        return 'EVENTO';

    if (
        selectedServiceCategory === 'Todos' ||
        selectedServiceCategory === 'Inicio' ||
        selectedServiceCategory === 'Mapa Vecinal'
    )
        return null;

    return 'NINGUNO';
}
        
        // ============================================================
        // 9.1. ICONOS SEGUN EL TIPO DE PUNTO
        // ============================================================
        function normalizeLabel(value) {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        }

        function getEmergencyIcon(type) {
            const value = normalizeLabel(type);
            if (value.includes('incendio') || value.includes('fuego')) return 'flame';
            if (value.includes('accidente') || value.includes('choque')) return 'car';
            if (value.includes('medica') || value.includes('salud')) return 'ambulance';
            if (value.includes('inundacion')) return 'waves';
            if (value.includes('robo') || value.includes('asalto')) return 'siren';
            if (value.includes('sismo') || value.includes('terremoto')) return 'building';
            return 'alert';
        }

        function getServiceIcon(type) {
            const value = normalizeLabel(type);
            if (value.includes('electric')) return 'zap';
            if (value.includes('gasfiter') || value.includes('plomer')) return 'wrench';
            if (value.includes('comput') || value.includes('tecnolog')) return 'laptop';
            if (value.includes('limpieza')) return 'sparkles';
            if (value.includes('carpinter')) return 'hammer';
            if (value.includes('jardiner')) return 'sprout';
            if (value.includes('educacion') || value.includes('clases')) return 'book';
            return 'wrench';
        }


function makePointMarker(point) {
    const colors = {
    SERVICIO: '#10b981',
    EMERGENCIA: '#ef4444',
    VENTA: '#f59e0b',
    SOLIDARIDAD: '#8b5cf6',
    REPORTE: '#0ea5e9',
    EVENTO: '#8b5cf6'
    };

    const kind = String(point.kind || '').toUpperCase();
    const color = colors[kind] || '#3b82f6';

    const el = document.createElement('div');
    let icono = 'pin';
    let nombreTipo = 'Punto comunitario';

    // ==========================================
    // EMERGENCIAS
    // ==========================================
    if (kind === 'EMERGENCIA') {
        icono = getEmergencyIcon(point.type);
        nombreTipo = 'Emergencia';

        // TODO: Mostrar nivel de urgencia.
        // TODO: Diferenciar emergencias activas y resueltas.

    // ==========================================
    // SERVICIOS
    // ==========================================
    } else if (kind === 'SERVICIO') {
        icono = getServiceIcon(
            point.category ||
            point.serviceCategory ||
            point.type
        );
        nombreTipo = 'Servicio';

        // TODO: Obtener la categoría específica del backend.
        // TODO: Mostrar disponibilidad del servicio.

    // ==========================================
    // VENTAS
    // ==========================================
    } else if (kind === 'VENTA') {
        icono = 'bag';
        nombreTipo = 'Venta';

        // TODO: Mostrar precio y estado del producto.
        // TODO: Abrir detalle del producto al hacer clic.

    // ==========================================
    // SOLIDARIDAD
    // ==========================================
    } else if (kind === 'SOLIDARIDAD') {
        icono = 'heart';
        nombreTipo = 'Solidaridad';

        // TODO: Diferenciar donaciones y solicitudes de ayuda.
        // TODO: Mostrar estado de la publicación.
        // TODO: Abrir detalle de la publicación.
    } else if (kind === 'EVENTO') {
        icono = 'calendar';
        nombreTipo = 'Evento';
    } else if (kind === 'REPORTE') {
        icono = 'flag';
        nombreTipo = 'Reporte';
    }

    // ==========================================
    // DISEÑO DEL MARCADOR
    // ==========================================
    el.innerHTML = iconMarkup(icono, color);

    el.style.cssText = `
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 2.5px solid ${color};
        border-radius: 50%;
        font-size: 19px;
        line-height: 1;
        box-shadow: 0 3px 10px rgba(0,0,0,0.22);
        cursor: pointer;
    `;

    el.setAttribute(
        'aria-label',
        `${nombreTipo}: ${point.title || point.type || 'Punto'}`
    );

    // TODO: Añadir una leyenda de íconos al mapa.
    // TODO: Incorporar filtros por subcategoría.
    // TODO: Agrupar marcadores cuando existan muchos puntos.
    // TODO: Añadir indicadores accesibles de prioridad.

    return el;
}


        // Evita insertar texto recibido del backend directamente como HTML.
        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }

        function makePointPopup(point) {
            const kindNames = { SERVICIO: 'Servicio', EMERGENCIA: 'Emergencia', VENTA: 'Venta', SOLIDARIDAD: 'Solidaridad', EVENTO: 'Evento', REPORTE: 'Reporte' };
            const type = kindNames[String(point.kind || '').toUpperCase()] || 'Publicación';
            const rows = [];
            if (point.category) rows.push(`<div><b>Categoría:</b> ${escapeHtml(point.category)}</div>`);
            if (point.type) rows.push(`<div><b>Tipo:</b> ${escapeHtml(point.type)}</div>`);
            if (point.description) rows.push(`<div><b>Descripción:</b> ${escapeHtml(point.description)}</div>`);
            if (point.location) rows.push(`<div><b>Ubicación:</b> ${escapeHtml(point.location)}</div>`);
            if (point.status) rows.push(`<div><b>Estado:</b> ${escapeHtml(point.status)}</div>`);
            if (point.priority) rows.push(`<div><b>Prioridad:</b> ${escapeHtml(point.priority)}</div>`);
            if (point.ownerName) rows.push(`<div><b>Publicado por:</b> ${escapeHtml(point.ownerName)}</div>`);
            if (point.date) rows.push(`<div><b>Fecha:</b> ${escapeHtml(point.date)}${point.time ? ` · ${escapeHtml(point.time)}` : ''}</div>`);
            rows.push(`<div><b>Distancia:</b> ${(Number(point.distance || 0) / 1000).toFixed(2)} km</div>`);
            const content = `<div style="font-family:inherit;max-width:280px;line-height:1.45"><strong style="font-size:15px">${escapeHtml(point.title || 'Punto comunitario')}</strong><div style="color:#7c3aed;font-size:11px;font-weight:700;margin:3px 0 8px">${type}</div>${rows.map(r => `<div style="font-size:12px;margin:3px 0">${r}</div>`).join('')}</div>`;
            return new maplibregl.Popup({ offset: 18, maxWidth: '320px' }).setHTML(content);
        }

        function mapCacheKey() {
            return `geofastpe_map_${currentCenter.lat.toFixed(3)}_${currentCenter.lng.toFixed(3)}_${currentRadius}_${selectedServiceCategory}`;
        }

        function readMapCache() {
            try {
                const global = JSON.parse(localStorage.getItem('geofastpe_map_all_v1') || 'null');
                if (Array.isArray(global?.points) && global.points.length) return global.points;
                const raw = localStorage.getItem(mapCacheKey());
                return raw ? JSON.parse(raw).points || [] : [];
            } catch { return []; }
        }

        function writeMapCache(points) {
            try {
                const previous = JSON.parse(localStorage.getItem('geofastpe_map_all_v1') || 'null')?.points || [];
                const merged = new Map();
                [...previous, ...(Array.isArray(points) ? points : [])].forEach(point => {
                    const key = point.id != null ? String(point.id) : `${point.kind || point.type || ''}:${point.lat}:${point.lng}:${point.title || ''}`;
                    merged.set(key, point);
                });
                const saved = [...merged.values()];
                localStorage.setItem('geofastpe_map_all_v1', JSON.stringify({ savedAt: Date.now(), points: saved }));
                localStorage.setItem(mapCacheKey(), JSON.stringify({ savedAt: Date.now(), points: saved }));
            } catch {}
        }

        function mergePendingOfflinePoints(points) {
            try {
                const queue = JSON.parse(localStorage.getItem('geofastpe_offline_queue') || '[]');
                for (const item of queue) {
                    const b = item.body || {};
                    let kind = null;
                    if (String(item.endpoint || '').startsWith('/servicios')) kind = 'SERVICIO';
                    if (String(item.endpoint || '').startsWith('/eventos')) kind = 'EVENTO';
                    if (String(item.endpoint || '').startsWith('/reportes')) kind = 'REPORTE';
                    if (String(item.endpoint || '').startsWith('/ventas')) kind = 'VENTA';
                    if (String(item.endpoint || '').startsWith('/emergencias')) kind = 'EMERGENCIA';
                    if (String(item.endpoint || '').startsWith('/solidaridad')) kind = 'SOLIDARIDAD';
                    if (!kind || !Number.isFinite(Number(b.lat ?? b.latitude)) || !Number.isFinite(Number(b.lng ?? b.longitude))) continue;
                    const lat = Number(b.lat ?? b.latitude), lng = Number(b.lng ?? b.longitude);
                    if (calcDist(currentCenter.lat,currentCenter.lng,lat,lng) > currentRadius) continue;
                    points.push({ kind, id:`offline-${item.queuedAt}`, title:b.title || b.name || 'Publicación pendiente', category:b.category, type:b.type, description:b.description, lat, lng, distance:calcDist(currentCenter.lat,currentCenter.lng,lat,lng), location:b.location || b.address, status:'Pendiente de sincronización', priority:b.priority, ownerName:'Este dispositivo', image:b.image, date:b.date, time:b.time });
                }
            } catch {}
            return points;
        }

        function renderMapPoints(points) {
            servicesData = points.map(p => ({ ...p, name: p.title }));
            markers.forEach(m => m.remove());
            markers = [];
            servicesData.forEach(point => {
                const lat = Number(point.lat), lng = Number(point.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
                const el = makePointMarker(point);
                markers.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).setPopup(makePointPopup(point)).addTo(map));
            });
            window.dispatchEvent(new CustomEvent('geofastpe:services', { detail: { count: servicesData.length, radius: currentRadius, category: selectedServiceCategory, services: servicesData } }));
        }

        async function updateServices() {
            const tipo = tipoDePuntos();
            const seq = ++puntosSeq;
            let puntos = [];
            if (tipo !== 'NINGUNO') {
                try {
                    const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng, radio: currentRadius });
                    if (tipo) params.set('tipo', tipo);
                    const url = `${API_BASE}/mapa/puntos?${params}`;
                    if (!navigator.onLine) {
                        puntos = readMapCache();
                    } else {
                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        puntos = await res.json();
                        if (!Array.isArray(puntos)) throw new Error('Respuesta de puntos invalida');
                        writeMapCache(puntos);
                    }
                } catch (e) {
                    puntos = readMapCache();
                    if (!puntos.length) console.warn('No se pudieron cargar los puntos del mapa:', e);
                }
            }
            if (seq !== puntosSeq) return;
            puntos = mergePendingOfflinePoints(puntos);
            renderMapPoints(puntos);
            toast(`${servicesData.length} puntos en radio${navigator.onLine ? '' : ' · sin conexión'}`);
        }

        // ============================================================
        // 10. SELECTOR DE CAPAS
        // ============================================================
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layer = btn.dataset.layer;
                if (btn.classList.contains('active')) return;
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchBaseLayer(layer);
            });
        });

        // ============================================================
        // 11. CONTROL DE ROTACIÓN
        // ============================================================
        const compassEl = document.getElementById('rotation-compass');
        const compassArrow = document.getElementById('compass-arrow');
        const rotationValue = document.getElementById('rotation-value');
        let isDraggingCompass = false;
        let dragStartAngle = 0;
        let dragStartBearing = 0;

        function updateCompass() {
            const bearing = map.getBearing();
            compassArrow.style.transform = `rotate(${-bearing}deg)`;
            rotationValue.innerText = `${Math.round(bearing)}°`;
        }
        map.on('rotate', updateCompass);
        map.on('rotateend', updateCompass);
        updateCompass();

        compassEl.addEventListener('mousedown', (e) => {
            isDraggingCompass = true;
            compassEl.style.cursor = 'grabbing';
            const rect = compassEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            dragStartAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
            dragStartBearing = map.getBearing();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingCompass) return;
            const rect = compassEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
            map.setBearing(dragStartBearing + (currentAngle - dragStartAngle));
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingCompass) {
                isDraggingCompass = false;
                compassEl.style.cursor = 'grab';
            }
        });

        compassEl.addEventListener('click', () => {
            if (isDraggingCompass) return;
            map.easeTo({ bearing: 0, duration: 600 });
            toast('Norte restablecido');
        });

        map.touchZoomRotate.enableRotation();
        map.dragRotate.enable();

        // ============================================================
        // 12. INTERFAZ
        // ============================================================
        document.getElementById('city-selector')?.addEventListener('change', (e) => {
            const city = CITIES[e.target.value];
            followUser = false;
            currentCenter = { lat: city.lat, lng: city.lng };
            currentCityName = city.name;
            map.flyTo({ center: [city.lng, city.lat], zoom: city.zoom });
            if (centerPin) centerPin.setLngLat([city.lng, city.lat]);
            if (searchMarker) { searchMarker.remove(); searchMarker = null; }
            setTimeout(() => {
                addRadiusCircle(); updateServices();
                autoLoadWeather();
            }, 1200);
        });

        document.getElementById('btn-3d')?.addEventListener('click', () => {
            is3DMode = !is3DMode;
            document.getElementById('btn-3d').classList.toggle('active', is3DMode);
            map.easeTo({ pitch: is3DMode ? 60 : 0, bearing: map.getBearing(), duration: 800 });
            toast(is3DMode ? 'Vista 3D' : 'Vista 2D');
        });

        // ============================================================
        // 13. UBICACIÓN DEL USUARIO (GPS en tiempo real)
        // ============================================================

        // Distancia aproximada entre dos coordenadas (haversine, metros).
        function distanceMeters(a, b) {
            const R = 6371000;
            const toRad = (deg) => deg * Math.PI / 180;
            const dLat = toRad(b.lat - a.lat);
            const dLng = toRad(b.lng - a.lng);
            const lat1 = toRad(a.lat);
            const lat2 = toRad(b.lat);
            const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(h));
        }

        function updateUserMarker(lat, lng, accuracy) {
            if (!userLocationMarker) {
                const el = document.createElement('div');
                el.className = 'user-location-marker';
                el.title = 'Tu ubicación';
                el.innerHTML = '<span class="user-location-pulse"></span><span class="user-location-dot"></span>';
                userLocationMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([lng, lat])
                    .addTo(map);
            } else {
                userLocationMarker.setLngLat([lng, lat]);
            }

            if (!(accuracy > 0)) return;
            const circle = createGeoJSONCircle([lng, lat], accuracy / 1000, 64);
            if (map.getSource('user-accuracy')) {
                map.getSource('user-accuracy').setData(circle);
            } else {
                map.addSource('user-accuracy', { type: 'geojson', data: circle });
                map.addLayer({
                    id: 'user-accuracy-fill', type: 'fill', source: 'user-accuracy',
                    paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.14 }
                });
                map.addLayer({
                    id: 'user-accuracy-line', type: 'line', source: 'user-accuracy',
                    paint: { 'line-color': '#2563eb', 'line-width': 1.5, 'line-opacity': 0.4 }
                });
            }
        }

        // Aplica una lectura GPS: mueve el marcador y, si el seguimiento está activo,
        // actualiza el centro de búsqueda (puntos, radio, clima y origen de rutas).
        function applyUserPosition(position, { forceCenter = false, forceRefresh = false } = {}) {
            const { latitude: lat, longitude: lng, accuracy = 0 } = position.coords || {};
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            userLocation = { lat, lng, accuracy, updatedAt: Date.now() };
            lastGeoError = null;
            updateUserMarker(lat, lng, accuracy);

            const meters = Math.round(accuracy || 0);
            setGpsStatus(
                accuracy > 500
                    ? `Ubicación aproximada · ±${meters} m`
                    : `GPS activo${meters ? ` · ±${meters} m` : ''}`,
                accuracy > 500 ? 'warn' : 'ok'
            );

            if (!followUser) return;

            const moved = lastUserFix ? distanceMeters(lastUserFix, userLocation) : Infinity;
            const previousCenter = { ...currentCenter };
            lastUserFix = { lat, lng };
            currentCenter = { lat, lng };
            currentCityName = 'Mi ubicación';
            if (centerPin) centerPin.setLngLat([lng, lat]);

            // Mientras el seguimiento esté activo el mapa acompaña al usuario,
            // incluso cuando una nueva lectura GPS corrige la posición.
            const centerDistance = distanceMeters(previousCenter, { lat, lng });
            const shouldCenter = forceCenter || !userCenteredOnce || centerDistance > 10;
            if (shouldCenter) {
                const targetZoom = Math.max(map.getZoom(), 15);
                // easeTo es inmediato y predecible; flyTo puede tardar varios
                // segundos en distancias largas y parecer que no hace nada.
                map.easeTo(
                    forceCenter || !userCenteredOnce
                        ? { center: [lng, lat], zoom: targetZoom, duration: 1100 }
                        : { center: [lng, lat], duration: 700 }
                );
                userCenteredOnce = true;
            }

            if (forceRefresh || moved > 25) addRadiusCircle();

            const now = Date.now();
            if (forceRefresh || moved > 100 || now - lastAreaRefreshAt > 60000) {
                lastAreaRefreshAt = now;
                updateServices();
                autoLoadWeather();
            }

            if (shouldCenter) {
                toast(
                    accuracy > 500
                        ? `Ubicación aproximada · precisión ±${meters} m. Activa la ubicación de Windows.`
                        : `Ubicación actualizada${meters ? ` · precisión ±${meters} m` : ''}`
                );
            }
        }

        function handleGeolocationError(error) {
            const messages = {
                1: 'Bloqueaste la ubicación. Habilítala en el candado del navegador.',
                2: 'Ubicación no disponible. Activa la ubicación de Windows.',
                3: 'No se pudo obtener la ubicación a tiempo'
            };
            lastGeoError = {
                code: error?.code || 0,
                message: messages[error?.code] || error?.message || 'desconocido',
                at: Date.now()
            };
            setGpsStatus(
                error?.code === 1
                    ? 'Ubicación bloqueada · actívala en el navegador'
                    : 'Sin GPS · se usará ubicación aproximada',
                'error'
            );
            toast(messages[error?.code] || 'No se pudo obtener tu ubicación');
            if (error?.code === 1 && userWatchId !== null) {
                navigator.geolocation.clearWatch(userWatchId);
                userWatchId = null;
            }
        }

        // Mantiene la ubicación actualizada mientras el usuario se desplaza.
        function startUserLocationTracking() {
            if (!('geolocation' in navigator) || userWatchId !== null) return;
            if (!window.isSecureContext) {
                setGpsStatus('Abre la app en localhost o HTTPS para usar el GPS', 'error');
                return;
            }
            if (!userLocation) setGpsStatus('Buscando señal GPS…', 'pending');
            userWatchId = navigator.geolocation.watchPosition(
                (position) => applyUserPosition(position),
                handleGeolocationError,
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
        }

        // Escucha varias lecturas y devuelve la de mejor precisión dentro de una
        // ventana corta. Así el navegador tiene tiempo de refinar la posición
        // (WiFi/GPS) en lugar de quedarse con la primera lectura, que suele ser
        // imprecisa o provenir de la red.
        function getBestUserPosition({ timeoutMs = 12000, targetAccuracy = 30, highAccuracy = true } = {}) {
            if (!('geolocation' in navigator) || !window.isSecureContext) {
                return Promise.reject(Object.assign(new Error('Geolocalización no disponible'), { code: 2 }));
            }
            const cached = userLocation;
            if (
                cached && !cached.approximate && cached.accuracy > 0 &&
                cached.accuracy <= targetAccuracy && Date.now() - cached.updatedAt < 15000
            ) {
                return Promise.resolve({
                    coords: { latitude: cached.lat, longitude: cached.lng, accuracy: cached.accuracy }
                });
            }
            return new Promise((resolve, reject) => {
                let best = null;
                let lastError = null;
                let settled = false;
                let watchId = null;
                let timer = null;
                let softTimer = null;

                const finish = (result, error) => {
                    if (settled) return;
                    settled = true;
                    if (timer) clearTimeout(timer);
                    if (softTimer) clearTimeout(softTimer);
                    if (watchId !== null) {
                        try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
                        watchId = null;
                    }
                    if (result) resolve(result);
                    else reject(error || lastError || Object.assign(new Error('Ubicación no disponible'), { code: 2 }));
                };

                timer = setTimeout(() => {
                    finish(best, best ? null : Object.assign(new Error('Tiempo de espera agotado'), { code: 3 }));
                }, timeoutMs);

                // Si en 4 s ya hay alguna lectura, se usa la mejor disponible; si la
                // precisión mejora antes, se resuelve de inmediato.
                softTimer = setTimeout(() => { if (best) finish(best); }, 4000);

                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const accuracy = Number(position.coords?.accuracy ?? Infinity);
                        if (!best || accuracy < Number(best.coords?.accuracy ?? Infinity)) best = position;
                        if (accuracy > 0 && accuracy <= targetAccuracy) finish(best);
                    },
                    (error) => {
                        lastError = error;
                        if (error?.code === 1) finish(null, error);
                    },
                    { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: 0 }
                );
            });
        }

        // Respaldo cuando el navegador no puede dar GPS: ubicación aproximada por IP.
        async function fetchApproximateLocation() {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            try {
                const response = await fetch('https://ipwho.is/?fields=success,latitude,longitude,city', {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (!data?.success || !Number.isFinite(Number(data.latitude)) || !Number.isFinite(Number(data.longitude))) {
                    throw new Error('Sin coordenadas');
                }
                return { lat: Number(data.latitude), lng: Number(data.longitude), city: data.city || '' };
            } finally {
                clearTimeout(timer);
            }
        }

        function applyApproximateLocation(approx) {
            followUser = true;
            userCenteredOnce = true;
            lastUserFix = { lat: approx.lat, lng: approx.lng };
            userLocation = { lat: approx.lat, lng: approx.lng, accuracy: 0, approximate: true, updatedAt: Date.now() };
            updateUserMarker(approx.lat, approx.lng, 0);
            setGpsStatus('Ubicación aproximada por IP · activa la ubicación de Windows', 'warn');
            currentCenter = { lat: approx.lat, lng: approx.lng };
            currentCityName = approx.city ? `${approx.city} (aprox.)` : 'Ubicación aproximada';
            if (centerPin) centerPin.setLngLat([approx.lng, approx.lat]);
            map.easeTo({ center: [approx.lng, approx.lat], zoom: 12, duration: 1100 });
            addRadiusCircle();
            lastAreaRefreshAt = Date.now();
            updateServices();
            autoLoadWeather();
        }

        // Recentra el mapa en la ubicación real y reactiva el seguimiento.
        async function locateMe({ silent = false } = {}) {
            if (!silent) {
                toast('Obteniendo ubicación...');
                setGpsStatus('Buscando señal GPS…', 'pending');
            }

            let position = null;
            let reason = '';
            if ('geolocation' in navigator && window.isSecureContext) {
                try {
                    // Primero alta precisión: espera hasta 12 s para que el navegador
                    // combine GPS/WiFi y entregue la lectura más exacta.
                    position = await getBestUserPosition({ timeoutMs: 12000, targetAccuracy: 30, highAccuracy: true });
                } catch (firstError) {
                    const retryable = firstError?.code === 2 || firstError?.code === 3;
                    if (retryable) {
                        try {
                            // Reintento de baja precisión (red/WiFi), sin exigir exactitud.
                            position = await getBestUserPosition({ timeoutMs: 10000, targetAccuracy: 1000, highAccuracy: false });
                        } catch (retryError) {
                            handleGeolocationError(retryError);
                            reason = retryError?.message || 'GPS no disponible';
                        }
                    } else {
                        handleGeolocationError(firstError);
                        reason = firstError?.message || 'permiso denegado';
                    }
                }
            } else {
                reason = 'el GPS requiere localhost o HTTPS';
                setGpsStatus('Abre la app en localhost o HTTPS para usar el GPS', 'error');
            }

            if (position) {
                followUser = true;
                userCenteredOnce = false;
                applyUserPosition(position, { forceCenter: true, forceRefresh: true });
                startUserLocationTracking();
                return { ...userLocation };
            }

            // Último recurso: ubicación aproximada por IP para que el mapa no quede en Lima.
            try {
                const approx = await fetchApproximateLocation();
                applyApproximateLocation(approx);
                if (!silent) toast(`Ubicación aproximada${approx.city ? `: ${approx.city}` : ''}${reason ? ` (${reason})` : ''}`);
                return { ...userLocation };
            } catch (fallbackError) {
                lastGeoError = lastGeoError || {
                    code: 0,
                    message: 'No se pudo obtener tu ubicación',
                    at: Date.now()
                };
                setGpsStatus('No se pudo obtener tu ubicación', 'error');
                if (!silent) {
                    toast('No se pudo obtener tu ubicación. Revisa el permiso del navegador y la ubicación de Windows.');
                }
                return userLocation ? { ...userLocation } : null;
            }
        }

        // Al desplazar el mapa manualmente se deja de seguir al usuario para no
        // "arrastrar" el centro de búsqueda fuera de la vista. El botón GPS lo reactiva.
        map.on('dragstart', () => { followUser = false; });

        document.getElementById('btn-gps')?.addEventListener('click', () => {
            locateMe().catch(() => {});
        });

        window.addEventListener('beforeunload', () => {
            if (userWatchId !== null) {
                navigator.geolocation.clearWatch(userWatchId);
                userWatchId = null;
            }
        });

        // ============================================================
        // 14. RUTAS CON MODOS (Auto / A pie / Bici)
        // ============================================================
        document.getElementById('btn-route')?.addEventListener('click', () => {
            routingMode = !routingMode;
            document.getElementById('route-modes').classList.toggle('show', routingMode);
            map.getCanvas().style.cursor = routingMode ? 'crosshair' : '';
            if (routingMode) {
                toast('Elige modo y haz clic en el destino');
            } else {
                ['route-line', 'route-line-casing'].forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
                if (map.getSource('route-source')) map.removeSource('route-source');
                routeGeoJSON = null;
                if (routeDestinationMarker) { routeDestinationMarker.remove(); routeDestinationMarker = null; }
                lastRouteDestination = null;
            }
        });

        async function fetchRouteData(origin, destination) {
            const params = new URLSearchParams({
                modo: currentRouteMode,
                origenLat: origin.lat, origenLng: origin.lng,
                destinoLat: destination.lat, destinoLng: destination.lng
            });
            try {
                const response = await fetch(`${API_BASE}/geo/ruta?${params}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json();
                if (result?.geometry?.coordinates?.length) return result;
            } catch (error) { console.warn('Ruta backend no disponible; se intenta el servicio de rutas público.', error); }
            const url = `${ROUTE_URLS[currentRouteMode]}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Servicio de rutas: HTTP ${response.status}`);
            const payload = await response.json();
            const route = payload.routes?.[0];
            if (!route?.geometry?.coordinates?.length) throw new Error('No se encontró una ruta.');
            return { geometry: route.geometry, distanceMeters: route.distance, durationSeconds: route.duration };
        }

        async function recalculateLastRoute() {
            if (!lastRouteDestination || !navigator.onLine) return;
            try {
                const data = await fetchRouteData(currentCenter, lastRouteDestination);
                routeGeoJSON = data.geometry;
                redrawRoute();
                if (map.getLayer('route-line')) map.setPaintProperty('route-line', 'line-color', getRouteColor());
                toast(`Ruta recalculada · ${(Number(data.distanceMeters)/1000).toFixed(1)} km · ${Math.round(Number(data.durationSeconds)/60)} min`);
            } catch { toast('No se pudo recalcular la ruta'); }
        }
        document.querySelectorAll('.route-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.route-mode').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRouteMode = btn.dataset.mode;
                const labels = { driving: 'Auto', walking: 'A pie', cycling: 'Bici' };
                toast(`Modo: ${labels[currentRouteMode]}`);
                recalculateLastRoute();
            });
        });

        function redrawRoute() {
            if (!routeGeoJSON) return;
            if (map.getSource('route-source')) {
                map.getSource('route-source').setData(routeGeoJSON);
            } else {
                map.addSource('route-source', { type: 'geojson', data: routeGeoJSON });
                map.addLayer({
                    id: 'route-line-casing', type: 'line', source: 'route-source',
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.9 }
                });
                map.addLayer({
                    id: 'route-line', type: 'line', source: 'route-source',
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: { 'line-color': getRouteColor(), 'line-width': 6, 'line-opacity': 0.95 }
                });
            }
        }

        function getRouteColor() {
            if (currentRouteMode === 'walking') return '#10b981';
            if (currentRouteMode === 'cycling') return '#8b5cf6';
            return '#3b82f6';
        }

        map.on('click', async (e) => {
            if (!routingMode) return;
            const destLng = e.lngLat.lng;
            const destLat = e.lngLat.lat;
            lastRouteDestination = { lat: destLat, lng: destLng };
            if (routeDestinationMarker) routeDestinationMarker.remove();
            const destinationElement = document.createElement('div');
            destinationElement.style.cssText = 'width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#e11d48;box-shadow:0 2px 10px #1118;';
            routeDestinationMarker = new maplibregl.Marker({ element: destinationElement, anchor: 'center' })
                .setLngLat([destLng, destLat]).addTo(map);
            toast('Calculando ruta...');
            try {
                const routeKey = `geofastpe_route_${currentRouteMode}_${currentCenter.lat.toFixed(4)}_${currentCenter.lng.toFixed(4)}_${destLat.toFixed(4)}_${destLng.toFixed(4)}`;
                let data = null;
                if (!navigator.onLine) {
                    try { data = JSON.parse(localStorage.getItem(routeKey) || 'null'); } catch {}
                    if (!data) throw new Error('offline-route');
                } else {
                    data = await fetchRouteData(currentCenter, lastRouteDestination);
                    try { localStorage.setItem(routeKey, JSON.stringify(data)); } catch {}
                }
                if (data.geometry) {
                    routeGeoJSON = data.geometry;
                    const dist = (data.distanceMeters / 1000).toFixed(1);
                    const dur = Math.round(data.durationSeconds / 60);
                    redrawRoute();

                    // Actualizar color según modo
                    if (map.getLayer('route-line')) {
                        map.setPaintProperty('route-line', 'line-color', getRouteColor());
                    }

                    const labels = { driving: 'Auto', walking: 'A pie', cycling: 'Bicicleta' };
                    toast(`${labels[currentRouteMode]}: ${dist} km · ${dur} min`);

                    const coords = routeGeoJSON.coordinates;
                    const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
                    map.fitBounds(bounds, { padding: 80 });
                } else toast('No se pudo calcular');
            } catch (err) { toast('Error de ruta'); }
        });

        // ============================================================
        // 15. BÚSQUEDA
        // ============================================================
        function distanceBetween(a, b) {
            const rad = v => v * Math.PI / 180;
            const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
            const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
            return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
        }

        async function routeToCoordinates(lat, lng, label = 'Destino') {
            const destination = { lat: Number(lat), lng: Number(lng) };
            if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) throw new Error('Coordenadas no válidas');
            lastRouteDestination = destination;
            if (routeDestinationMarker) routeDestinationMarker.remove();
            const markerEl = document.createElement('div');
            markerEl.style.cssText = 'width:19px;height:19px;border:3px solid #fff;border-radius:50%;background:#e11d48;box-shadow:0 2px 10px #1118;';
            routeDestinationMarker = new maplibregl.Marker({ element: markerEl, anchor: 'center' }).setLngLat([destination.lng, destination.lat]).addTo(map);
            toast(`Calculando ruta a ${label}...`);
            const key = `geofastpe_route_${currentRouteMode}_${currentCenter.lat.toFixed(4)}_${currentCenter.lng.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}`;
            let data = null;
            if (!navigator.onLine) {
                try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
                if (!data) throw new Error('No hay una ruta guardada para este destino sin conexión.');
            } else {
                data = await fetchRouteData(currentCenter, destination);
                try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
            }
            routeGeoJSON = data.geometry;
            redrawRoute();
            if (map.getLayer('route-line')) map.setPaintProperty('route-line', 'line-color', getRouteColor());
            const coords = routeGeoJSON.coordinates;
            const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
            map.fitBounds(bounds, { padding: { top: 100, bottom: 100, left: 90, right: 90 } });
            const km = (Number(data.distanceMeters || 0) / 1000).toFixed(1);
            const min = Math.round(Number(data.durationSeconds || 0) / 60);
            toast(`Ruta a ${label}: ${km} km · ${min} min`);
            return { distanceMeters: data.distanceMeters, durationSeconds: data.durationSeconds };
        }

        async function routeToPlace(query) {
            const q = String(query || '').trim();
            if (!q) throw new Error('Indica el destino.');
            let places = [];
            if (navigator.onLine) {
                try {
                    const response = await fetch(`${API_BASE}/geo/buscar?${new URLSearchParams({ q, lat: currentCenter.lat, lng: currentCenter.lng })}`);
                    if (response.ok) places = await response.json();
                } catch {}
                if (!places.length) {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pe&q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } });
                        if (response.ok) places = (await response.json()).map(x => ({ displayName: x.display_name, lat: Number(x.lat), lng: Number(x.lon) }));
                    } catch {}
                }
            }
            if (!Array.isArray(places) || !places.length) throw new Error('No se encontró el destino. Conéctate a internet para buscar lugares nuevos.');
            const place = places.sort((a, b) => distanceBetween(currentCenter, { lat: Number(a.lat), lng: Number(a.lng) }) - distanceBetween(currentCenter, { lat: Number(b.lat), lng: Number(b.lng) }))[0];
            return routeToCoordinates(place.lat, place.lng, place.displayName || q);
        }

        async function routeToPublication(query) {
            const needle = normalizeLabel(query);
            if (!needle) return null;
            const candidates = servicesData.filter(p => normalizeLabel(`${p.title || ''} ${p.name || ''} ${p.category || ''} ${p.description || ''} ${p.location || ''}`).includes(needle));
            if (!candidates.length) return null;
            const hit = candidates.sort((a, b) => distanceBetween(currentCenter, { lat: Number(a.lat), lng: Number(a.lng ?? a.lon) }) - distanceBetween(currentCenter, { lat: Number(b.lat), lng: Number(b.lng ?? b.lon) }))[0];
            const lat = Number(hit.lat ?? hit.latitude);
            const lng = Number(hit.lng ?? hit.longitude ?? hit.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return routeToCoordinates(lat, lng, hit.title || hit.name || query);
        }

        async function buscarLugar(options = {}) {
            const input = document.getElementById('search-input');
            const opts = options && typeof options === 'object' ? options : {};
            const query = String(opts.placesQuery || input?.value || '').trim();
            if (!query) return;
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '<div class="result-item">Buscando publicaciones cercanas y después lugares...</div>';
            resultsDiv.classList.add('show');
            const q = normalizeLabel(query);
            const searchText = q.replace(/\b(busca|buscar|encuentra|encontrar|muestra|muestrame|show|find|search|cerca de mi|cerca de mí|en mi zona|por aqui|por aquí|eventos?|servicios?|reportes?|problemas?|ventas?|compras?|emergencias?|ayuda|solidaridad|cercanos?|cercanas?|cerca)\b/g, ' ').replace(/\s+/g, ' ').trim();
            const termList = (Array.isArray(opts.terms) ? opts.terms : []).map(value => normalizeLabel(value)).filter(Boolean);
            const smartCategory = opts.category || (q.includes('evento') ? 'EVENTO' : q.includes('servicio') ? 'SERVICIO' : (q.includes('reporte') || q.includes('problema')) ? 'REPORTE' : (q.includes('venta') || q.includes('compr')) ? 'VENTA' : q.includes('emerg') ? 'EMERGENCIA' : q.includes('ayuda') || q.includes('solidar') ? 'SOLIDARIDAD' : null);
            const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const textOf = p => normalize(`${p.title || ''} ${p.name || ''} ${p.category || ''} ${p.type || ''} ${p.description || ''} ${p.location || ''} ${p.address || ''}`);
            const matchesFilters = p => {
                const text = textOf(p);
                const textOk = termList.length ? termList.some(term => text.includes(term)) : (!searchText || text.includes(normalize(searchText)));
                const categoryOk = !smartCategory || normalize(p.kind || p.type || '').includes(normalize(smartCategory));
                return textOk && categoryOk;
            };
            const toSearchItem = p => ({ display_name: p.title || p.name || 'Publicación', lat: String(p.lat), lon: String(p.lng ?? p.lon), _dist: p.distance ?? distanceBetween(currentCenter, { lat: Number(p.lat), lng: Number(p.lng ?? p.lon) }), _point: p, _kind: p.kind || p.type || p.category || 'Publicación' });
            let publications = servicesData.filter(matchesFilters).map(toSearchItem);
            if (navigator.onLine) {
                try {
                    const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng, radio: currentRadius });
                    const response = await fetch(`${API_BASE}/mapa/puntos?${params}`);
                    if (response.ok) {
                        const fresh = await response.json();
                        if (Array.isArray(fresh)) {
                            writeMapCache(fresh);
                            const matches = fresh.filter(matchesFilters).map(toSearchItem);
                            const known = new Set(publications.map(x => `${x._point?.kind}:${x._point?.id}`));
                            publications = [...publications, ...matches.filter(x => !known.has(`${x._point?.kind}:${x._point?.id}`))];
                        }
                    }
                } catch {}
            } else {
                const cached = readMapCache().filter(matchesFilters).map(toSearchItem);
                publications = [...publications, ...cached];
            }
            publications.sort((a, b) => Number(a._dist ?? Infinity) - Number(b._dist ?? Infinity));

            let places = [];
            const shouldSearchPlaces = !smartCategory || !!searchText;
            if (shouldSearchPlaces && navigator.onLine) {
                try {
                    const response = await fetch(`${API_BASE}/geo/buscar?${new URLSearchParams({ q: query, lat: currentCenter.lat, lng: currentCenter.lng })}`);
                    if (response.ok) {
                        const found = await response.json();
                        places = (Array.isArray(found) ? found : []).map(place => ({ display_name: place.displayName || place.name || query, lat: String(place.lat), lon: String(place.lng ?? place.lon), _dist: place.distance ?? distanceBetween(currentCenter, { lat: Number(place.lat), lng: Number(place.lng ?? place.lon) }), _kind: 'Lugar del mapa' }));
                    }
                } catch {}
                if (!places.length && searchText) {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&countrycodes=pe&q=${encodeURIComponent(searchText)}`, { headers: { Accept: 'application/json' } });
                        if (response.ok) places = (await response.json()).map(place => ({ display_name: place.display_name, lat: place.lat, lon: place.lon, _dist: distanceBetween(currentCenter, { lat: Number(place.lat), lng: Number(place.lon) }), _kind: 'Lugar del mapa' }));
                    } catch {}
                }
            }
            places.sort((a, b) => Number(a._dist ?? Infinity) - Number(b._dist ?? Infinity));
            const renderGroup = (title, rows, isPublication) => {
                if (!rows.length) return;
                const heading = document.createElement('div'); heading.className = 'gf-search-group'; heading.textContent = title; resultsDiv.appendChild(heading);
                rows.slice(0, 8).forEach(place => {
                    const item = document.createElement('div'); item.className = 'result-item gf-search-result';
                    const name = String(place.display_name || 'Resultado').split(',')[0];
                    const dist = place._dist != null ? `${(Number(place._dist) / 1000).toFixed(1)} km` : '';
                    item.innerHTML = `<div class="gf-search-result-copy"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(place._kind || place.display_name)}${dist ? ` · ${dist}` : ''}</small></div><div class="gf-search-result-actions"><button type="button" class="gf-search-show">Ver</button><button type="button" class="gf-search-route">Ruta</button></div>`;
                    item.querySelector('.gf-search-show').addEventListener('click', () => {
                        const lat = Number(place.lat), lon = Number(place.lon);
                        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
                        if (searchMarker) searchMarker.remove();
                        const el = document.createElement('div'); el.innerHTML = pinSVG('#ef4444'); el.style.display = 'block';
                        const popup = isPublication && place._point ? makePointPopup(place._point) : new maplibregl.Popup({ offset: 12 }).setHTML(`<div><b>${escapeHtml(name)}</b><br><small>${escapeHtml(place.display_name)}</small></div>`);
                        searchMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lon, lat]).setPopup(popup).addTo(map); searchMarker.togglePopup();
                        map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 16), essential: true }); resultsDiv.classList.remove('show');
                    });
                    item.querySelector('.gf-search-route').addEventListener('click', async () => {
                        try { await routeToCoordinates(Number(place.lat), Number(place.lon), name); resultsDiv.classList.remove('show'); }
                        catch (error) { toast(error.message || 'No se pudo calcular la ruta'); }
                    });
                    resultsDiv.appendChild(item);
                });
            };
            resultsDiv.innerHTML = '';
            renderGroup('PUBLICACIONES DE USUARIOS · MÁS CERCANAS', publications, true);
            renderGroup('LUGARES Y DIRECCIONES DEL MAPA', places, false);
            if (!publications.length && !places.length) resultsDiv.innerHTML = `<div class="result-item">No se encontraron publicaciones ni lugares para “${escapeHtml(query)}”. Prueba ampliar el radio.</div>`;
        }
        document.getElementById('search-btn')?.addEventListener('click', buscarLugar);
        document.getElementById('search-voice-btn')?.addEventListener('click', () => {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) { toast('Tu navegador no admite búsqueda por voz'); return; }
            const r = new SR(); r.lang = document.documentElement.lang === 'en' ? 'en-US' : document.documentElement.lang === 'pt' ? 'pt-BR' : 'es-PE'; r.interimResults = false;
            r.onresult = e => { const input = document.getElementById('search-input'); if (input) { input.value = e.results[0][0].transcript; buscarLugar(); } }; r.onerror = () => toast('No se pudo usar el micrófono'); r.start();
        });
        document.getElementById('search-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarLugar(); });
        document.addEventListener('click', (e) => { if (!document.getElementById('search-container').contains(e.target)) document.getElementById('search-results').classList.remove('show'); });

        // ============================================================
        // 16. CLIMA (con cache para re-aplicar nubes)
        // ============================================================
        let windMarkers = [];
        let cloudIndicatorMarker = null;
        let cloudAnimationInterval = null;
        let cloudsArray = [];

        async function autoLoadWeather() {
            const weatherKey = `geofastpe_weather_${currentCenter.lat.toFixed(2)}_${currentCenter.lng.toFixed(2)}`;
            if (!navigator.onLine) {
                try { const cached = JSON.parse(localStorage.getItem(weatherKey) || 'null'); if (cached?.data) { currentWeatherData = cached.data; renderWeatherCard(cached.data); renderCloudIndicator(cached.data.cloud_cover); startClouds(cached.data.cloud_cover, cached.data.wind_direction_10m, cached.data.wind_speed_10m); renderWindArrows(cached.data.wind_direction_10m, cached.data.wind_speed_10m); } } catch {}
                return;
            }
            try {
                const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng });
                const res = await fetch(`${API_BASE}/geo/clima?${params}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const cur = await res.json();
                try { localStorage.setItem(weatherKey, JSON.stringify({ savedAt: Date.now(), data: cur })); } catch {}
                currentWeatherData = cur;
                renderWeatherCard(cur);
                renderCloudIndicator(cur.cloud_cover);
                startClouds(cur.cloud_cover, cur.wind_direction_10m, cur.wind_speed_10m);
                renderWindArrows(cur.wind_direction_10m, cur.wind_speed_10m);
            } catch (e) { console.warn('Weather error:', e); }
        }

        function weatherSVG(code, size = 28) {
            const s = size;
            if (code === 0) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="#fbbf24"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>`;
            if (code <= 3) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3" fill="#fbbf24" stroke="#fbbf24" stroke-width="1.5"/><path d="M6 18h10a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.9 1A3.5 3.5 0 0 0 6 18z" fill="#94a3b8" stroke="#94a3b8" stroke-width="1.5"/></svg>`;
            if (code <= 48) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><line x1="3" y1="9" x2="21" y2="9"/><line x1="5" y1="13" x2="19" y2="13"/><line x1="3" y1="17" x2="21" y2="17"/></svg>`;
            if (code <= 67 || (code >= 80 && code <= 82)) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h10a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.9 1A3.5 3.5 0 0 0 6 14z" fill="#64748b" stroke="#64748b" stroke-width="1.5"/><line x1="9" y1="17" x2="9" y2="20" stroke="#60a5fa" stroke-width="2"/><line x1="13" y1="17" x2="13" y2="20" stroke="#60a5fa" stroke-width="2"/><line x1="17" y1="17" x2="17" y2="20" stroke="#60a5fa" stroke-width="2"/></svg>`;
            if (code <= 86) return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h10a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.9 1A3.5 3.5 0 0 0 6 14z" fill="#94a3b8" stroke="#94a3b8" stroke-width="1.5"/><line x1="9" y1="18" x2="9" y2="20" stroke="#e0f2fe" stroke-width="2"/><line x1="13" y1="17" x2="13" y2="19" stroke="#e0f2fe" stroke-width="2"/><line x1="17" y1="18" x2="17" y2="20" stroke="#e0f2fe" stroke-width="2"/></svg>`;
            return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h10a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.9 1A3.5 3.5 0 0 0 6 14z" fill="#475569" stroke="#475569" stroke-width="1.5"/><polyline points="13 15 11 19 13 19 11 23" stroke="#fbbf24" stroke-width="1.5" fill="none"/></svg>`;
        }

        function renderWeatherCard(cur) {
            const card = document.getElementById('weather-card');
            const desc = getWeatherDesc(cur.weather_code);
            const cardDir = getCardinal(cur.wind_direction_10m);
            if (!card.classList.contains('show')) {
                card.innerHTML = `
                    <div class="wx-header" id="wx-toggle">
                        <div class="wx-icon-wrap" id="wx-icon">${weatherSVG(cur.weather_code)}</div>
                        <div class="wx-main"><div class="wx-temp" id="wx-temp">${Math.round(cur.temperature_2m)}°C</div><div class="wx-desc" id="wx-desc">${desc}</div></div>
                        <div style="font-size:10px;color:#64748b;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
                    </div>
                    <div class="wx-place" id="wx-place">${currentCityName}</div>
                    <div class="wx-details">
                        <div class="row"><span class="label">Viento</span><span class="value" id="wx-wind">-</span></div>
                        <div class="row"><span class="label">Lluvia</span><span class="value" id="wx-rain">-</span></div>
                        <div class="row"><span class="label">Humedad</span><span class="value" id="wx-hum">-</span></div>
                        <div class="row"><span class="label">Nubes</span><span class="value" id="wx-clouds">-</span></div>
                    </div>
                `;
                document.getElementById('wx-toggle')?.addEventListener('click', () => card.classList.toggle('expanded'));
                card.classList.add('show');
            }
            document.getElementById('wx-icon').innerHTML = weatherSVG(cur.weather_code);
            document.getElementById('wx-temp').innerText = Math.round(cur.temperature_2m) + '°C';
            document.getElementById('wx-desc').innerText = desc;
            document.getElementById('wx-place').innerText = currentCityName;
            document.getElementById('wx-wind').innerText = `${Math.round(cur.wind_speed_10m)} km/h ${cardDir}`;
            document.getElementById('wx-rain').innerText = `${cur.precipitation} mm`;
            document.getElementById('wx-hum').innerText = `${cur.relative_humidity_2m}%`;
            document.getElementById('wx-clouds').innerText = `${cur.cloud_cover}%`;
        }

        function renderCloudIndicator(coverage) {
            if (cloudIndicatorMarker) { cloudIndicatorMarker.remove(); cloudIndicatorMarker = null; }
            const el = document.createElement('div');
            el.className = 'cloud-indicator';
            el.innerHTML = `<span>${coverage}% nubes</span><div style="width:32px;height:3px;background:rgba(148,163,184,0.3);border-radius:2px;overflow:hidden;"><div style="width:${coverage}%;height:100%;background:#60a5fa;transition:width 0.4s;"></div></div>`;
            cloudIndicatorMarker = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -52] }).setLngLat([currentCenter.lng, currentCenter.lat]).addTo(map);
        }

        function startClouds(coverage, windDirection, windSpeed) {
            stopClouds();
            const amount = Math.max(0, Math.min(100, Number(coverage) || 0));
            if (amount < 5) return;
            // Las nubes se guardan como coordenadas geográficas. No hay
            // intervalos que las desplacen: al mover/zoom del mapa permanecen
            // ancladas al mismo punto del terreno.
            const count = Math.min(24, Math.max(4, Math.round(amount / 4)));
            const spread = Math.max(0.025, Math.min(0.22, 0.025 + amount / 650));
            cloudsArray = [];
            let seed = Math.round((currentCenter.lat + 90) * 10000 + (currentCenter.lng + 180) * 1000 + amount);
            const random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
            for (let i = 0; i < count; i++) {
                cloudsArray.push({
                    lng: currentCenter.lng + (random() - 0.5) * spread,
                    lat: currentCenter.lat + (random() - 0.5) * spread,
                    size: 90 + random() * 180,
                    opacity: 0.045 + (amount / 100) * 0.13
                });
            }
            const geojson = cloudsToGeoJSON(cloudsArray);
            if (!map.getSource('clouds-source')) {
                map.addSource('clouds-source', { type: 'geojson', data: geojson });
                const cloudColor = isDarkMode ? '#53627a' : '#263247';
                const firstSymbol = map.getStyle().layers.find(layer => layer.type === 'symbol');
                const layerDef = {
                    id: 'clouds-layer', type: 'circle', source: 'clouds-source',
                    paint: {
                        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, ['*', ['get', 'size'], 0.42], 12, ['get', 'size'], 17, ['*', ['get', 'size'], 1.5]],
                        'circle-color': cloudColor,
                        'circle-blur': 1,
                        'circle-opacity': ['get', 'opacity']
                    }
                };
                if (firstSymbol) map.addLayer(layerDef, firstSymbol.id);
                else map.addLayer(layerDef);
            } else {
                map.getSource('clouds-source').setData(geojson);
            }
        }

        function cloudsToGeoJSON(arr) {
            return {
                type: 'FeatureCollection',
                features: arr.map(cloud => ({
                    type: 'Feature',
                    properties: { size: cloud.size, opacity: cloud.opacity },
                    geometry: { type: 'Point', coordinates: [cloud.lng, cloud.lat] }
                }))
            };
        }

        function stopClouds() {
            if (cloudAnimationInterval) clearInterval(cloudAnimationInterval);
            cloudAnimationInterval = null;
            if (map.getLayer('clouds-layer')) map.removeLayer('clouds-layer');
            if (map.getSource('clouds-source')) map.removeSource('clouds-source');
            cloudsArray = [];
        }

        function renderWindArrows(direction, speed) {
            clearWindArrows();
            const rotation = (direction + 180) % 360;
            const size = Math.min(20 + speed * 0.6, 40);
            let color = '#10b981';
            if (speed > 30) color = '#ef4444'; else if (speed > 15) color = '#f59e0b'; else if (speed > 5) color = '#3b82f6';
            const radiusDeg = 0.018;
            const count = 8;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * 2 * Math.PI;
                const lat = currentCenter.lat + Math.sin(angle) * radiusDeg;
                const lng = currentCenter.lng + Math.cos(angle) * radiusDeg * 1.15;
                const el = document.createElement('div');
                el.style.cssText = `width:${size}px;height:${size}px;pointer-events:none;`;
                el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 40 40" style="transform:rotate(${rotation}deg);filter:drop-shadow(0 0 4px ${color});opacity:0.85;"><path d="M20 6 L28 32 L20 25 L12 32 Z" fill="${color}" stroke="white" stroke-width="1"/></svg>`;
                windMarkers.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map));
            }
        }
        function clearWindArrows() { windMarkers.forEach(m => m.remove()); windMarkers = []; }

        function getWeatherDesc(code) { if (code === 0) return 'Despejado'; if (code <= 3) return 'Parcialmente nublado'; if (code <= 48) return 'Niebla'; if (code <= 67) return 'Lluvia'; if (code <= 77) return 'Nieve'; if (code <= 82) return 'Chubascos'; if (code <= 86) return 'Nieve'; return 'Tormenta'; }
        function getCardinal(deg) { const dirs = ['N','NE','E','SE','S','SO','O','NO']; return dirs[Math.round(deg / 45) % 8]; }

        // ============================================================
        // 17. CONECTIVIDAD Y EMERGENCIA
        // ============================================================
        function updateConnectivityBadge() {
            const badge = document.getElementById('connectivity-badge');
            if (navigator.onLine) { badge.classList.remove('offline'); badge.innerText = 'En línea'; }
            else {
                badge.classList.add('offline');
                badge.innerText = 'Sin conexión · datos guardados';
                // No borrar capas meteorológicas ni puntos: son recursos
                // geográficos ya descargados y siguen siendo útiles offline.
            }
        }
        // ============================================================
        // 19. NOTIFICACIONES DE NOVEDADES CERCANAS
        // ============================================================
        let nearbyNotificationTimer = null;
        async function pollNearbyUpdates() {
            if (!navigator.onLine || localStorage.getItem('gf-nearby-alerts') !== 'true' || !('Notification' in window) || Notification.permission !== 'granted') return;
            try {
                const radius = Number(localStorage.getItem('gf-alert-radius') || currentRadius || 2000);
                const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng, radio: radius });
                const response = await fetch(`${API_BASE}/mapa/puntos?${params}`);
                if (!response.ok) return;
                const points = await response.json();
                if (!Array.isArray(points)) return;
                const key = 'geofastpe_nearby_seen_v1';
                let seen = [];
                try { seen = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
                const ids = points.map(p => `${p.kind || p.type || 'P'}:${p.id ?? p.uuid ?? p.title}`);
                if (!seen.length) { localStorage.setItem(key, JSON.stringify(ids)); return; }
                const seenSet = new Set(seen);
                const fresh = points.filter(p => !seenSet.has(`${p.kind || p.type || 'P'}:${p.id ?? p.uuid ?? p.title}`));
                fresh.slice(0, 4).forEach(p => {
                    const title = p.title || p.name || 'Nueva publicación cercana';
                    const type = p.kind || p.type || p.category || 'Novedad';
                    const notification = new Notification(`GeoFastPe · ${type}`, { body: `${title} · Se registró cerca de tu zona`, tag: `gf-${p.id ?? title}`, icon: '/favicon.ico' });
                    notification.onclick = () => { window.focus(); if (Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))) map.flyTo({ center: [Number(p.lng), Number(p.lat)], zoom: 16 }); notification.close(); };
                });
                localStorage.setItem(key, JSON.stringify([...seen, ...ids].slice(-1500)));
            } catch (error) { console.debug('Notificaciones cercanas:', error); }
        }
        function startNearbyNotifications() {
            if (nearbyNotificationTimer) clearInterval(nearbyNotificationTimer);
            pollNearbyUpdates();
            nearbyNotificationTimer = setInterval(pollNearbyUpdates, 60000);
        }
        startNearbyNotifications();
        window.addEventListener('storage', event => { if (event.key === 'gf-nearby-alerts' || event.key === 'gf-alert-radius') pollNearbyUpdates(); });

        window.addEventListener('online', () => { updateConnectivityBadge(); toast('Conexión restaurada · sincronizando'); updateServices(); autoLoadWeather(); });
        window.addEventListener('offline', () => { updateConnectivityBadge(); toast('Sin conexión'); });

        document.getElementById('btn-emergency')?.addEventListener('click', () => {
            isEmergencyMode = !isEmergencyMode;
            document.getElementById('btn-emergency').style.boxShadow = isEmergencyMode ? '0 0 0 4px rgba(220,38,38,0.3), 0 4px 14px rgba(0,0,0,0.25)' : '';
            currentRadius = isEmergencyMode ? 5000 : 1000;
            addRadiusCircle(); updateServices();
        });

        const assistantMarkers = [];
        const assistantResults = [];
        function clearAssistantMarkers() {
            assistantMarkers.splice(0).forEach(marker => marker.remove());
            assistantResults.length = 0;
        }
        async function findNearby(options = {}) {
            const opts = options && typeof options === 'object' ? options : {};
            const query = String(opts.placesQuery || opts.query || '').trim();
            const termList = (Array.isArray(opts.terms) ? opts.terms : []).map(value => normalizeLabel(value)).filter(Boolean);
            const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const matchesTerms = p => {
                if (!termList.length) return true;
                const text = normalize(`${p.title || ''} ${p.name || ''} ${p.category || ''} ${p.type || ''} ${p.description || ''} ${p.location || ''} ${p.address || ''}`);
                return termList.some(term => text.includes(normalize(term)));
            };
            const radius = currentRadius;
            const items = [];

            if (navigator.onLine) {
                try {
                    const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng, radio: radius });
                    const response = await fetch(`${API_BASE}/mapa/puntos?${params}`);
                    if (response.ok) {
                        const fresh = await response.json();
                        if (Array.isArray(fresh)) {
                            writeMapCache(fresh);
                            fresh.filter(matchesTerms).forEach(p => {
                                const lat = Number(p.lat), lng = Number(p.lng ?? p.lon);
                                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                                const distance = distanceBetween(currentCenter, { lat, lng });
                                if (distance > radius) return;
                                items.push({ name: p.title || p.name || 'Publicación', address: p.address || p.location || '', lat, lng, distance, kind: 'Publicación', point: p });
                            });
                        }
                    }
                } catch {}
            }

            if (navigator.onLine && query) {
                try {
                    const dLat = radius / 110574;
                    const dLng = radius / (111320 * Math.cos(currentCenter.lat * Math.PI / 180));
                    const viewbox = [currentCenter.lng - dLng, currentCenter.lat + dLat, currentCenter.lng + dLng, currentCenter.lat - dLat].join(',');
                    const params = new URLSearchParams({ format: 'jsonv2', limit: '20', countrycodes: 'pe', viewbox, bounded: '1', q: query });
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json' } });
                    if (response.ok) {
                        const found = await response.json();
                        (Array.isArray(found) ? found : []).forEach(place => {
                            const lat = Number(place.lat), lng = Number(place.lon);
                            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                            const distance = distanceBetween(currentCenter, { lat, lng });
                            if (distance > radius) return;
                            const full = place.display_name || query;
                            items.push({ name: String(place.name || full).split(',')[0], address: full, lat, lng, distance, kind: 'Lugar' });
                        });
                    }
                } catch {}
            }

            items.sort((a, b) => a.distance - b.distance);
            const top = items.slice(0, 15);
            clearAssistantMarkers();
            top.forEach(item => {
                const el = document.createElement('div');
                el.innerHTML = pinSVG(item.kind === 'Publicación' ? '#7c3aed' : '#0ea5e9');
                el.style.display = 'block';
                const popup = item.point
                    ? makePointPopup(item.point)
                    : new maplibregl.Popup({ offset: 12 }).setHTML(`<div><b>${escapeHtml(item.name)}</b><br><small>${escapeHtml(item.address)}</small></div>`);
                assistantMarkers.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([item.lng, item.lat]).setPopup(popup).addTo(map));
                assistantResults.push(item);
            });
            if (top.length) {
                const bounds = new maplibregl.LngLatBounds();
                top.forEach(item => bounds.extend([item.lng, item.lat]));
                map.fitBounds(bounds, { padding: 70, maxZoom: 16 });
            }
            return { radius, items: top.map(({ point, ...rest }) => rest) };
        }
        function focusAssistantPoint(lat, lng) {
            const index = assistantResults.findIndex(item => Math.abs(item.lat - lat) < 1e-7 && Math.abs(item.lng - lng) < 1e-7);
            const marker = assistantMarkers[index];
            if (!marker) return false;
            map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 16), essential: true });
            if (!marker.getPopup()?.isOpen()) marker.togglePopup();
            return true;
        }

        window.GeoFastPe = {
            __initialized: true,
            __version: 'location-3',
            setCategory(category) { selectedServiceCategory = category; updateServices(); },
            setRadius(value) { currentRadius = Math.max(250, Math.min(50000, Number(value) || 1000)); addRadiusCircle(); updateServices(); return currentRadius; },
            setLayer(layer) { const btn = document.querySelector(`.layer-btn[data-layer="${layer}"]`); if (btn) btn.click(); },
            setRouteMode(mode) { if (!ROUTE_URLS[mode]) return false; currentRouteMode = mode; document.querySelectorAll('.route-mode').forEach(b => b.classList.toggle('active', b.dataset.mode === mode)); if (lastRouteDestination) recalculateLastRoute(); return true; },
            search(query, options = {}) { const input = document.getElementById('search-input'); if (!input) return; const value = Array.isArray(query) ? query.filter(Boolean).join(' ') : (query || ''); input.value = value; return buscarLugar(options); },
            findNearby(options) { return findNearby(options); },
            clearAssistantMarkers() { clearAssistantMarkers(); },
            focusAssistantPoint(lat, lng) { return focusAssistantPoint(lat, lng); },
            routeTo(query) { return routeToPlace(query); },
            routeToPublication(query) { return routeToPublication(query); },
            routeToCoordinates(lat, lng, label) { return routeToCoordinates(lat, lng, label); },
            locateMe(options) { return locateMe(options); },
            isFollowingUser() { return followUser; },
            getMap() { return map; },
            getState() { return { radius: currentRadius, city: currentCityName, category: selectedServiceCategory, center: { ...currentCenter }, routeMode: currentRouteMode, userLocation: userLocation ? { ...userLocation } : null, lastGeoError }; }
        };
        const appShell = document.querySelector('.geofastpe-app');
        const sidebar = document.querySelector('.gf-sidebar');
        const refreshMapLayout = () => { map.resize(); map.triggerRepaint(); };
        if (sidebar && appShell) {
            const syncSidebar = () => appShell.classList.toggle('gf-sidebar-collapsed', sidebar.classList.contains('collapsed'));
            syncSidebar();
            new MutationObserver(() => { syncSidebar(); setTimeout(refreshMapLayout, 280); }).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
            if (window.ResizeObserver) new ResizeObserver(refreshMapLayout).observe(sidebar);
        }
        window.addEventListener('resize', refreshMapLayout);
    
}