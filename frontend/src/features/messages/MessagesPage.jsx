import { useEffect, useMemo, useState } from 'react';
import { MessageCircleMore, Search, SquarePen, Users, Wrench, CalendarDays, ShoppingCart, Send, X } from 'lucide-react';
import { chatApi } from '../../api/index.js';
import './Messages.css';

const filters = ['Todos', 'Vecinos', 'Servicios', 'Eventos', 'Grupos', 'Ventas'];

const iconFor = (category) => {
  if (category === 'Servicios') return Wrench;
  if (category === 'Eventos') return CalendarDays;
  if (category === 'Ventas') return ShoppingCart;
  return Users;
};

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

export default function MessagesPage({ isAuthenticated = false, initialConversationId = null, onBack }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Vecinos');
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const data = await chatApi.listar(filter === 'Todos' ? {} : { categoria: filter });
      setConversations(data);
      return data;
    } catch (error) {
      setNotice(error.message);
      return [];
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated, filter]);

  useEffect(() => {
    if (initialConversationId) setSelectedId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    if (!isAuthenticated || !selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await chatApi.marcarLeido(selectedId);
        const data = await chatApi.mensajes(selectedId);
        if (!cancelled) setMessages(data);
        await loadConversations();
      } catch (error) {
        if (!cancelled) setNotice(error.message);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, isAuthenticated]);

  const visible = useMemo(() => conversations.filter((c) =>
    `${c.title} ${c.subtitle || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [conversations, search]);

  const selected = conversations.find((c) => c.id === selectedId);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId || sending) return;
    setSending(true);
    try {
      const nuevo = await chatApi.enviar(selectedId, text);
      setMessages((previous) => [...previous, nuevo]);
      setDraft('');
      await loadConversations();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSending(false);
    }
  };

  const createConversation = async (event) => {
    event.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const creada = await chatApi.crear({ title: newTitle.trim(), subtitle: null, category: newCategory });
      setShowNew(false);
      setNewTitle('');
      setFilter('Todos');
      setSearch('');
      await loadConversations();
      setSelectedId(creada.id);
    } catch (error) {
      setNotice(error.message);
    }
  };

  if (!isAuthenticated) {
    return <div className="gf-msg-locked">
      <MessageCircleMore size={40}/>
      <h2>Mensajes privados</h2>
      <p>Inicia sesión para acceder a tus conversaciones.</p>
      {onBack && <button onClick={onBack}>Volver al mapa</button>}
    </div>;
  }

  return <section className="gf-msg-page">
    <header className="gf-msg-banner"><MessageCircleMore size={38}/><div><h1>Mensajes</h1><p>Comunícate con vecinos, voluntarios y organizadores de tu comunidad.</p></div></header>
    <div className="gf-msg-shell">
      <aside className="gf-msg-sidebar">
        <div className="gf-msg-searchrow">
          <label className="gf-msg-search"><Search size={17}/><input placeholder="Buscar conversación..." value={search} onChange={(e) => setSearch(e.target.value)}/></label>
          <button className="gf-msg-new" title="Nueva conversación" aria-label="Nueva conversación" onClick={() => setShowNew(true)}><SquarePen size={19}/></button>
        </div>
        <div className="gf-msg-filters">{filters.map((f) => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
        <div className="gf-msg-conversations">
          {visible.length === 0 ? <p className="gf-msg-empty">No tienes conversaciones todavía.</p> : visible.map((c) => {
            const Icon = iconFor(c.category);
            return <button key={c.id} className={`gf-msg-chatitem ${c.id === selectedId ? 'selected' : ''}`} onClick={() => setSelectedId(c.id)}>
              <span className="gf-msg-avatar"><Icon size={23}/></span>
              <span className="gf-msg-chatcopy"><strong>{c.title}</strong><small>{c.preview}</small></span>
              <span className="gf-msg-chatmeta"><small>{formatTime(c.time)}</small>{c.unread > 0 && <b>{c.unread}</b>}</span>
            </button>;
          })}
        </div>
      </aside>

      <div className="gf-msg-main">
        {selected ? <>
          <div className="gf-msg-chathead">
            <span className="gf-msg-avatar">{(() => { const Icon = iconFor(selected.category); return <Icon size={25}/>; })()}</span>
            <div><h2>{selected.title}</h2><p>{selected.subtitle || selected.category}</p></div>
          </div>
          <div className="gf-msg-thread">
            {messages.length === 0 && <p className="gf-msg-empty">Escribe el primer mensaje de esta conversación.</p>}
            {messages.map((m) => <article key={m.id} className={`gf-msg-bubble ${m.mine ? 'mine' : ''}`}>
              {!m.mine && <strong>{m.author}</strong>}
              <p>{m.text}</p>
              <time>{formatTime(m.createdAt)}</time>
            </article>)}
          </div>
          {notice && <div className="gf-msg-notice">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}
          <form className="gf-msg-compose" onSubmit={send}>
            <input aria-label="Escribe un mensaje" placeholder="Escribe un mensaje..." value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000}/>
            <button className="gf-msg-send" type="submit" disabled={!draft.trim() || sending} title="Enviar mensaje"><Send size={19}/></button>
          </form>
        </> : <div className="gf-msg-empty">Selecciona una conversación o crea una nueva.</div>}
      </div>
    </div>

    {showNew && <div className="gf-msg-modalshade" role="presentation" onClick={() => setShowNew(false)}>
      <form className="gf-msg-modal" onClick={(e) => e.stopPropagation()} onSubmit={createConversation}>
        <h2>Nueva conversación</h2>
        <label>Nombre de la conversación<input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={80} required placeholder="Ej. Vecinos del barrio"/></label>
        <label>Categoría<select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>{filters.filter((f) => f !== 'Todos').map((f) => <option key={f}>{f}</option>)}</select></label>
        <div><button type="button" onClick={() => setShowNew(false)}>Cancelar</button><button type="submit" className="gf-msg-primary">Crear conversación</button></div>
      </form>
    </div>}
  </section>;
}
