import { useMemo, useState } from 'react';
import { Flag, Search, MapPin, Construction, Lightbulb, Trash2, ShieldAlert, Wrench, FileText } from 'lucide-react';
import './Reports.css';

export const demoReports = [
  { id: 'demo-1', title: 'Bache en la Av. Principal', description: 'Se reporta un bache grande que puede causar accidentes.', location: 'Cercado de Arequipa', category: 'Infraestructura', status: 'En revisión', time: 'Hace 1 h', icon: 'construction', demo: true },
  { id: 'demo-2', title: 'Luminaria dañada', description: 'La luz no enciende desde hace varios días.', location: 'Yanahuara', category: 'Servicios', status: 'Resuelto', time: 'Hace 3 h', icon: 'light', demo: true },
  { id: 'demo-3', title: 'Acumulación de basura', description: 'Hay basura acumulada en la esquina del parque.', location: 'Sachaca', category: 'Servicios', status: 'En proceso', time: 'Hace 5 h', icon: 'trash', demo: true },
  { id: 'demo-4', title: 'Vereda deteriorada', description: 'La vereda está rota y representa un riesgo.', location: 'Cayma', category: 'Infraestructura', status: 'Pendiente', time: 'Hace 1 día', icon: 'construction', demo: true },
];
const icons = { construction: Construction, light: Lightbulb, trash: Trash2, Seguridad: ShieldAlert, Servicios: Wrench, Otro: FileText, Infraestructura: Construction };
const categories = ['Todos', 'Infraestructura', 'Seguridad', 'Servicios', 'Otro'];
export default function ReportsPage({ reports = demoReports, onCreateReport, onViewReport }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const filtered = useMemo(() => reports.filter((r) => (category === 'Todos' || r.category === category) && `${r.title} ${r.description} ${r.location}`.toLowerCase().includes(search.toLowerCase())), [reports, search, category]);
  return <section className="gf-reports">
    <header className="gf-reports-header"><div className="gf-reports-header-title"><Flag size={36}/><div><h1>Reportes Comunitarios</h1><p>Reporta incidencias y ayuda a mejorar tu comunidad.</p></div></div><button className="gf-primary" onClick={onCreateReport}>＋ Crear Reporte</button></header>
    <div className="gf-report-search"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar reportes..." aria-label="Buscar reportes"/></div>
    <nav className="gf-report-filters" aria-label="Categorías">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
    <div className="gf-report-list">{filtered.length ? filtered.map(r=>{ const Icon = icons[r.icon] || icons[r.category] || FileText; return <article className="gf-report-card" key={r.id}><div className="gf-report-picture"><Icon size={36}/></div><div className="gf-report-info"><h3>{r.title}</h3><p>{r.description}</p><span><MapPin size={15}/>{r.location || 'Ubicación no indicada'}</span></div><div className="gf-report-meta"><span className={`gf-status gf-status-${r.status?.toLowerCase().replaceAll(' ','-')}`}>{r.status || 'Pendiente'}</span><small>{r.time || 'Reciente'}</small><button onClick={()=>onViewReport?.(r)}>Ver detalle</button></div></article>}) : <div className="gf-report-empty">No se encontraron reportes con estos filtros.</div>}</div>
    <p className="gf-report-disclaimer">Los reportes de ejemplo son demostrativos. Su estado no representa una verificación oficial.</p>
  </section>;
}
