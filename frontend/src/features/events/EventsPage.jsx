import { useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, MapPin, Users, GraduationCap, HeartPulse, Leaf, Trophy, Drama, LayoutGrid, MoreHorizontal } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Events.css';

const TABS = [
  { label: 'Próximos', key: 'proximos' },
  { label: 'Mis eventos', key: 'mios' },
  { label: 'Finalizados', key: 'finalizados' }
];

const categories = [
  ['Todos', LayoutGrid],
  ['Cultura', Drama],
  ['Deporte', Trophy],
  ['Educación', GraduationCap],
  ['Salud', HeartPulse],
  ['Ambiente', Leaf],
  ['Otros', MoreHorizontal]
];

const fmt = (date) => {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
};

export default function EventsPage({ events = [], onCreateEvent, onViewEvent, onTabChange }) {
  const { tr } = usePreferences();
  const [tab, setTab] = useState('Próximos');
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('recent');

  const shown = useMemo(() => events
    .filter((event) => category === 'Todos' || event.category === category)
    .sort((a, b) => {
      if (sort === 'soon') return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      if (sort === 'popular') return (b.participants || 0) - (a.participants || 0);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    }), [events, category, sort]);

  const changeTab = (label, key) => {
    setTab(label);
    onTabChange?.(key);
  };

  return <section className="gf-events">
    <header className="gf-events-hero">
      <div className="gf-events-hero-copy"><CalendarDays size={37}/><div><h1>{tr('Eventos Comunitarios')}</h1><p>{tr('Participa en actividades, campañas y jornadas de tu comunidad.')}</p></div></div>
      <button className="gf-events-primary" type="button" onClick={onCreateEvent}><CalendarPlus size={17}/> {tr('Crear evento')}</button>
    </header>
    <div className="gf-events-toolbar">
      <div className="gf-events-tabs">{TABS.map((t) => <button type="button" key={t.key} className={tab === t.label ? 'active' : ''} onClick={() => changeTab(t.label, t.key)}>{tr(t.label)}</button>)}</div>
      <select aria-label={tr('Ordenar eventos')} value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="recent">{tr('Ordenar por: Más recientes')}</option>
        <option value="soon">{tr('Fecha más próxima')}</option>
        <option value="popular">{tr('Más participantes')}</option>
      </select>
    </div>
    <div className="gf-events-categories">{categories.map(([name, Icon]) => <button type="button" key={name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}><Icon size={23}/><span>{tr(name)}</span></button>)}</div>
    <div className="gf-events-list">{shown.length ? shown.map((event) => <article className="gf-events-card" key={event.id}>
      <div className="gf-events-cover"><CalendarDays size={38}/></div>
      <div className="gf-events-info"><span className="gf-events-tag">{tr(event.category)}</span><h3>{event.title}</h3><p><CalendarDays size={15}/> {fmt(event.date)} · {event.time}</p><p><MapPin size={15}/> {event.location}</p></div>
      <div className="gf-events-card-side"><span className="gf-events-status">{tr(event.status)}</span><span className="gf-events-participants"><Users size={15}/> {event.participants || 0} {tr('participantes')}</span><button type="button" onClick={() => onViewEvent?.(event)}>{tr('Ver detalle')}</button></div>
    </article>) : <div className="gf-events-empty">{tr('No hay eventos en esta categoría o pestaña.')}</div>}</div>
  </section>;
}
