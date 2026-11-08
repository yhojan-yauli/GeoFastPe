import { useMemo, useState } from 'react';
import { MessageCircleMore, Search, SquarePen, Users, Wrench, HeartPulse, TriangleAlert, Package, Phone, Video, Info, Paperclip, Smile, Send, ArrowLeft, X } from 'lucide-react';
import './Messages.css';

const initialChats = [
  { id: 1, title: 'Vecinos de Cayma', subtitle: 'Grupo · 42 participantes', category: 'Grupos', icon: Users, preview: 'María Torres: ¡Genial! Contamos con su apoyo.', time: '10:24 a. m.', unread: 3, messages: [
    { id: 1, author: 'María Torres', text: 'Buenas vecinas y vecinos 👋. Les recuerdo que mañana realizaremos la jornada de limpieza del parque central.', time: '09:10 a. m.' },
    { id: 2, mine: true, text: '¡Perfecto! ¿A qué hora nos reunimos?', time: '09:18 a. m.' },
    { id: 3, author: 'Luis Ramírez', text: 'A las 08:00 a. m. en la entrada del parque. Llevaremos bolsas, guantes y escobas. 🧹♻️', time: '09:35 a. m.' },
    { id: 4, author: 'María Torres', text: '¡Genial! Contamos con su apoyo. 🙌', time: '10:24 a. m.' }
  ] },
  { id: 2, title: 'Servicio: Electricista', subtitle: 'Carlos Mendoza', category: 'Servicios', icon: Wrench, preview: 'Carlos Mendoza: Puedo ir hoy por la tarde.', time: '09:47 a. m.', unread: 0, messages: [{ id: 1, author: 'Carlos Mendoza', text: 'Puedo ir hoy por la tarde.', time: '09:47 a. m.' }] },
  { id: 3, title: 'Evento: Campaña de salud', subtitle: 'Organizador', category: 'Eventos', icon: HeartPulse, preview: 'Organizador: Recuerden llevar su DNI.', time: 'Ayer', unread: 1, messages: [{ id: 1, author: 'Organizador', text: 'Recuerden llevar su DNI para participar.', time: 'Ayer' }] },
  { id: 4, title: 'Voluntariado GeoFastPe', subtitle: 'Ana', category: 'Vecinos', icon: Users, preview: 'Ana: ¿Quién se suma para este sábado?', time: 'Ayer', unread: 0, messages: [{ id: 1, author: 'Ana', text: '¿Quién se suma para este sábado?', time: 'Ayer' }] },
  { id: 5, title: 'Reportes Vecinales', subtitle: 'Canal demostrativo', category: 'Grupos', icon: TriangleAlert, preview: 'Actualización de reporte comunitario.', time: 'Lun', unread: 0, messages: [{ id: 1, author: 'Sistema de demostración', text: 'Esta conversación es de ejemplo y no representa una comunicación municipal real.', time: 'Lun' }] },
  { id: 6, title: 'Donaciones y Apoyo', subtitle: 'Pedro', category: 'Vecinos', icon: Package, preview: 'Pedro: Aún tenemos ropa disponible.', time: 'Lun', unread: 0, messages: [{ id: 1, author: 'Pedro', text: 'Aún tenemos ropa disponible para donar.', time: 'Lun' }] }
];
const filters = ['Todos', 'Vecinos', 'Servicios', 'Eventos', 'Grupos'];
const nowTime = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

export default function MessagesPage({ onBack, isAuthenticated = false }) {
  const [chats, setChats] = useState(initialChats);
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const visible = useMemo(() => chats.filter(c => (filter === 'Todos' || c.category === filter) && `${c.title} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase())), [chats, filter, search]);
  const selected = chats.find(c => c.id === selectedId);
  const unread = chats.reduce((sum, c) => sum + c.unread, 0);

  function choose(id) {
    setSelectedId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setNotice('');
  }
  function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selected || !isAuthenticated) return;
    setChats(prev => prev.map(c => c.id === selectedId ? { ...c, messages: [...c.messages, { id: Date.now(), mine: true, text, time: nowTime() }], preview: `Tú: ${text}`, time: nowTime() } : c));
    setDraft('');
  }
  function addChat(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = Date.now();
    setChats(prev => [{ id, title: newTitle.trim(), subtitle: 'Conversación local de demostración', category: 'Vecinos', icon: Users, preview: 'Sin mensajes', time: 'Ahora', unread: 0, messages: [] }, ...prev]);
    setSelectedId(id); setFilter('Todos'); setSearch(''); setNewTitle(''); setShowNew(false);
  }
  if (!isAuthenticated) return <div className="gf-msg-locked"><MessageCircleMore size={40}/><h2>Mensajes privados</h2><p>Inicia sesión para acceder a tus conversaciones.</p>{onBack && <button onClick={onBack}>Volver al mapa</button>}</div>;

  return <section className="gf-msg-page">
    <header className="gf-msg-banner"><MessageCircleMore size={38}/><div><h1>Mensajes</h1><p>Comunícate con vecinos, voluntarios y organizadores de tu comunidad.</p></div>{onBack && <button className="gf-msg-back" onClick={onBack}><ArrowLeft size={16}/> Volver al mapa</button>}</header>
    <div className="gf-msg-shell">
      <aside className="gf-msg-sidebar">
        <div className="gf-msg-searchrow"><label className="gf-msg-search"><Search size={17}/><input placeholder="Buscar conversación..." value={search} onChange={e => setSearch(e.target.value)}/></label><button className="gf-msg-new" title="Nueva conversación" aria-label="Nueva conversación" onClick={() => setShowNew(true)}><SquarePen size={19}/></button></div>
        <div className="gf-msg-filters">{filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
        <div className="gf-msg-conversations">{visible.length === 0 ? <p className="gf-msg-empty">No se encontraron conversaciones.</p> : visible.map(c => { const Icon = c.icon; return <button key={c.id} className={`gf-msg-chatitem ${c.id === selectedId ? 'selected' : ''}`} onClick={() => choose(c.id)}><span className="gf-msg-avatar"><Icon size={23}/></span><span className="gf-msg-chatcopy"><strong>{c.title}</strong><small>{c.preview}</small></span><span className="gf-msg-chatmeta"><small>{c.time}</small>{c.unread > 0 && <b>{c.unread}</b>}</span></button>; })}</div>
      </aside>
      <div className="gf-msg-main">{selected ? <>
        <div className="gf-msg-chathead"><span className="gf-msg-avatar"><selected.icon size={25}/></span><div><h2>{selected.title}</h2><p>{selected.subtitle}</p></div><div className="gf-msg-actions"><button title="Llamadas no disponibles en la demostración" onClick={() => setNotice('Las llamadas de voz aún no están implementadas.')}><Phone size={19}/></button><button title="Videollamadas no disponibles" onClick={() => setNotice('Las videollamadas aún no están implementadas.')}><Video size={19}/></button><button title="Información" onClick={() => setNotice(`${selected.subtitle}. Conversación de demostración guardada solo durante esta sesión.`)}><Info size={19}/></button></div></div>
        <div className="gf-msg-thread"><span className="gf-msg-today">Hoy</span>{selected.messages.map(m => <article key={m.id} className={`gf-msg-bubble ${m.mine ? 'mine' : ''}`}>{!m.mine && <strong>{m.author}</strong>}<p>{m.text}</p><time>{m.time}</time></article>)}{selected.messages.length === 0 && <p className="gf-msg-empty">Escribe el primer mensaje de esta conversación de demostración.</p>}</div>
        {notice && <div className="gf-msg-notice">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}
        <form className="gf-msg-compose" onSubmit={send}><button type="button" title="Adjuntos no disponibles" onClick={() => setNotice('Los archivos adjuntos aún no están implementados.')}><Paperclip size={19}/></button><input aria-label="Escribe un mensaje" placeholder="Escribe un mensaje..." value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000}/><button type="button" title="Emojis" onClick={() => setDraft(v => v + ' 😊')}><Smile size={19}/></button><button className="gf-msg-send" type="submit" disabled={!draft.trim()} title="Enviar mensaje"><Send size={19}/></button></form>
      </> : <div className="gf-msg-empty">Selecciona una conversación.</div>}</div>
    </div><p className="gf-msg-disclaimer">{unread} mensajes sin leer · Demostración local: los mensajes no se envían a otras personas ni se guardan en el servidor.</p>
    {showNew && <div className="gf-msg-modalshade" role="presentation" onClick={() => setShowNew(false)}><form className="gf-msg-modal" onClick={e => e.stopPropagation()} onSubmit={addChat}><h2>Nueva conversación</h2><p>Se creará una conversación de demostración en este navegador.</p><label>Nombre de la conversación<input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={80} required placeholder="Ej. Vecinos del barrio"/></label><div><button type="button" onClick={() => setShowNew(false)}>Cancelar</button><button type="submit" className="gf-msg-primary">Crear conversación</button></div></form></div>}
  </section>;
}
