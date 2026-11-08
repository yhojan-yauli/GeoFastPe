import { useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, MapPin, Users, GraduationCap, HeartPulse, Leaf, Trophy, Drama, LayoutGrid, MoreHorizontal } from 'lucide-react';
import './Events.css';

export const demoEvents = [
  { id: 'demo-1', title: 'Taller de prevención ante desastres', category: 'Educación', date: '2026-11-26', time: '18:00', location: 'Casa de la Cultura', participants: 75, description: 'Taller comunitario de prevención y preparación ante desastres.', status: 'Próximo', demo: true },
  { id: 'demo-2', title: 'Campeonato vecinal de fútbol', category: 'Deporte', date: '2026-11-22', time: '10:00', location: 'Cancha Municipal', participants: 12, description: 'Encuentro deportivo para la comunidad.', status: 'Próximo', demo: true },
  { id: 'demo-3', title: 'Campaña de donación de sangre', category: 'Salud', date: '2026-11-16', time: '08:00', location: 'Centro Comunitario', participants: 68, description: 'Campaña comunitaria de donación de sangre.', status: 'Próximo', demo: true },
  { id: 'demo-4', title: 'Jornada de limpieza vecinal', category: 'Ambiente', date: '2026-11-15', time: '09:00', location: 'Parque Selva Alegre', participants: 42, description: 'Jornada de cuidado y limpieza de espacios públicos.', status: 'Próximo', demo: true },
];
const categories = [ ['Todos',LayoutGrid], ['Cultura',Drama], ['Deporte',Trophy], ['Educación',GraduationCap], ['Salud',HeartPulse], ['Ambiente',Leaf], ['Otros',MoreHorizontal] ];
const fmt = (date) => { const d = new Date(`${date}T12:00:00`); return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat('es-PE',{weekday:'short',day:'numeric',month:'short'}).format(d); };
export default function EventsPage({ events = demoEvents, onCreateEvent, onViewEvent, currentUserId }) {
  const [tab,setTab] = useState('Próximos');
  const [category,setCategory] = useState('Todos');
  const [sort,setSort] = useState('recent');
  const shown = useMemo(() => events.filter(event => (category === 'Todos' || event.category === category) && (tab === 'Mis eventos' ? (currentUserId && event.ownerId === currentUserId) : tab === 'Finalizados' ? event.status === 'Finalizado' : event.status !== 'Finalizado')).sort((a,b) => sort === 'soon' ? (`${a.date} ${a.time}`).localeCompare(`${b.date} ${b.time}`) : sort === 'popular' ? (b.participants||0)-(a.participants||0) : (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || '')), [events,tab,category,sort,currentUserId]);
  return <section className="gf-events">
    <header className="gf-events-hero"><div className="gf-events-hero-copy"><CalendarDays size={37}/><div><h1>Eventos Comunitarios</h1><p>Participa en actividades, campañas y jornadas de tu comunidad.</p></div></div><button className="gf-events-primary" type="button" onClick={onCreateEvent}><CalendarPlus size={17}/> Crear evento</button></header>
    <div className="gf-events-toolbar"><div className="gf-events-tabs">{['Próximos','Mis eventos','Finalizados'].map(t=><button type="button" key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div><select aria-label="Ordenar eventos" value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Ordenar por: Más recientes</option><option value="soon">Fecha más próxima</option><option value="popular">Más participantes</option></select></div>
    <div className="gf-events-categories">{categories.map(([name,Icon])=><button type="button" key={name} className={category===name?'active':''} onClick={()=>setCategory(name)}><Icon size={23}/><span>{name}</span></button>)}</div>
    <div className="gf-events-list">{shown.length ? shown.map(event=><article className="gf-events-card" key={event.id}><div className="gf-events-cover"><CalendarDays size={38}/></div><div className="gf-events-info"><span className="gf-events-tag">{event.category}</span><h3>{event.title}</h3><p><CalendarDays size={15}/> {fmt(event.date)} · {event.time}</p><p><MapPin size={15}/> {event.location}</p></div><div className="gf-events-card-side"><span className="gf-events-status">{event.status || 'Próximo'}</span><span className="gf-events-participants"><Users size={15}/> {event.participants||0} participantes</span><button type="button" onClick={()=>onViewEvent?.(event)}>Ver detalle</button></div></article>) : <div className="gf-events-empty">No hay eventos en esta categoría o pestaña.</div>}</div>
    <p className="gf-events-disclaimer">Los eventos de ejemplo son demostrativos; su programación y participación no están verificadas.</p>
  </section>;
}
