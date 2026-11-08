import { useMemo, useState } from 'react';
import { Bot, Send, X, Map, MessageCircle, Mic, Volume2, Languages, Sparkles } from 'lucide-react';
import { usePreferences } from '../preferences/PreferencesContext.jsx';

const replies = {
  es: {
    welcome: 'Hola. Soy el asistente de GeoFastPe. Puedo ayudarte a buscar lugares, abrir secciones, usar Mensajes, cambiar el idioma o darte indicaciones sobre el mapa.',
    examples: ['Buscar eventos cerca', 'Abrir Mensajes', '¿Cómo cambio el idioma?', 'Buscar servicios'],
  },
  en: {
    welcome: 'Hi. I am the GeoFastPe assistant. I can help you search places, open sections, use Messages, change language or explain map features.',
    examples: ['Find events nearby', 'Open Messages', 'How do I change language?', 'Find services'],
  },
  pt: {
    welcome: 'Olá. Sou o assistente do GeoFastPe. Posso ajudar a buscar lugares, abrir seções, usar Mensagens, mudar o idioma ou explicar o mapa.',
    examples: ['Encontrar eventos próximos', 'Abrir Mensagens', 'Como mudo o idioma?', 'Encontrar serviços'],
  },
};

export default function GeoFastAssistant({ onSelectSection }) {
  const { language = 'es' } = usePreferences();
  const lang = replies[language] ? language : 'es';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [items, setItems] = useState(() => [{ from: 'bot', text: replies[lang].welcome }]);

  const commands = useMemo(() => [
    { test: /mensaje|chat|grupo|message|mensagen/i, action: () => onSelectSection?.('Mensajes'), response: lang === 'es' ? 'Abriendo Mensajes. Allí puedes ver canales públicos por categoría y unirte para participar.' : lang === 'pt' ? 'Abrindo Mensagens. Você pode ver canais públicos por categoria e entrar para participar.' : 'Opening Messages. You can see public channels by category and join to participate.' },
    { test: /evento|event/i, action: () => onSelectSection?.('Eventos'), response: lang === 'es' ? 'Abriendo Eventos. También puedes buscar eventos desde el mapa.' : 'Opening Events.' },
    { test: /servicio|service|serviço/i, action: () => onSelectSection?.('Servicios'), response: lang === 'es' ? 'Abriendo Servicios.' : lang === 'pt' ? 'Abrindo Serviços.' : 'Opening Services.' },
    { test: /venta|compr|sale/i, action: () => onSelectSection?.('Ventas'), response: lang === 'es' ? 'Abriendo Ventas.' : 'Opening Sales.' },
    { test: /reporte|report/i, action: () => onSelectSection?.('Reportes'), response: lang === 'es' ? 'Abriendo Reportes.' : 'Opening Reports.' },
    { test: /idioma|language|língua|traduc/i, action: () => onSelectSection?.('Configuración'), response: lang === 'es' ? 'Abriendo Configuración. Allí puedes cambiar el idioma y las preferencias de la interfaz.' : lang === 'pt' ? 'Abrindo Configurações para alterar idioma e preferências.' : 'Opening Settings so you can change language and interface preferences.' },
    { test: /mapa|buscar|cerca|near|find|search/i, action: () => onSelectSection?.('Inicio'), response: lang === 'es' ? 'Puedes buscar eventos, servicios, ventas y reportes desde el buscador del mapa. También puedes usar el micrófono.' : 'You can search events, services, sales and reports from the map search. You can also use the microphone.' },
  ], [lang, onSelectSection]);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-PE';
    window.speechSynthesis.speak(u);
  };

  const send = (value = draft) => {
    const text = value.trim();
    if (!text) return;
    const cmd = commands.find(c => c.test.test(text));
    const response = cmd?.response || (lang === 'es'
      ? 'Puedo ayudarte con el mapa, eventos, servicios, ventas, reportes, Mensajes, configuración, idioma y funciones de voz. Prueba una de las opciones sugeridas.'
      : lang === 'pt'
        ? 'Posso ajudar com mapa, eventos, serviços, vendas, relatórios, Mensagens, configurações, idioma e voz.'
        : 'I can help with the map, events, services, sales, reports, Messages, settings, language and voice features.');
    cmd?.action?.();
    setItems(x => [...x, { from: 'user', text }, { from: 'bot', text: response }]);
    setDraft('');
  };

  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setItems(x => [...x, { from: 'bot', text: lang === 'es' ? 'El reconocimiento de voz no está disponible en este navegador. Prueba Chrome o Edge.' : 'Voice recognition is not available in this browser. Try Chrome or Edge.' }]); return; }
    if (recording) return;
    const r = new SR();
    r.lang = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-BR' : 'es-PE';
    r.interimResults = false;
    r.onresult = e => send(e.results[0][0].transcript);
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    setRecording(true); r.start();
  };

  return <>
    <button className="gf-assistant-fab" onClick={() => setOpen(true)} title="GeoFastPe AI"><Bot size={22}/><span>Asistente</span></button>
    {open && <div className="gf-assistant-panel">
      <header><span><Bot size={20}/> GeoFastPe AI</span><button onClick={() => setOpen(false)}><X size={18}/></button></header>
      <div className="gf-assistant-tools"><span><Sparkles size={14}/> Asistente inteligente</span><span><Map size={14}/> Mapa</span><span><Languages size={14}/> {lang.toUpperCase()}</span></div>
      <div className="gf-assistant-thread">
        {items.map((m,i)=><div key={i} className={`gf-assistant-msg ${m.from}`}><p>{m.text}</p>{m.from==='bot'&&<button onClick={()=>speak(m.text)} title="Escuchar"><Volume2 size={14}/></button>}</div>)}
        {items.length===1&&<div className="gf-assistant-suggestions">{replies[lang].examples.map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}</div>}
      </div>
      <form onSubmit={e=>{e.preventDefault();send();}} className="gf-assistant-compose"><button type="button" onClick={voice} className={recording?'recording':''}><Mic size={18}/></button><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={lang==='es'?'Pregúntame algo...':'Ask me something...'}/><button type="submit"><Send size={18}/></button></form>
    </div>}
  </>;
}
