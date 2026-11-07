import { useEffect, useMemo, useState } from 'react';
import MapView from './components/views/MapView.jsx';
import ConnectivityView from './components/views/ConnectivityView.jsx';
import SearchView from './components/views/SearchView.jsx';
import LayerSwitcherView from './components/views/LayerSwitcherView.jsx';
import TransportLegendView from './components/views/TransportLegendView.jsx';
import FloatingActionsView from './components/views/FloatingActionsView.jsx';
import RouteModesView from './components/views/RouteModesView.jsx';
import RadiusPanelView from './components/views/RadiusPanelView.jsx';
import WeatherView from './components/views/WeatherView.jsx';
import RotationView from './components/views/RotationView.jsx';
import StatusToastView from './components/views/StatusToastView.jsx';
import { initializeGeoFastPe } from './engine/geoFastEngine.js';

const navigation = [
  ['Inicio','⌂','Todos'],['Servicios','▣','Servicios'],['Solidaridad','♡','Solidaridad'],
  ['Emergencias','⚑','Emergencia'],['Reportes','▤','Reportes'],['Eventos','▦','Eventos'],
  ['Mensajes','▱','Mensajes'],['Mi Perfil','♙','Mi Perfil'],['Configuración','⚙','Configuración']
];
const templates = {
  Reportes: [{title:'Nuevo reporte ciudadano',detail:'Describe una incidencia en tu zona',action:'Crear reporte'},{title:'Mis reportes',detail:'Consulta el estado de tus reportes',action:'Ver reportes'}],
  Eventos: [{title:'Eventos cercanos',detail:'Actividades y convocatorias dentro del área',action:'Explorar eventos'},{title:'Publicar evento',detail:'Comparte una actividad con tu comunidad',action:'Crear evento'}],
  Mensajes: [{title:'Bandeja de entrada',detail:'Tus conversaciones aparecerán aquí',action:'Abrir mensajes'},{title:'Solicitudes',detail:'Mensajes de nuevos contactos',action:'Ver solicitudes'}],
  'Mi Perfil': [{title:'Información personal',detail:'Administra tus datos y foto de perfil',action:'Editar perfil'},{title:'Actividad',detail:'Historial de publicaciones y solicitudes',action:'Ver actividad'}],
  'Configuración': [{title:'Preferencias',detail:'Notificaciones, privacidad y accesibilidad',action:'Administrar'},{title:'Cuenta y seguridad',detail:'Contraseña y sesiones activas',action:'Configurar cuenta'}]
};
const iconFor = type => type === 'Emergencia' ? '!' : type === 'Solidaridad' ? '♥' : '⌂';

function SidePanel({ section, services, radius, onRadiusChange }) {
  const isMapSection = !['Mensajes','Mi Perfil','Configuración'].includes(section);
  const items = useMemo(() => {
    if (!isMapSection) return templates[section] || [];
    if (section === 'Reportes' || section === 'Eventos') return templates[section];
    return services.map(s => ({...s, detail:`${s.type} · ${(s.distance/1000).toFixed(1)} km`, action:'Ver en mapa'}));
  }, [section, services, isMapSection]);
  const title = section === 'Inicio' ? 'Todo cerca de ti' : section === 'Servicios' ? 'Servicios cerca a ti' : section === 'Emergencias' ? 'Emergencias cercanas' : section === 'Solidaridad' ? 'Red de solidaridad' : section;
  return <aside className="right-panel">
    <div className="panel-heading"><div><span className="eyebrow">{isMapSection ? 'RADAR COMUNITARIO' : 'GEOfastpe · CUENTA'}</span><h2>{title}</h2><p>{isMapSection ? `Resultados dentro de un radio de ${radius} m` : 'Tu espacio comunitario'}</p></div><span className="panel-count">{isMapSection ? items.length : '•••'}</span></div>
    {isMapSection && <div className="radius-filter">
      <div className="filter-label"><span>Radio de búsqueda</span><strong>{radius} m</strong></div>
      <input aria-label="Radio de búsqueda" type="range" min="500" max="5000" step="500" value={radius} onChange={e=>onRadiusChange(Number(e.target.value))}/>
      <div className="range-ends"><span>500 m</span><span>5 km</span></div>
      <div className="filter-note">El listado y los marcadores se limitan a la zona circular del mapa.</div>
    </div>}
    <div className="panel-list">
      {items.length ? items.map((item,i)=><article className="nearby-card" key={`${item.id ?? item.title}-${i}`}>
        <div className={`nearby-icon ${item.type==='Emergencia'?'danger':item.type==='Solidaridad'?'purple':''}`}>{item.type ? iconFor(item.type) : ['▤','▦','✉','♙','⚙'][i%5]}</div>
        <div className="nearby-copy"><h3>{item.name || item.title}</h3><p>{item.detail}</p>{item.rating && <small className="rating">★ {item.rating}.0</small>}</div>
        <button className="card-arrow" aria-label="Abrir detalle">›</button>
      </article>) : <div className="empty-state"><div className="empty-symbol">⌖</div><h3>No hay resultados en esta zona</h3><p>Amplía el radio o cambia de ubicación para encontrar más elementos.</p></div>}
    </div>
    <div className="panel-footer"><span className="live-dot"></span>{isMapSection ? 'Actualizado según el área visible' : 'Plantilla de interfaz · lista para conectar'}</div>
  </aside>;
}

export default function App() {
  const [section,setSection] = useState('Inicio');
  const [services,setServices] = useState([]);
  const [radius,setRadius] = useState(1000);
  useEffect(() => {
    initializeGeoFastPe();
    const receive = e => { setServices(e.detail.services || []); setRadius(e.detail.radius || 1000); };
    window.addEventListener('geofastpe:services',receive);
    const timer = setInterval(()=>{ if(window.GeoFastPe){ const state=window.GeoFastPe.getState(); setRadius(state.radius); } },500);
    return ()=>{ window.removeEventListener('geofastpe:services',receive); clearInterval(timer); };
  },[]);
  const selectSection = (name,category) => {
    setSection(name);
    if (['Mensajes','Mi Perfil','Configuración'].includes(name)) category = 'Todos';
    if (window.GeoFastPe) window.GeoFastPe.setCategory(category);
    else window.addEventListener('geofastpe:services',()=>window.GeoFastPe?.setCategory(category),{once:true});
  };
  const changeRadius = value => {
    setRadius(value);
    const slider=document.getElementById('radius-slider');
    if(slider){ slider.value=String(value); slider.dispatchEvent(new Event('input',{bubbles:true})); }
  };
  return <main className="geofastpe-app">
    <MapView />
    <ConnectivityView /><SearchView /><LayerSwitcherView /><TransportLegendView />
    <FloatingActionsView /><RouteModesView /><RadiusPanelView /><WeatherView /><RotationView /><StatusToastView />
    <div className="app-shell">
      <aside className="left-sidebar">
        <div className="brand"><span className="brand-mark">G</span><span>GeoFast<span>Pe</span></span></div>
        <div className="nav-caption">MENÚ PRINCIPAL</div>
        <nav>{navigation.map(([name,icon,category])=><button key={name} className={`nav-item ${section===name?'selected':''}`} onClick={()=>selectSection(name,category)}><span className="nav-icon">{icon}</span><span>{name}</span>{section===name&&<span className="nav-active"/>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="avatar">GF</div><div><strong>GeoFastPe</strong><small>Plataforma comunitaria</small></div></div>
      </aside>
      <SidePanel section={section} services={services} radius={radius} onRadiusChange={changeRadius}/>
    </div>
  </main>;
}
