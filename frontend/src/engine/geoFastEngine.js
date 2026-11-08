/*
 * Motor original de GeoFastPe.
 * Se conserva íntegro el JavaScript del HTML entregado; únicamente se encapsula
 * para inicializarlo desde el ciclo de vida de React.
 */
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
                    paint: { 'line-color': lineOuterColor, 
                        'line-width': 6, 'line-opacity': 0.45, 'line-join': 'round', 'line-cap': 'round' }
                });
                map.addLayer({
                    id: 'radius-line', type: 'line', source: 'radius-circle',
                    paint: { 'line-color': lineMainColor, 'line-width': 6, 'line-opacity': 0.45, 'line-join': 'round', 'line-cap': 'round' }
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
            try { const raw = localStorage.getItem(mapCacheKey()); return raw ? JSON.parse(raw).points || [] : []; } catch { return []; }
        }

        function writeMapCache(points) {
            try { localStorage.setItem(mapCacheKey(), JSON.stringify({ savedAt: Date.now(), points })); } catch {}
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
        // 13. GPS
        // ============================================================
        document.getElementById('btn-gps')?.addEventListener('click', () => {
            if (!navigator.geolocation) { toast('GPS no disponible'); return; }
            toast('Obteniendo ubicación...');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    currentCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    currentCityName = 'Mi ubicación';
                    if (centerPin) centerPin.setLngLat([currentCenter.lng, currentCenter.lat]);
                    map.flyTo({ center: [currentCenter.lng, currentCenter.lat], zoom: 16 });
                    setTimeout(() => { addRadiusCircle(); updateServices(); autoLoadWeather(); }, 1200);
                    toast(`GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                },
                (err) => {
                    const codes = { 1: 'Permiso denegado', 2: 'Posición no disponible', 3: 'Tiempo agotado' };
                    toast('GPS: ' + (codes[err.code] || 'Error'));
                },
                { enableHighAccuracy: true, timeout: 15000 }
            );
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
            }
        });

        async function recalculateLastRoute() {
            if (!lastRouteDestination || !navigator.onLine) return;
            const params = new URLSearchParams({ modo: currentRouteMode, origenLat: currentCenter.lat, origenLng: currentCenter.lng, destinoLat: lastRouteDestination.lat, destinoLng: lastRouteDestination.lng });
            try {
                const res = await fetch(`${API_BASE}/geo/ruta?${params}`);
                if (!res.ok) throw new Error('route');
                const data = await res.json();
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
            toast('Calculando ruta...');
            try {
                const routeKey = `geofastpe_route_${currentRouteMode}_${currentCenter.lat.toFixed(4)}_${currentCenter.lng.toFixed(4)}_${destLat.toFixed(4)}_${destLng.toFixed(4)}`;
                let data = null;
                if (!navigator.onLine) {
                    try { data = JSON.parse(localStorage.getItem(routeKey) || 'null'); } catch {}
                    if (!data) throw new Error('offline-route');
                } else {
                    const params = new URLSearchParams({ modo: currentRouteMode, origenLat: currentCenter.lat, origenLng: currentCenter.lng, destinoLat: destLat, destinoLng: destLng });
                    const res = await fetch(`${API_BASE}/geo/ruta?${params}`);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    data = await res.json();
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
        async function buscarLugar() {
            const query = document.getElementById('search-input').value.trim();
            if (!query) return;
            const resultsDiv = document.getElementById('search-results');
            resultsDiv.innerHTML = '<div class="result-item">Buscando publicaciones cercanas...</div>';
            resultsDiv.classList.add('show');
            const q = normalizeLabel(query);
            const searchText = q.replace(/\b(eventos?|servicios?|reportes?|problemas?|ventas?|compras?|emergencias?|ayuda|solidaridad|cerca|cercanos?|cercanas?)\b/g, ' ').replace(/\s+/g, ' ').trim();
            const smartCategory = q.includes('evento') ? 'EVENTO' : q.includes('servicio') ? 'SERVICIO' : (q.includes('reporte') || q.includes('problema')) ? 'REPORTE' : (q.includes('venta') || q.includes('compr')) ? 'VENTA' : q.includes('emerg') ? 'EMERGENCIA' : q.includes('ayuda') || q.includes('solidar') ? 'SOLIDARIDAD' : null;
            const toSearchItem = (p) => ({ display_name: p.title || 'Publicación', lat: String(p.lat), lon: String(p.lng), _dist: p.distance, _point: p });
            let data = servicesData.filter(p => { const text = `${p.title || ''} ${p.category || ''} ${p.type || ''} ${p.description || ''} ${p.location || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); return (smartCategory ? String(p.kind || p.type || '').toUpperCase().includes(smartCategory) : true) && (!searchText || text.includes(searchText)); }).map(toSearchItem);

            if (!data.length && navigator.onLine) {
                try {
                    const params = new URLSearchParams({ lat: currentCenter.lat, lng: currentCenter.lng, radio: currentRadius });
                    const res = await fetch(`${API_BASE}/mapa/puntos?${params}`);
                    if (res.ok) {
                        const puntos = await res.json();
                        writeMapCache(puntos);
                        const localMatches = puntos.filter(p => `${p.title || ''} ${p.category || ''} ${p.type || ''} ${p.description || ''} ${p.location || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
                        data = localMatches.map(toSearchItem);
                    }
                } catch {}
            }

            if (!data.length && navigator.onLine) {
                try {
                    const params = new URLSearchParams({ q: query, lat: currentCenter.lat, lng: currentCenter.lng });
                    const res = await fetch(`${API_BASE}/geo/buscar?${params}`);
                    if (res.ok) {
                        const lugares = await res.json();
                        data = lugares.map(place => ({ display_name: place.displayName, lat: String(place.lat), lon: String(place.lng), _dist: place.distance, _fuera: place.distance != null && place.distance > currentRadius }));
                    }
                } catch {}
            }

            if (!data.length) {
                const cached = readMapCache().filter(p => `${p.title || ''} ${p.category || ''} ${p.type || ''} ${p.description || ''} ${p.location || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
                data = cached.map(toSearchItem);
            }

            if (!data.length) {
                resultsDiv.innerHTML = `<div class="result-item">No se encontró “${escapeHtml(query)}” en las publicaciones ni en las zonas cercanas.</div>`;
                return;
            }

            resultsDiv.innerHTML = '';
            data.slice(0, 12).forEach(place => {
                const item = document.createElement('div');
                item.className = 'result-item';
                const name = place.display_name.split(',')[0];
                const distText = place._dist != null ? ` · ${(Number(place._dist) / 1000).toFixed(1)} km` : '';
                item.innerHTML = `<strong>${escapeHtml(name)}${distText}</strong><small>${escapeHtml(place.display_name)}</small>`;
                item.addEventListener('click', () => {
                    const lat = parseFloat(place.lat), lon = parseFloat(place.lon);
                    if (searchMarker) searchMarker.remove();
                    const el = document.createElement('div'); el.innerHTML = pinSVG('#ef4444'); el.style.display = 'block';
                    const popup = place._point ? makePointPopup(place._point) : new maplibregl.Popup({ offset: 12 }).setHTML(`<div style="font-family:inherit"><b>${escapeHtml(name)}</b><br><small style="color:#64748b">${escapeHtml(place.display_name)}</small></div>`);
                    searchMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lon, lat]).setPopup(popup).addTo(map);
                    searchMarker.togglePopup();
                    map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 16), essential: true });
                    resultsDiv.classList.remove('show');
                    document.getElementById('search-input').value = '';
                    toast('Resultado: ' + name);
                });
                resultsDiv.appendChild(item);
            });
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
                try { const cached = JSON.parse(localStorage.getItem(weatherKey) || 'null'); if (cached?.data) { currentWeatherData = cached.data; renderWeatherCard(cached.data); startClouds(cached.data.cloud_cover, cached.data.wind_direction_10m, cached.data.wind_speed_10m); renderWindArrows(cached.data.wind_direction_10m, cached.data.wind_speed_10m); } } catch {}
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
            if (coverage < 10) return;
            const count = Math.min(15, Math.max(4, Math.floor(coverage / 8)));
            cloudsArray = [];
            const spread = 0.18;
            for (let i = 0; i < count; i++) {
                cloudsArray.push({ lng: currentCenter.lng + (Math.random() - 0.5) * spread, lat: currentCenter.lat + (Math.random() - 0.5) * spread, size: 120 + Math.random() * 200, opacity: 0.08 + Math.random() * 0.1 });
            }
            const geojson = cloudsToGeoJSON(cloudsArray);
            if (!map.getSource('clouds-source')) {
                map.addSource('clouds-source', { type: 'geojson', data: geojson });
                const cloudColor = isDarkMode ? '#3a4a68' : '#1a2035';
                const style = map.getStyle();
                const firstSymbol = style.layers.find(l => l.type === 'symbol');
                const layerDef = { id: 'clouds-layer', type: 'circle', source: 'clouds-source', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, ['*', ['get', 'size'], 0.6], 14, ['get', 'size'], 18, ['*', ['get', 'size'], 1.8]], 'circle-color': cloudColor, 'circle-blur': 1.2, 'circle-opacity': ['get', 'opacity'] } };
                if (firstSymbol) map.addLayer(layerDef, firstSymbol.id);
                else map.addLayer(layerDef);
            } else { map.getSource('clouds-source').setData(geojson); }

            const speedFactor = Math.max(windSpeed, 5) / 20;
            const windToRad = ((windDirection + 180) % 360) * Math.PI / 180;
            const dx = Math.sin(windToRad) * 0.0003 * speedFactor;
            const dy = Math.cos(windToRad) * 0.0003 * speedFactor;

            cloudAnimationInterval = setInterval(() => {
                if (!map.getSource('clouds-source')) return;
                cloudsArray.forEach(c => { c.lng += dx; c.lat += dy; if (c.lng > currentCenter.lng + spread / 2) c.lng -= spread; if (c.lng < currentCenter.lng - spread / 2) c.lng += spread; if (c.lat > currentCenter.lat + spread / 2) c.lat -= spread; if (c.lat < currentCenter.lat - spread / 2) c.lat += spread; });
                map.getSource('clouds-source').setData(cloudsToGeoJSON(cloudsArray));
            }, 200);
        }

        function cloudsToGeoJSON(arr) { return { type: 'FeatureCollection', features: arr.map(c => ({ type: 'Feature', properties: { size: c.size, opacity: c.opacity }, geometry: { type: 'Point', coordinates: [c.lng, c.lat] } })) }; }
        function stopClouds() { if (cloudAnimationInterval) clearInterval(cloudAnimationInterval); cloudAnimationInterval = null; if (map.getLayer('clouds-layer')) map.removeLayer('clouds-layer'); if (map.getSource('clouds-source')) map.removeSource('clouds-source'); cloudsArray = []; }

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
            else { badge.classList.add('offline'); badge.innerText = 'Sin conexión'; document.getElementById('weather-card').classList.remove('show'); stopClouds(); clearWindArrows(); if (cloudIndicatorMarker) { cloudIndicatorMarker.remove(); cloudIndicatorMarker = null; } }
        }
        window.addEventListener('online', () => { updateConnectivityBadge(); toast('Conexión restaurada · sincronizando'); updateServices(); autoLoadWeather(); });
        window.addEventListener('offline', () => { updateConnectivityBadge(); toast('Sin conexión'); });

        document.getElementById('btn-emergency')?.addEventListener('click', () => {
            isEmergencyMode = !isEmergencyMode;
            document.getElementById('btn-emergency').style.boxShadow = isEmergencyMode ? '0 0 0 4px rgba(220,38,38,0.3), 0 4px 14px rgba(0,0,0,0.25)' : '';
            currentRadius = isEmergencyMode ? 5000 : 1000;
            addRadiusCircle(); updateServices();
        });

        window.GeoFastPe = {
            __initialized: true,
            setCategory(category) { selectedServiceCategory = category; updateServices(); },
            setRadius(value) { currentRadius = value; addRadiusCircle(); updateServices(); },
            getMap() { return map; },
            getState() { return { radius: currentRadius, city: currentCityName, category: selectedServiceCategory }; }
        };
        window.addEventListener('resize', () => map.invalidateSize());
    
}