import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircleMore, Search, SquarePen, Users, Wrench, CalendarDays, ShoppingCart, Send, X, UserPlus, Volume2, Languages, Mic, MicOff, Star } from 'lucide-react';
import { chatApi, ratingsApi } from '../../api/index.js';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './Messages.css';

const filters = ['Todos', 'Vecinos', 'Servicios', 'Eventos', 'Grupos', 'Ventas'];
const iconFor = (category) => category === 'Servicios' ? Wrench : category === 'Eventos' ? CalendarDays : category === 'Ventas' ? ShoppingCart : Users;
const formatTime = (value) => { if (!value) return ''; const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); };
const speak = (text, lang) => { if (!('speechSynthesis' in window) || !text) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang || document.documentElement.lang || 'es-PE'; window.speechSynthesis.speak(u); };

export default function MessagesPage({ isAuthenticated = false, initialConversationId = null, initialPublication = null, onBack }) {
  const { language, t } = usePreferences();
  const [conversations, setConversations] = useState([]), [publicGroups, setPublicGroups] = useState([]), [selectedId, setSelectedId] = useState(initialConversationId), [messages, setMessages] = useState([]), [filter, setFilter] = useState('Todos'), [search, setSearch] = useState(''), [draft, setDraft] = useState(''), [notice, setNotice] = useState(''), [showNew, setShowNew] = useState(false), [newTitle, setNewTitle] = useState(''), [newCategory, setNewCategory] = useState('Vecinos'), [sending, setSending] = useState(false), [recording, setRecording] = useState(false), [translation, setTranslation] = useState({}), [ratingTarget, setRatingTarget] = useState(null), [rating, setRating] = useState(5), [ratingComment, setRatingComment] = useState('');
  const recognitionRef = useRef(null);
  const autoJoinedGeneralRef = useRef(false);

  const load = async () => {
    try {
      const stamp = Date.now();
      let [mine, groups] = await Promise.all([
        chatApi.listar({ _refresh: stamp }),
        chatApi.publicas({ _refresh: stamp })
      ]);
      mine = Array.isArray(mine) ? mine : [];
      groups = Array.isArray(groups) ? groups : [];
      const general = groups.find(c => c.publicGroup && /vecinos/i.test(c.category || c.title || ''));
      if (general && !autoJoinedGeneralRef.current) {
        autoJoinedGeneralRef.current = true;
        if (!mine.some(c => String(c.id) === String(general.id))) {
          try {
            await chatApi.unirse(general.id);
            mine = await chatApi.listar({ _refresh: Date.now() });
          } catch (joinError) { console.warn('No se pudo unir al canal general:', joinError); }
        }
      }
      setConversations(Array.isArray(mine) ? mine : []);
      setPublicGroups(groups);
    } catch (e) { setNotice(e.message || t('messages.error')); }
  };
  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedId) return;
    const general = [...conversations, ...publicGroups].find(c => /vecinos/i.test(c.category || c.title || ''));
    if (general) setSelectedId(general.id);
    else if (conversations.length) setSelectedId(conversations[0].id);
    else if (publicGroups.length) setSelectedId(publicGroups[0].id);
  }, [publicGroups, conversations, selectedId]);
  useEffect(() => { if (initialConversationId) setSelectedId(initialConversationId); }, [initialConversationId]);
  useEffect(() => {
    if (!isAuthenticated || !selectedId) return;
    let cancelled = false;
    const refreshThread = async () => {
      try {
        const joined = conversations.some(c => String(c.id) === String(selectedId));
        if (joined) await chatApi.marcarLeido(selectedId);
        const data = await chatApi.mensajes(selectedId);
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
        await load();
      } catch (e) {
        if (!cancelled) setNotice(e.message || t('messages.error'));
      }
    };
    refreshThread();
    const timer = window.setInterval(refreshThread, 3500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selectedId, isAuthenticated]);

  const visible = useMemo(() => conversations.filter(c => !c.publicGroup && (filter === 'Todos' || c.category === filter) && `${c.title||''} ${c.subtitle||''} ${c.ownerUsername||''}`.toLowerCase().includes(search.toLowerCase())), [conversations, filter, search]);
  const visibleGroups = useMemo(() => publicGroups.filter(c => (filter === 'Todos' || c.category === filter || (filter === 'Grupos' && c.publicGroup)) && `${c.title||''} ${c.subtitle||''} ${c.ownerUsername||''}`.toLowerCase().includes(search.toLowerCase())), [publicGroups, filter, search]);
  const selected = [...conversations, ...publicGroups].find(c => String(c.id) === String(selectedId));
  const selectedJoined = selected ? conversations.some(c => String(c.id) === String(selected.id)) : false;

  useEffect(() => {
    const candidates = [...visibleGroups, ...visible];
    if (candidates.length && !candidates.some(c => String(c.id) === String(selectedId))) {
      setSelectedId(candidates[0].id);
    }
  }, [filter, search, publicGroups.length, conversations.length]);

  const startPublication = async () => {
    const a = initialPublication?.author || initialPublication?.publisher || initialPublication?.user || {};
    const id = initialPublication?.authorId ?? initialPublication?.publisherId ?? initialPublication?.userId ?? a.id;
    if (!id) return setNotice(t('messages.authorMissing'));
    try { const created = await chatApi.crear({ title: a.name || initialPublication.authorName || 'Conversación', subtitle: `Publicación: ${initialPublication.title || 'Publicación'}`, category: 'Vecinos', recipientId: id }); setSelectedId(created.id); await load(); } catch(e) { setNotice(e.message || t('messages.error')); }
  };
  useEffect(() => { if (isAuthenticated && initialPublication) startPublication(); }, [isAuthenticated, initialPublication]);

  const send = async (e) => { e.preventDefault(); const text = draft.trim(); if (!text || !selectedId || sending) return; setSending(true); try { const m = await chatApi.enviar(selectedId, text); setMessages(x => [...x, m]); setDraft(''); await load(); } catch(e) { setNotice(e.message || t('messages.error')); } finally { setSending(false); } };
  const createGroup = async (e) => { e.preventDefault(); if (!newTitle.trim()) return; try { const c = await chatApi.crearPublico({ title:newTitle.trim(), subtitle:`Grupo comunitario · ${newCategory}`, category:newCategory }); setShowNew(false); setNewTitle(''); await load(); setSelectedId(c.id); } catch(e) { setNotice(e.message || t('messages.error')); } };
  const join = async (id) => { try { const c = await chatApi.unirse(id); setSelectedId(c.id); await load(); } catch(e) { setNotice(e.message || t('messages.error')); } };
  const translate = async (id, text) => { try { const target = language || 'es'; const source = target === 'es' ? 'en' : 'es'; const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`); const j = await r.json(); setTranslation(x=>({...x,[id]: j?.responseData?.translatedText || text})); } catch { setTranslation(x=>({...x,[id]: text})); } };
  const toggleVoice = () => { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return setNotice(t('messages.voiceUnsupported')); if (recording) { recognitionRef.current?.stop(); setRecording(false); return; } const r = new SR(); recognitionRef.current=r; r.lang = language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-PE'; r.interimResults=false; r.onresult=e=>setDraft(x=>`${x} ${e.results[0][0].transcript}`.trim()); r.onend=()=>setRecording(false); r.onerror=()=>{setRecording(false);setNotice(t('messages.voiceError'));}; r.start(); setRecording(true); };
  const submitRating = async(e)=>{e.preventDefault(); if(!ratingTarget) return; try {await ratingsApi.crear({reviewedId:ratingTarget.ownerId, serviceId:ratingTarget.serviceId||null, rating, comment:ratingComment}); setRatingTarget(null); setRatingComment(''); setNotice(t('messages.reviewSaved'));}catch(err){setNotice(err.message||t('messages.error'));}};

  if (!isAuthenticated) return <div className="gf-msg-locked"><MessageCircleMore size={40}/><h2>{t('messages.title')}</h2><p>{t('messages.login')}</p>{onBack&&<button onClick={onBack}>{t('common.back')}</button>}</div>;
  return <section className="gf-msg-page">
    <header className="gf-msg-banner"><MessageCircleMore size={38}/><div><h1>{t('messages.title')}</h1><p>{t('messages.subtitle')}</p></div></header>
    <div className="gf-msg-shell">
      <aside className="gf-msg-sidebar">
        <div className="gf-msg-searchrow"><label className="gf-msg-search"><Search size={17}/><input placeholder={t('messages.search')} value={search} onChange={e=>setSearch(e.target.value)}/></label><button className="gf-msg-new" title={t('messages.newGroup')} onClick={()=>setShowNew(true)}><SquarePen size={19}/></button></div>
        <div className="gf-msg-filters">{filters.map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div>
        <div className="gf-msg-group-label"><Users size={15}/> {t('messages.publicGroups')}</div>
        <div className="gf-msg-conversations">
          {visibleGroups.length===0 && <p className="gf-msg-empty">No hay canales todavía. Usa "Nuevo grupo" para crear uno.</p>}{visibleGroups.map(c=>{const I=iconFor(c.category); const joined=conversations.some(x=>String(x.id)===String(c.id)); return <div className={`gf-msg-chatitem ${String(c.id)===String(selectedId)?'selected':''}`} key={`g-${c.id}`}><button className="gf-msg-chatopen" onClick={()=>setSelectedId(c.id)}><span className="gf-msg-avatar"><I size={23}/></span><span className="gf-msg-chatcopy"><strong>{c.title}</strong><small>@{c.ownerUsername || 'usuario'} · {c.memberCount || 0} participantes · {c.preview}</small></span></button>{c.unread>0&&<b className="gf-msg-group-unread">{c.unread}</b>}{!joined&&<button className="gf-msg-join" title={t('messages.join')} onClick={()=>join(c.id)}><UserPlus size={17}/></button>}</div>})}
          <div className="gf-msg-group-label"><MessageCircleMore size={15}/> {t('messages.myConversations')}</div>
          {visible.length===0 && visibleGroups.length===0 ? <p className="gf-msg-empty">{t('messages.empty')}</p> : visible.map(c=>{const I=iconFor(c.category); return <button key={c.id} className={`gf-msg-chatitem ${String(c.id)===String(selectedId)?'selected':''}`} onClick={()=>setSelectedId(c.id)}><span className="gf-msg-avatar"><I size={23}/></span><span className="gf-msg-chatcopy"><strong>{c.title}</strong><small>{c.subtitle||c.preview}</small></span><span className="gf-msg-chatmeta"><small>{formatTime(c.time)}</small>{c.unread>0&&<b>{c.unread}</b>}</span></button>})}
        </div>
      </aside>
      <div className="gf-msg-main">
        {selected ? <><div className="gf-msg-chathead"><span className="gf-msg-avatar"><Users size={25}/></span><div><h2>{selected.title}</h2><p>{selected.publicGroup ? `@${selected.ownerUsername || 'usuario'} · ${selected.category}` : selected.subtitle || selected.category}</p></div><div className="gf-msg-actions">{selected.publicGroup && !selectedJoined && <button className="gf-msg-join-head" onClick={()=>join(selected.id)} title={t('messages.join')}><UserPlus size={17}/>{t('messages.join')}</button>}{selected.ownerId&&<button onClick={()=>setRatingTarget({ownerId:selected.ownerId,serviceId:selected.serviceId})} title={t('messages.review')}><Star size={17}/></button>}</div></div>
          <div className="gf-msg-thread">{messages.length===0&&<p className="gf-msg-empty">{t('messages.first')}</p>}{messages.map(m=><article key={m.id} className={`gf-msg-bubble ${m.mine?'mine':''}`}>{!m.mine&&<strong>{m.authorUsername ? `@${m.authorUsername}` : m.author}</strong>}<p>{translation[m.id]||m.text}</p><div className="gf-msg-bubble-actions"><time>{formatTime(m.createdAt)}</time><button onClick={()=>speak(translation[m.id]||m.text, language==='en'?'en-US':language==='pt'?'pt-BR':'es-PE')} title={t('messages.speak')}><Volume2 size={14}/></button><button onClick={()=>translate(m.id,m.text)} title={t('messages.translate')}><Languages size={14}/></button></div></article>)}</div>
          {notice&&<div className="gf-msg-notice">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
          <form className="gf-msg-compose" onSubmit={send}>{selected.publicGroup && !selectedJoined && <div className="gf-msg-readonly">{t('messages.joinToWrite')}</div>}<button type="button" className={recording?'recording':''} onClick={toggleVoice} disabled={selected.publicGroup && !selectedJoined} title={recording?t('messages.stopVoice'):t('messages.voice')}><>{recording?<MicOff size={19}/>:<Mic size={19}/>}</></button><input aria-label={t('messages.write')} placeholder={t('messages.write')} value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000} disabled={selected.publicGroup && !selectedJoined}/><button className="gf-msg-send" type="submit" disabled={!draft.trim()||sending||(selected.publicGroup&&!selectedJoined)}><Send size={19}/></button></form></> : <div className="gf-msg-empty">{t('messages.select')}</div>}
      </div>
    </div>
    {showNew&&<div className="gf-msg-modalshade" onClick={()=>setShowNew(false)}><form className="gf-msg-modal" onClick={e=>e.stopPropagation()} onSubmit={createGroup}><h2>{t('messages.newGroup')}</h2><label>{t('messages.groupName')}<input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} maxLength={80} required placeholder="Ej. Vecinos de Cayma"/></label><label>{t('messages.category')}<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{filters.filter(x=>x!=='Todos').map(x=><option key={x}>{x}</option>)}</select></label><div className="gf-msg-modal-actions"><button type="button" onClick={()=>setShowNew(false)}>{t('common.cancel')}</button><button className="gf-msg-primary" type="submit">{t('messages.create')}</button></div></form></div>}
    {ratingTarget&&<div className="gf-msg-modalshade" onClick={()=>setRatingTarget(null)}><form className="gf-msg-modal" onClick={e=>e.stopPropagation()} onSubmit={submitRating}><h2>{t('messages.review')}</h2><p>{t('messages.reviewHint')}</p><div className="gf-msg-stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?'on':''} onClick={()=>setRating(n)}><Star size={26} fill="currentColor"/></button>)}</div><textarea value={ratingComment} onChange={e=>setRatingComment(e.target.value)} maxLength={500} placeholder={t('messages.reviewPlaceholder')}/><div className="gf-msg-modal-actions"><button type="button" onClick={()=>setRatingTarget(null)}>{t('common.cancel')}</button><button className="gf-msg-primary">{t('messages.saveReview')}</button></div></form></div>}
  </section>;
}
