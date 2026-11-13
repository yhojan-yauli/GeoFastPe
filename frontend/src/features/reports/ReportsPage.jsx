import { useMemo, useState } from 'react';
import { Flag, Search, MapPin, Construction, Lightbulb, Trash2, ShieldAlert, Wrench, FileText } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Reports.css';

const icons = { Infraestructura: Construction, Seguridad: ShieldAlert, Servicios: Wrench, Otro: FileText };
const categories = ['Todos', 'Infraestructura', 'Seguridad', 'Servicios', 'Otro'];

export default function ReportsPage({ reports = [], onCreateReport, onViewReport }) {
  const { tr } = usePreferences();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const filtered = useMemo(() => reports.filter((r) =>
    (category === 'Todos' || r.category === category) &&
    `${r.title} ${r.description} ${r.location || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [reports, search, category]);

  return <section className="gf-reports">
    <header className="gf-reports-header">
      <div className="gf-reports-header-title"><Flag size={36}/><div><h1>{tr('Reportes Comunitarios')}</h1><p>{tr('Reporta incidencias y ayuda a mejorar tu comunidad.')}</p></div></div>
      <button className="gf-primary" onClick={onCreateReport}>+ {tr('Crear Reporte')}</button>
    </header>
    <div className="gf-report-search"><Search size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('Buscar reportes...')} aria-label={tr('Buscar reportes')}/></div>
    <nav className="gf-report-filters" aria-label={tr('Categorías')}>{categories.map((c) => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{tr(c)}</button>)}</nav>
    <div className="gf-report-list">{filtered.length ? filtered.map((r) => {
      const Icon = icons[r.category] || FileText;
      return <article className="gf-report-card" key={r.id}>
        <div className="gf-report-picture">{r.images?.[0] ? <img src={r.images[0]} alt={r.title}/> : <Icon size={36}/>}</div>
        <div className="gf-report-info"><h3>{r.title}</h3><p>{r.description}</p><span><MapPin size={15}/>{r.location || tr('Ubicación por coordenadas')}</span></div>
        <div className="gf-report-meta"><span className={`gf-status gf-status-${r.status?.toLowerCase().replaceAll(' ', '-')}`}>{tr(r.status)}</span><small>{r.priority ? `${tr('Prioridad')} ${tr(r.priority)}` : ''}</small><button onClick={() => onViewReport?.(r)}>{tr('Ver detalle')}</button></div>
      </article>;
    }) : <div className="gf-report-empty">{tr('No hay reportes con estos filtros todavía.')}</div>}</div>
  </section>;
}
