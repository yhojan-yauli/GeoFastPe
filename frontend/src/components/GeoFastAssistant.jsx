import { useState } from 'react';
import { Bot, Send, X, Map, Mic, Volume2, Languages, Sparkles } from 'lucide-react';
import { usePreferences } from '../preferences/PreferencesContext.jsx';

const content = {
  es: { welcome: 'Hola. Soy GeoFastPe AI. Puedo buscar publicaciones cercanas, encontrar lugares y marcar rutas directamente en el mapa.', examples: ['Márcame la ruta a la Plaza de Armas', 'Busca eventos cerca de mí', 'Llévame al hospital más cercano', 'Activa el mapa satelital'], placeholder: 'Escribe una instrucción...', route: 'Estoy calculando la ruta solicitada.', routeError: 'No pude calcular esa ruta: ', nearby: 'Estoy buscando primero publicaciones cercanas y después lugares del mapa.', section: 'Abriendo ', radius: 'Radio actualizado a ', notificationsOn: 'Las notificaciones de novedades cercanas están activadas.', notificationsOff: 'Las notificaciones están desactivadas.', fallback: 'Puedo buscar publicaciones y lugares, marcar rutas, cambiar capas, ajustar el radio y abrir secciones.' },
  en: { welcome: 'Hello. I am GeoFastPe AI. I can find nearby posts and places and draw routes directly on the map.', examples: ['Show me the route to the main square', 'Find events near me', 'Take me to the nearest hospital', 'Turn on satellite map'], placeholder: 'Type an instruction...', route: 'Calculating your route.', routeError: 'I could not calculate that route: ', nearby: 'Searching nearby community posts first, then map locations.', section: 'Opening ', radius: 'Search radius set to ', notificationsOn: 'Nearby notifications are enabled.', notificationsOff: 'Notifications are disabled.', fallback: 'I can search posts and places, draw routes, change map layers, adjust radius and open sections.' },
  pt: { welcome: 'Olá. Sou o GeoFastPe AI. Posso encontrar publicações e lugares próximos e traçar rotas diretamente no mapa.', examples: ['Trace a rota até a praça principal', 'Encontre eventos próximos', 'Leve-me ao hospital mais próximo', 'Ative o mapa de satélite'], placeholder: 'Digite uma instrução...', route: 'Calculando sua rota.', routeError: 'Não consegui calcular a rota: ', nearby: 'Buscando primeiro publicações próximas e depois lugares no mapa.', section: 'Abrindo ', radius: 'Raio de busca atualizado para ', notificationsOn: 'Notificações próximas ativadas.', notificationsOff: 'Notificações desativadas.', fallback: 'Posso buscar publicações e lugares, traçar rotas, mudar camadas, ajustar o raio e abrir seções.' },
  qu: { welcome: 'Allinllachu. GeoFastPe yanapakuq kani. Kaypiqa qayllapi willakuykunata maskayta, ñankunata rikuchiyta atini.', examples: ['Plaza de Armasman ñanta rikuchiy', 'Qayllapi ruraykunata maskay', 'Qaylla hampinaman pusaway'], placeholder: 'Imata ruwanaypaq qillqay...', route: 'Ñanta yupachkani.', routeError: 'Ñanta mana tariyta atirqanichu: ', nearby: 'Ñawpaqta qayllapi willakuykunata, chaymanta mapapi kitikunata maskachkani.', section: 'Kichachkani: ', radius: 'Maskana suyunchasqa: ', notificationsOn: 'Qaylla musuq willakuykuna kachkan.', notificationsOff: 'Willakuy willaykuna wañuchisqa.', fallback: 'Willakuykunata maskayta, ñankunata rikuchiyta, mapata tikrayta atini.' },
  ay: { welcome: 'Kamisaraki. Nayax GeoFastPe yanapiriwa. Jak’an yatiyawinaka thaqhiristwa ukat thakhinak mapa taypin uñacht’ayiristwa.', examples: ['Plaza de Armas ukar thakhi uñacht’ayita', 'Jak’an wakichäwinaka thaqham', 'Jak’a qullañ utar irpita'], placeholder: 'Kunsa lurañ munta uk qillqt’am...', route: 'Thakhi jakasktwa.', routeError: 'Uka thakhi janiw jikxatkti: ', nearby: 'Nayraqata jak’an yatiyawinaka, ukatxa mapa chiqanak thaqtaskta.', section: 'Uñacht’ayaskta: ', radius: 'Thaqha radio wakicht’ata: ', notificationsOn: 'Jak’an machaq yatiyawinakax jist’aratawa.', notificationsOff: 'Yatiyäwinakax jist’antatawa.', fallback: 'Yatiyawinaka thaqhiristwa, thakhinak uñacht’ayiristwa, mapa capas mayjt’ayiristwa.' },
  fr: { welcome: 'Bonjour. Je suis GeoFastPe AI. Je peux rechercher les publications proches, trouver des lieux et tracer des itinéraires.', examples: ['Itinéraire vers la place principale', 'Événements à proximité', 'Hôpital le plus proche'], placeholder: 'Écrivez une instruction...', route: 'Calcul de votre itinéraire.', routeError: 'Itinéraire impossible : ', nearby: 'Recherche des publications proches, puis des lieux.', section: 'Ouverture de ', radius: 'Rayon défini sur ', notificationsOn: 'Notifications de proximité activées.', notificationsOff: 'Notifications désactivées.', fallback: 'Je peux rechercher, tracer des itinéraires, changer les couches et ouvrir les sections.' },
  de: { welcome: 'Hallo. Ich bin GeoFastPe AI. Ich finde nahe Beiträge und Orte und plane Routen auf der Karte.', examples: ['Route zum Hauptplatz', 'Veranstaltungen in der Nähe', 'Nächstes Krankenhaus'], placeholder: 'Anweisung eingeben...', route: 'Route wird berechnet.', routeError: 'Route nicht gefunden: ', nearby: 'Suche zuerst nahe Beiträge und danach Orte.', section: 'Öffne ', radius: 'Suchradius eingestellt auf ', notificationsOn: 'Benachrichtigungen aktiviert.', notificationsOff: 'Benachrichtigungen deaktiviert.', fallback: 'Ich kann Beiträge und Orte suchen, Routen planen, Kartenebenen ändern und Bereiche öffnen.' },
  it: { welcome: 'Ciao. Sono GeoFastPe AI. Posso cercare pubblicazioni vicine, trovare luoghi e tracciare percorsi.', examples: ['Percorso per la piazza principale', 'Eventi vicino a me', 'Ospedale più vicino'], placeholder: 'Scrivi un comando...', route: 'Sto calcolando il percorso.', routeError: 'Non riesco a calcolare il percorso: ', nearby: 'Cerco prima le pubblicazioni vicine e poi i luoghi.', section: 'Apro ', radius: 'Raggio di ricerca impostato a ', notificationsOn: 'Notifiche vicine attivate.', notificationsOff: 'Notifiche disattivate.', fallback: 'Posso cercare, tracciare percorsi, cambiare livelli della mappa e aprire sezioni.' },
  zh: { welcome: '你好，我是 GeoFastPe AI。我可以搜索附近的社区信息、地点并规划路线。', examples: ['导航到主广场', '搜索附近活动', '最近的医院'], placeholder: '输入指令...', route: '正在规划路线。', routeError: '无法规划路线：', nearby: '先搜索附近社区信息，再搜索地图地点。', section: '正在打开', radius: '搜索半径已设置为', notificationsOn: '附近通知已开启。', notificationsOff: '通知已关闭。', fallback: '我可以搜索信息和地点、规划路线、更改地图图层和打开功能。' },
  ja: { welcome: 'こんにちは。GeoFastPe AIです。近くの投稿や場所を検索し、地図上でルートを表示できます。', examples: ['中央広場へのルート', '近くのイベント', '最寄りの病院'], placeholder: '指示を入力...', route: 'ルートを計算しています。', routeError: 'ルートを計算できませんでした：', nearby: '近くの投稿を先に、その後に地図上の場所を検索します。', section: '開いています：', radius: '検索範囲：', notificationsOn: '近くの通知を有効にしました。', notificationsOff: '通知を無効にしました。', fallback: '投稿や場所の検索、ルート表示、地図レイヤーの変更ができます。' },
  ar: { welcome: 'مرحباً، أنا GeoFastPe AI. يمكنني البحث عن المنشورات والأماكن القريبة ورسم المسارات.', examples: ['المسار إلى الساحة الرئيسية', 'فعاليات قريبة', 'أقرب مستشفى'], placeholder: 'اكتب أمراً...', route: 'جارٍ حساب المسار.', routeError: 'تعذر حساب المسار: ', nearby: 'أبحث أولاً عن المنشورات القريبة ثم الأماكن على الخريطة.', section: 'جارٍ فتح ', radius: 'تم ضبط نطاق البحث إلى ', notificationsOn: 'تم تفعيل إشعارات الأماكن القريبة.', notificationsOff: 'تم إيقاف الإشعارات.', fallback: 'يمكنني البحث ورسم المسارات وتغيير طبقات الخريطة وفتح الأقسام.' }
};

const speechLocales = { es: 'es-PE', en: 'en-US', pt: 'pt-BR', qu: 'qu-PE', ay: 'ay-BO', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-SA' };

export default function GeoFastAssistant({ onSelectSection }) {
  const { language = 'es' } = usePreferences();
  const lang = content[language] ? language : 'es';
  const t = content[lang];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState(() => [{ from: 'bot', text: t.welcome }]);

  const speak = text => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocales[lang] || 'es-PE';
    window.speechSynthesis.speak(utterance);
  };

  const addConversation = (text, response) => setItems(current => [...current, { from: 'user', text }, { from: 'bot', text: response }]);

  const send = async (value = draft) => {
    const text = String(value || '').trim();
    if (!text || busy) return;
    setDraft(''); setBusy(true);
    const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const api = window.GeoFastPe;
    try {
      const routeMatch = normalized.match(/(?:show me (?:the )?route|give me (?:the )?route|marca(?:me)?|traza(?:me)?|calcula(?:me)?|muestrame|dame|show me|navigate|directions|take me|trace|ruta|route)\s+(?:la\s+)?(?:ruta|camino|route)?\s*(?:a|hacia|hasta|to|al|a la|para)\s+(.+)/i)
        || normalized.match(/(?:llevame|llevarme|take me)\s+(?:al|a la|a|to)\s+(.+)/i);
      if (routeMatch?.[1] && api?.routeTo) {
        addConversation(text, t.route);
        try { const result = await api.routeTo(routeMatch[1].trim()); const km = (Number(result.distanceMeters || 0) / 1000).toFixed(1); const min = Math.round(Number(result.durationSeconds || 0) / 60); setItems(current => [...current, { from: 'bot', text: `${routeMatch[1]} · ${km} km · ${min} min` }]); }
        catch (error) { setItems(current => [...current, { from: 'bot', text: t.routeError + (error.message || 'verifica la conexión y el destino.') }]); }
        return;
      }

      if (/notificacion|notificaciones|notification/.test(normalized)) {
        const enabled = !/(desactiva|apaga|quita|off|disable)/.test(normalized);
        if (enabled && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
        const allowed = enabled && ('Notification' in window) && Notification.permission === 'granted';
        localStorage.setItem('gf-nearby-alerts', String(allowed));
        addConversation(text, allowed ? t.notificationsOn : t.notificationsOff); return;
      }
      if (/aumenta|amplia|incrementa|increase|expand/.test(normalized) && /radio|radio de busqueda|radius/.test(normalized)) {
        const state = api?.getState?.() || { radius: 1000 }; const radius = api?.setRadius?.(Math.min(50000, state.radius * 2)) || state.radius * 2;
        addConversation(text, `${t.radius}${(radius / 1000).toFixed(1)} km.`); return;
      }
      if (/reduce|disminuye|reduce|decrease|smaller/.test(normalized) && /radio|radius/.test(normalized)) {
        const state = api?.getState?.() || { radius: 2000 }; const radius = api?.setRadius?.(Math.max(250, state.radius / 2)) || state.radius / 2;
        addConversation(text, `${t.radius}${(radius / 1000).toFixed(1)} km.`); return;
      }
      const routeMode = /a pie|caminando|walking/.test(normalized) ? 'walking' : /bicicleta|bici|cycling|bike/.test(normalized) ? 'cycling' : /en auto|en coche|conducir|driving|carro/.test(normalized) ? 'driving' : null;
      if (routeMode) { api?.setRouteMode?.(routeMode); addConversation(text, `${t.section}${routeMode === 'walking' ? 'A pie' : routeMode === 'cycling' ? 'Bicicleta' : 'Auto'}.`); return; }
      const layer = normalized.includes('satelit') || normalized.includes('satellite') ? 'satellite' : normalized.includes('transporte') || normalized.includes('transport') ? 'transport' : normalized.includes('relieve') || normalized.includes('3d') ? 'relief' : normalized.includes('oscuro') || normalized.includes('dark') ? 'dark' : normalized.includes('claro') || normalized.includes('light') ? 'light' : null;
      if (layer) { api?.setLayer?.(layer); addConversation(text, `${t.section}${layer}.`); return; }

      const sectionRules = [
        [/mensaje|chat|message/, 'Mensajes'], [/evento|event/, 'Eventos'], [/servicio|service/, 'Servicios'], [/venta|compr|sale/, 'Ventas'], [/emergencia|sos|emergency/, 'Emergencias (SOS)'], [/reporte|report/, 'Reportes'], [/perfil|profile/, 'Mi Perfil'], [/configuracion|ajustes|settings/, 'Configuración']
      ];
      const openIntent = /abre|abrir|abreme|ir a|ve a|go to|open|show section|muestra la seccion/.test(normalized);
      const section = openIntent ? sectionRules.find(([pattern]) => pattern.test(normalized))?.[1] : null;
      if (section) { onSelectSection?.(section); addConversation(text, `${t.section}${section}.`); return; }

      if (/evento|servicio|venta|reporte|emergencia|ayuda|cerca|near|nearby|hospital|farmacia|policia|comisaria|parque|restaurante|mercado/.test(normalized)) {
        onSelectSection?.('Inicio'); api?.search?.(text); addConversation(text, t.nearby); return;
      }
      if (/mi ubicacion|donde estoy|my location|where am i/.test(normalized)) {
        const center = api?.getState?.()?.center;
        if (center) api.getMap()?.flyTo({ center: [center.lng, center.lat], zoom: 16 });
        addConversation(text, center ? `Ubicación del mapa: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}.` : t.fallback); return;
      }
      addConversation(text, t.fallback);
    } finally { setBusy(false); }
  };

  const voice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { addConversation('Voz', 'El reconocimiento de voz no está disponible en este navegador.'); return; }
    if (recording) return;
    const recognition = new Recognition(); recognition.lang = speechLocales[lang] || 'es-PE'; recognition.interimResults = false;
    recognition.onresult = event => send(event.results[0][0].transcript);
    recognition.onend = () => setRecording(false); recognition.onerror = () => setRecording(false);
    setRecording(true); recognition.start();
  };

  return <>
    <button className="gf-assistant-fab" onClick={() => setOpen(true)} title="GeoFastPe AI"><Bot size={22}/><span>Asistente</span></button>
    {open && <div className="gf-assistant-panel">
      <header><span><Bot size={20}/> GeoFastPe AI</span><button onClick={() => setOpen(false)} aria-label="Cerrar asistente"><X size={18}/></button></header>
      <div className="gf-assistant-tools"><span><Sparkles size={14}/> Asistente de navegación</span><span><Map size={14}/> Mapa</span><span><Languages size={14}/> {lang.toUpperCase()}</span></div>
      <div className="gf-assistant-thread">
        {items.map((message, index) => <div key={index} className={`gf-assistant-msg ${message.from}`}><p>{message.text}</p>{message.from === 'bot' && <button onClick={() => speak(message.text)} title="Escuchar"><Volume2 size={14}/></button>}</div>)}
        {items.length === 1 && <div className="gf-assistant-suggestions">{t.examples.map(example => <button key={example} onClick={() => send(example)}>{example}</button>)}</div>}
      </div>
      <form onSubmit={event => { event.preventDefault(); send(); }} className="gf-assistant-compose"><button type="button" onClick={voice} className={recording ? 'recording' : ''} title="Dictar"><Mic size={18}/></button><input value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder}/><button type="submit" disabled={busy || !draft.trim()} title="Enviar"><Send size={18}/></button></form>
    </div>}
  </>;
}
