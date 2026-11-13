import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Map, Mic, Volume2, Languages, Sparkles } from 'lucide-react';
import { usePreferences } from '../preferences/PreferencesContext.jsx';
import { parseInstruction } from '../engine/assistantIntents.js';
import { interpretWithLlm, llmToParsed } from '../engine/assistantLlm.js';
import { apiRequest, tokenStorage } from '../api/client.js';

const helpLabels = {
  es: { publish: 'Publicar solicitud', cancel: 'Cancelar', done: 'Solicitud publicada. Ya aparece en el mapa para tus vecinos.', cancelled: 'Solicitud cancelada.', login: 'Inicia sesión para publicar solicitudes de ayuda.', error: 'No se pudo publicar: ', review: 'Revisa el borrador y confirma para publicarlo a tus vecinos.', emergency: 'Estos son los números de referencia. En una emergencia real, llama de inmediato.', emergencyNote: 'Verifica el número de tu zona con las autoridades locales.' },
  en: { publish: 'Publish request', cancel: 'Cancel', done: 'Request published. It now appears on the map for your neighbors.', cancelled: 'Request cancelled.', login: 'Sign in to publish help requests.', error: 'Could not publish: ', review: 'Review the draft and confirm to publish it to your neighbors.', emergency: 'These are reference numbers. In a real emergency, call immediately.', emergencyNote: 'Check the number for your area with local authorities.' },
  pt: { publish: 'Publicar pedido', cancel: 'Cancelar', done: 'Pedido publicado. Ele já aparece no mapa para seus vizinhos.', cancelled: 'Pedido cancelado.', login: 'Entre para publicar pedidos de ajuda.', error: 'Não foi possível publicar: ', review: 'Revise o rascunho e confirme para publicá-lo para seus vizinhos.', emergency: 'Estes são números de referência. Em uma emergência real, ligue imediatamente.', emergencyNote: 'Confirme o número da sua região com as autoridades locais.' },
  qu: { publish: 'Willakuyta churay', cancel: 'Mana', done: 'Mapapi rikuchisqa kachkan, vecinukunam rikunki.', cancelled: 'Mana churasqachu.', login: 'Yanapakuy willakuyta churanaykipaq yaykuy.', error: 'Mana churayta atirqanichu: ', review: 'Qillqasqata qhaway, vecinukunaman churanaykipaq arí ninki.', emergency: 'Kaykunaqa yuyaymanay numerokuna. Chiqap utqaypi kallpawan waqyay.', emergencyNote: 'Chay chiqapi numeroq ñawpaq kamachikuqkunawan qhawariy.' },
  ay: { publish: 'Yanapt’awi qillqt’aña', cancel: 'Janiw', done: 'Uñt’ata, jiwasa sarnaqirinakaru mapan uñacht’atawa.', cancelled: 'Janiw katuqañkiti.', login: 'Yanapt’awi mantañataki mantam.', error: 'Janiw katuqañkiti: ', review: 'Qillqata uñjam, jiwasa sarnaqirinakaru katuqañataki yes sasa.', emergency: 'Akanakax yanapt’awi jaqukipañanakawa. Chiqa jan walt’awinakan kallpawaki jawsam.', emergencyNote: 'Chiqa jaqimpi numerunak ukat sarnaqirinakamp qhawam.' },
  fr: { publish: 'Publier la demande', cancel: 'Annuler', done: 'Demande publiée. Elle apparaît maintenant sur la carte pour vos voisins.', cancelled: 'Demande annulée.', login: 'Connectez-vous pour publier des demandes d’aide.', error: 'Publication impossible : ', review: 'Vérifiez le brouillon et confirmez pour le publier à vos voisins.', emergency: 'Ce sont des numéros de référence. En cas d’urgence réelle, appelez immédiatement.', emergencyNote: 'Vérifiez le numéro de votre zone auprès des autorités locales.' },
  de: { publish: 'Anfrage veröffentlichen', cancel: 'Abbrechen', done: 'Anfrage veröffentlicht. Sie ist jetzt für deine Nachbarn auf der Karte sichtbar.', cancelled: 'Anfrage abgebrochen.', login: 'Melde dich an, um Hilfegesuche zu veröffentlichen.', error: 'Veröffentlichung fehlgeschlagen: ', review: 'Prüfe den Entwurf und bestätige, um ihn deinen Nachbarn zu zeigen.', emergency: 'Das sind Referenznummern. Ruf bei einem echten Notfall sofort an.', emergencyNote: 'Prüfe die Nummer deiner Region bei den örtlichen Behörden.' },
  it: { publish: 'Pubblica richiesta', cancel: 'Annulla', done: 'Richiesta pubblicata. Ora è visibile sulla mappa ai tuoi vicini.', cancelled: 'Richiesta annullata.', login: 'Accedi per pubblicare richieste di aiuto.', error: 'Impossibile pubblicare: ', review: 'Controlla la bozza e conferma per pubblicarla ai tuoi vicini.', emergency: 'Sono numeri di riferimento. In un’emergenza reale, chiama subito.', emergencyNote: 'Verifica il numero della tua zona con le autorità locali.' },
  zh: { publish: '发布求助', cancel: '取消', done: '求助已发布，现在邻居可在地图上看到。', cancelled: '求助已取消。', login: '请登录后发布求助。', error: '发布失败：', review: '请检查草稿并确认，以发布给邻居。', emergency: '这些是参考号码。遇到真正的紧急情况请立即拨打。', emergencyNote: '请向当地主管部门确认你所在地区的号码。' },
  ja: { publish: '依頼を投稿', cancel: 'キャンセル', done: '依頼を投稿しました。近所の人の地図に表示されます。', cancelled: '依頼をキャンセルしました。', login: 'ログインして支援依頼を投稿してください。', error: '投稿できませんでした：', review: '下書きを確認し、近所の人へ投稿するには確定してください。', emergency: 'これは参考番号です。実際の緊急時はすぐに電話してください。', emergencyNote: 'お住まいの地域の番号は地元の当局でご確認ください。' },
  ar: { publish: 'نشر الطلب', cancel: 'إلغاء', done: 'تم نشر الطلب. يظهر الآن على الخريطة لجيرانك.', cancelled: 'تم إلغاء الطلب.', login: 'سجّل الدخول لنشر طلبات المساعدة.', error: 'تعذّر النشر: ', review: 'راجع المسودة وأكّد لنشرها لجيرانك.', emergency: 'هذه أرقام مرجعية. في حالة الطوارئ الفعلية اتصل فوراً.', emergencyNote: 'تحقق من الرقم في منطقتك لدى السلطات المحلية.' }
};

const content = {
  es: { welcome: 'Hola. Soy GeoFastPe AI. Puedo buscar publicaciones cercanas, encontrar lugares y marcar rutas directamente en el mapa.', examples: ['Márcame la ruta a la Plaza de Armas', 'Busca eventos cerca de mí', 'Llévame al hospital más cercano', 'Activa el mapa satelital'], placeholder: 'Escribe una instrucción...', route: 'Estoy calculando la ruta solicitada.', routeError: 'No pude calcular esa ruta: ', routeAsk: '¿A dónde quieres ir? Dime un lugar o una publicación.', nearby: 'Estoy buscando primero publicaciones cercanas y después lugares del mapa.', section: 'Abriendo ', radius: 'Radio actualizado a ', notificationsOn: 'Las notificaciones de novedades cercanas están activadas.', notificationsOff: 'Las notificaciones están desactivadas.', languageChanged: 'Listo. Ahora la interfaz y mis respuestas están en español.', voiceUnsupported: 'El reconocimiento de voz no está disponible en este navegador.', fallback: 'Puedo buscar publicaciones y lugares, marcar rutas, cambiar capas, ajustar el radio y abrir secciones.' },
  en: { welcome: 'Hello. I am GeoFastPe AI. I can find nearby posts and places and draw routes directly on the map.', examples: ['Show me the route to the main square', 'Find events near me', 'Take me to the nearest hospital', 'Turn on satellite map'], placeholder: 'Type an instruction...', route: 'Calculating your route.', routeError: 'I could not calculate that route: ', routeAsk: 'Where do you want to go? Tell me a place or a listing.', nearby: 'Searching nearby community posts first, then map locations.', section: 'Opening ', radius: 'Search radius set to ', notificationsOn: 'Nearby notifications are enabled.', notificationsOff: 'Notifications are disabled.', languageChanged: 'Done. The interface and my answers are now in English.', voiceUnsupported: 'Voice recognition is not available in this browser.', fallback: 'I can search posts and places, draw routes, change map layers, adjust radius and open sections.' },
  pt: { welcome: 'Olá. Sou o GeoFastPe AI. Posso encontrar publicações e lugares próximos e traçar rotas diretamente no mapa.', examples: ['Trace a rota até a praça principal', 'Encontre eventos próximos', 'Leve-me ao hospital mais próximo', 'Ative o mapa de satélite'], placeholder: 'Digite uma instrução...', route: 'Calculando sua rota.', routeError: 'Não consegui calcular a rota: ', routeAsk: 'Para onde você quer ir? Diga um lugar ou uma publicação.', nearby: 'Buscando primeiro publicações próximas e depois lugares no mapa.', section: 'Abrindo ', radius: 'Raio de busca atualizado para ', notificationsOn: 'Notificações próximas ativadas.', notificationsOff: 'Notificações desativadas.', languageChanged: 'Pronto. A interface e minhas respostas agora estão em português.', voiceUnsupported: 'O reconhecimento de voz não está disponível neste navegador.', fallback: 'Posso buscar publicações e lugares, traçar rotas, mudar camadas, ajustar o raio e abrir seções.' },
  qu: { welcome: 'Allinllachu. GeoFastPe yanapakuq kani. Kaypiqa qayllapi willakuykunata maskayta, ñankunata rikuchiyta atini.', examples: ['Plaza de Armasman ñanta rikuchiy', 'Qayllapi ruraykunata maskay', 'Qaylla hampinaman pusaway'], placeholder: 'Imata ruwanaypaq qillqay...', route: 'Ñanta yupachkani.', routeError: 'Ñanta mana tariyta atirqanichu: ', routeAsk: 'Mayman rinayta munanki? Huk kitita utaq willakuyta niway.', nearby: 'Ñawpaqta qayllapi willakuykunata, chaymanta mapapi kitikunata maskachkani.', section: 'Kichachkani: ', radius: 'Maskana suyunchasqa: ', notificationsOn: 'Qaylla musuq willakuykuna kachkan.', notificationsOff: 'Willakuy willaykuna wañuchisqa.', languageChanged: 'Allin. Kunanqa interfazpas kutichiykunapas quechua simipi kachkan.', voiceUnsupported: 'Kay navegadorpi voz reconocimiento mana kanchu.', fallback: 'Willakuykunata maskayta, ñankunata rikuchiyta, mapata tikrayta atini.' },
  ay: { welcome: 'Kamisaraki. Nayax GeoFastPe yanapiriwa. Jak’an yatiyawinaka thaqhiristwa ukat thakhinak mapa taypin uñacht’ayiristwa.', examples: ['Plaza de Armas ukar thakhi uñacht’ayita', 'Jak’an wakichäwinaka thaqham', 'Jak’a qullañ utar irpita'], placeholder: 'Kunsa lurañ munta uk qillqt’am...', route: 'Thakhi jakasktwa.', routeError: 'Uka thakhi janiw jikxatkti: ', routeAsk: 'Kawkharu sarañ muntaxa? Mä chiqa jan ukax mä yatiyawi säwim.', nearby: 'Nayraqata jak’an yatiyawinaka, ukatxa mapa chiqanak thaqtaskta.', section: 'Uñacht’ayaskta: ', radius: 'Thaqha radio wakicht’ata: ', notificationsOn: 'Jak’an machaq yatiyawinakax jist’aratawa.', notificationsOff: 'Yatiyäwinakax jist’antatawa.', languageChanged: 'Waliki. Jichhax interfaz ukhamaraki kutichiyinakax aymar arunwa.', voiceUnsupported: 'Aka navegadoronx voz uñt’añax jan utjkiti.', fallback: 'Yatiyawinaka thaqhiristwa, thakhinak uñacht’ayiristwa, mapa capas mayjt’ayiristwa.' },
  fr: { welcome: 'Bonjour. Je suis GeoFastPe AI. Je peux rechercher les publications proches, trouver des lieux et tracer des itinéraires.', examples: ['Itinéraire vers la place principale', 'Événements à proximité', 'Hôpital le plus proche'], placeholder: 'Écrivez une instruction...', route: 'Calcul de votre itinéraire.', routeError: 'Itinéraire impossible : ', routeAsk: 'Où veux-tu aller ? Indique un lieu ou une publication.', nearby: 'Recherche des publications proches, puis des lieux.', section: 'Ouverture de ', radius: 'Rayon défini sur ', notificationsOn: 'Notifications de proximité activées.', notificationsOff: 'Notifications désactivées.', languageChanged: 'C’est fait. L’interface et mes réponses sont maintenant en français.', voiceUnsupported: 'La reconnaissance vocale n’est pas disponible dans ce navigateur.', fallback: 'Je peux rechercher, tracer des itinéraires, changer les couches et ouvrir les sections.' },
  de: { welcome: 'Hallo. Ich bin GeoFastPe AI. Ich finde nahe Beiträge und Orte und plane Routen auf der Karte.', examples: ['Route zum Hauptplatz', 'Veranstaltungen in der Nähe', 'Nächstes Krankenhaus'], placeholder: 'Anweisung eingeben...', route: 'Route wird berechnet.', routeError: 'Route nicht gefunden: ', routeAsk: 'Wohin möchtest du? Nenne einen Ort oder einen Beitrag.', nearby: 'Suche zuerst nahe Beiträge und danach Orte.', section: 'Öffne ', radius: 'Suchradius eingestellt auf ', notificationsOn: 'Benachrichtigungen aktiviert.', notificationsOff: 'Benachrichtigungen deaktiviert.', languageChanged: 'Fertig. Die Oberfläche und meine Antworten sind jetzt auf Deutsch.', voiceUnsupported: 'Spracherkennung ist in diesem Browser nicht verfügbar.', fallback: 'Ich kann Beiträge und Orte suchen, Routen planen, Kartenebenen ändern und Bereiche öffnen.' },
  it: { welcome: 'Ciao. Sono GeoFastPe AI. Posso cercare pubblicazioni vicine, trovare luoghi e tracciare percorsi.', examples: ['Percorso per la piazza principale', 'Eventi vicino a me', 'Ospedale più vicino'], placeholder: 'Scrivi un comando...', route: 'Sto calcolando il percorso.', routeError: 'Non riesco a calcolare il percorso: ', routeAsk: 'Dove vuoi andare? Dimmi un luogo o una pubblicazione.', nearby: 'Cerco prima le pubblicazioni vicine e poi i luoghi.', section: 'Apro ', radius: 'Raggio di ricerca impostato a ', notificationsOn: 'Notifiche vicine attivate.', notificationsOff: 'Notifiche disattivate.', languageChanged: 'Fatto. L’interfaccia e le mie risposte ora sono in italiano.', voiceUnsupported: 'Il riconoscimento vocale non è disponibile in questo browser.', fallback: 'Posso cercare, tracciare percorsi, cambiare livelli della mappa e aprire sezioni.' },
  zh: { welcome: '你好，我是 GeoFastPe AI。我可以搜索附近的社区信息、地点并规划路线。', examples: ['导航到主广场', '搜索附近活动', '最近的医院'], placeholder: '输入指令...', route: '正在规划路线。', routeError: '无法规划路线：', routeAsk: '你想去哪里？告诉我一个地点或一条发布。', nearby: '先搜索附近社区信息，再搜索地图地点。', section: '正在打开', radius: '搜索半径已设置为', notificationsOn: '附近通知已开启。', notificationsOff: '通知已关闭。', languageChanged: '好了。界面和我的回答现在是中文。', voiceUnsupported: '此浏览器不支持语音识别。', fallback: '我可以搜索信息和地点、规划路线、更改地图图层和打开功能。' },
  ja: { welcome: 'こんにちは。GeoFastPe AIです。近くの投稿や場所を検索し、地図上でルートを表示できます。', examples: ['中央広場へのルート', '近くのイベント', '最寄りの病院'], placeholder: '指示を入力...', route: 'ルートを計算しています。', routeError: 'ルートを計算できませんでした：', routeAsk: 'どこへ行きたいですか？場所や投稿を教えてください。', nearby: '近くの投稿を先に、その後に地図上の場所を検索します。', section: '開いています：', radius: '検索範囲：', notificationsOn: '近くの通知を有効にしました。', notificationsOff: '通知を無効にしました。', languageChanged: '完了しました。インターフェースと回答は日本語になりました。', voiceUnsupported: 'このブラウザでは音声認識を利用できません。', fallback: '投稿や場所の検索、ルート表示、地図レイヤーの変更ができます。' },
  ar: { welcome: 'مرحباً، أنا GeoFastPe AI. يمكنني البحث عن المنشورات والأماكن القريبة ورسم المسارات.', examples: ['المسار إلى الساحة الرئيسية', 'فعاليات قريبة', 'أقرب مستشفى'], placeholder: 'اكتب أمراً...', route: 'جارٍ حساب المسار.', routeError: 'تعذر حساب المسار: ', routeAsk: 'إلى أين تريد الذهاب؟ أخبرني بمكان أو منشور.', nearby: 'أبحث أولاً عن المنشورات القريبة ثم الأماكن على الخريطة.', section: 'جارٍ فتح ', radius: 'تم ضبط نطاق البحث إلى ', notificationsOn: 'تم تفعيل إشعارات الأماكن القريبة.', notificationsOff: 'تم إيقاف الإشعارات.', languageChanged: 'تم. الواجهة وإجاباتي الآن بالعربية.', voiceUnsupported: 'التعرف على الصوت غير متاح في هذا المتصفح.', fallback: 'يمكنني البحث ورسم المسارات وتغيير طبقات الخريطة وفتح الأقسام.' }
};

const searchTexts = {
  es: { found: (n, km) => `Encontré ${n} resultados dentro de ${km} km de tu radio de búsqueda. Están marcados en el mapa:`, none: km => `No encontré resultados dentro de ${km} km. Puedo ampliar el radio si quieres.`, show: 'Ver', route: 'Ruta' },
  en: { found: (n, km) => `I found ${n} results within ${km} km of your search radius. They are marked on the map:`, none: km => `I found no results within ${km} km. I can widen the radius if you want.`, show: 'View', route: 'Route' },
  pt: { found: (n, km) => `Encontrei ${n} resultados dentro de ${km} km do seu raio de busca. Estão marcados no mapa:`, none: km => `Não encontrei resultados dentro de ${km} km. Posso ampliar o raio se quiser.`, show: 'Ver', route: 'Rota' },
  qu: { found: (n, km) => `${km} km muyuntinpi ${n} kitita tarirqani. Mapapi markasqa kachkan:`, none: km => `${km} km muyuntinpi manan kitikunata tarirqanichu. Radiota hatarichiwayta atiniy.`, show: 'Qhaway', route: 'Ñan' },
  ay: { found: (n, km) => `${km} km thaqhata ${n} jikxatawi. Mapan uñacht'atawa:`, none: km => `${km} km thaqhan janiw jikxatkiti. Radio jach'arjam apt'ayañ puedu.`, show: 'Uñjaña', route: 'Thakhi' },
  fr: { found: (n, km) => `J’ai trouvé ${n} résultats dans un rayon de ${km} km. Ils sont indiqués sur la carte :`, none: km => `Aucun résultat dans un rayon de ${km} km. Je peux élargir le rayon si vous voulez.`, show: 'Voir', route: 'Itinéraire' },
  de: { found: (n, km) => `Ich habe ${n} Ergebnisse im Umkreis von ${km} km gefunden. Sie sind auf der Karte markiert:`, none: km => `Keine Ergebnisse im Umkreis von ${km} km. Ich kann den Radius vergrößern.`, show: 'Ansehen', route: 'Route' },
  it: { found: (n, km) => `Ho trovato ${n} risultati entro ${km} km. Sono segnati sulla mappa:`, none: km => `Nessun risultato entro ${km} km. Posso ampliare il raggio.`, show: 'Vedi', route: 'Percorso' },
  zh: { found: (n, km) => `在 ${km} 公里搜索范围内找到 ${n} 个结果，已在地图上标出：`, none: km => `${km} 公里范围内没有结果。需要的话我可以扩大范围。`, show: '查看', route: '路线' },
  ja: { found: (n, km) => `検索範囲 ${km} km 内に ${n} 件見つかりました。地図にマークしました：`, none: km => `${km} km 以内には見つかりませんでした。範囲を広げることもできます。`, show: '表示', route: 'ルート' },
  ar: { found: (n, km) => `وجدت ${n} نتيجة ضمن ${km} كم من نطاق البحث. وهي معلّمة على الخريطة:`, none: km => `لم أجد نتائج ضمن ${km} كم. يمكنني توسيع النطاق إذا أردت.`, show: 'عرض', route: 'مسار' }
};

const listeningLabel = { es: 'Escuchando...', en: 'Listening...', pt: 'Ouvindo...', qu: 'Uyarisqayki...', ay: 'Ist’aski...', fr: 'Écoute...', de: 'Höre zu...', it: 'Ascolto...', zh: '正在聆听...', ja: '聞き取り中...', ar: 'جارٍ الاستماع...' };

const speechLocales = { es: 'es-PE', en: 'en-US', pt: 'pt-BR', qu: 'qu-PE', ay: 'ay-BO', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-SA' };

export default function GeoFastAssistant({ onSelectSection }) {
  const { language = 'es', setLanguage, supportedLanguages = [], tr } = usePreferences();
  const lang = content[language] ? language : 'es';
  const t = content[lang];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState(() => [{ from: 'bot', text: t.welcome }]);
  const threadRef = useRef(null);
  const voiceReplyRef = useRef(null);
  const llmReplyRef = useRef(null);

  useEffect(() => {
    const node = threadRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [items, busy, recording, open]);

  const speak = (text, code = lang) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocales[code] || 'es-PE';
    window.speechSynthesis.speak(utterance);
  };

  const addBot = (text) => {
    setItems(current => [...current, { from: 'bot', text }]);
    if (voiceReplyRef.current) speak(text, voiceReplyRef.current);
  };

  const addConversation = (text, response) => {
    const shown = llmReplyRef.current || response;
    setItems(current => [...current, { from: 'user', text }, { from: 'bot', text: shown }]);
    if (voiceReplyRef.current) speak(shown, voiceReplyRef.current);
  };

  const changeLanguage = (code) => {
    if (!content[code]) return;
    setLanguage?.(code);
    setItems(current => [...current, { from: 'bot', text: content[code].languageChanged }]);
  };

  const updateItem = (index, patch) => setItems(current => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const publishHelp = async (index, message) => {
    const hl = helpLabels[message.lang || lang] || helpLabels.es;
    if (!tokenStorage.get()) { setItems(current => [...current, { from: 'bot', text: hl.login }]); return; }
    const state = window.GeoFastPe?.getState?.();
    const point = state?.userLocation || state?.center;
    if (!point) { setItems(current => [...current, { from: 'bot', text: hl.error + '…' }]); return; }
    updateItem(index, { draftStatus: 'publishing' });
    try {
      const d = message.draft;
      await apiRequest('/solidaridad', {
        method: 'POST',
        body: { tipo: 'SOLICITUD', title: d.title, category: d.category, description: d.description, urgency: d.urgency, location: d.location, lat: point.lat, lng: point.lng }
      });
      updateItem(index, { draftStatus: 'published' });
      window.GeoFastPe?.setCategory?.('Solidaridad');
      setItems(current => [...current, { from: 'bot', text: hl.done }]);
    } catch (error) {
      updateItem(index, { draftStatus: 'pending' });
      setItems(current => [...current, { from: 'bot', text: hl.error + (error.message || '') }]);
    }
  };

  const runSearch = async (api, parsed) => {
    onSelectSection?.('Inicio');
    if (parsed.engine) api?.setCategory?.(parsed.engine);
    const terms = Array.isArray(parsed.terms) ? parsed.terms.filter(Boolean) : [];
    return api?.findNearby?.({
      terms,
      placesQuery: parsed.placesQuery || terms[0] || parsed.query,
      query: parsed.query
    });
  };

  const send = async (value = draft, options = {}) => {
    const text = String(value || '').trim();
    if (!text || busy) return;
    setDraft(''); setBusy(true);

    const api = window.GeoFastPe;
    const history = items.slice(-6).map(item => ({ role: item.from === 'user' ? 'user' : 'assistant', content: item.text }));
    const llmResult = await interpretWithLlm(text, lang, history);
    const llm = llmResult ? llmToParsed(llmResult, text) : null;
    llmReplyRef.current = llm?.reply || null;
    const parsed = llm || parseInstruction(text);
    const autoLanguage = parsed.intent !== 'language' && parsed.language && parsed.language !== lang ? parsed.language : null;
    const nextLanguage = parsed.intent === 'language' ? parsed.language : autoLanguage;
    const activeLang = content[nextLanguage] ? nextLanguage : lang;
    const tt = content[activeLang];
    voiceReplyRef.current = options.voice ? activeLang : null;

    try {
      if (nextLanguage) setLanguage?.(nextLanguage);

      if (parsed.intent === 'language') {
        addConversation(text, tt.languageChanged);
        return;
      }

      if (parsed.intent === 'help_request') {
        const hl = helpLabels[activeLang] || helpLabels.es;
        const d = parsed.draft;
        const shown = d.title && d.description ? (llm?.reply || hl.review) : (llm?.reply || tt.fallback);
        const draft = d.title && d.description ? d : null;
        setItems(current => [...current, { from: 'user', text }, { from: 'bot', text: shown, draft, draftStatus: 'pending', lang: activeLang }]);
        if (voiceReplyRef.current) speak(shown, activeLang);
        return;
      }

      if (parsed.intent === 'emergency_info') {
        const hl = helpLabels[activeLang] || helpLabels.es;
        const shown = llm?.reply || hl.emergency;
        setItems(current => [...current, { from: 'user', text }, { from: 'bot', text: shown, contacts: parsed.contacts, lang: activeLang }]);
        if (voiceReplyRef.current) speak(shown, activeLang);
        return;
      }

      if (parsed.intent === 'route') {
        if (!parsed.destination) { addConversation(text, tt.routeAsk); return; }
        addConversation(text, tt.route);
        if (parsed.mode) api?.setRouteMode?.(parsed.mode);
        try {
          let result = null;
          if (api?.routeToPublication) {
            try { result = await api.routeToPublication(parsed.destination); } catch { result = null; }
          }
          if (!result) result = await api.routeTo(parsed.destination);
          const km = (Number(result.distanceMeters || 0) / 1000).toFixed(1);
          const min = Math.round(Number(result.durationSeconds || 0) / 60);
          addBot(`${parsed.destination} · ${km} km · ${min} min`);
        } catch (error) {
          addBot(tt.routeError + (error.message || ''));
        }
        return;
      }

      if (parsed.intent === 'search') {
        const result = await runSearch(api, parsed);
        const labels = searchTexts[activeLang] || searchTexts.es;
        const km = ((result?.radius || 0) / 1000).toFixed(1);
        const items = result?.items || [];
        const summary = items.length ? labels.found(items.length, km) : labels.none(km);
        const shown = llm?.reply ? `${llm.reply}\n${summary}` : summary;
        setItems(current => [...current, { from: 'user', text }, { from: 'bot', text: shown, list: items, lang: activeLang }]);
        if (voiceReplyRef.current) speak(summary, activeLang);
        return;
      }

      if (parsed.intent === 'section') {
        onSelectSection?.(parsed.section);
        addConversation(text, `${tt.section}${parsed.section}.`);
        return;
      }

      if (parsed.intent === 'route-mode') {
        api?.setRouteMode?.(parsed.mode);
        addConversation(text, `${tt.section}${parsed.mode === 'walking' ? 'A pie' : parsed.mode === 'cycling' ? 'Bicicleta' : 'Auto'}.`);
        return;
      }

      if (parsed.intent === 'layer') {
        api?.setLayer?.(parsed.layer);
        addConversation(text, `${tt.section}${parsed.layer}.`);
        return;
      }

      if (parsed.intent === 'radius') {
        const state = api?.getState?.() || { radius: 1000 };
        const radius = api?.setRadius?.(Math.max(250, Math.min(50000, state.radius * parsed.factor))) || state.radius * parsed.factor;
        addConversation(text, `${tt.radius}${(radius / 1000).toFixed(1)} km.`);
        return;
      }

      if (parsed.intent === 'notifications') {
        const enabled = parsed.enabled;
        if (enabled && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
        const allowed = enabled && ('Notification' in window) && Notification.permission === 'granted';
        localStorage.setItem('gf-nearby-alerts', String(allowed));
        addConversation(text, allowed ? tt.notificationsOn : tt.notificationsOff);
        return;
      }

      if (parsed.intent === 'location') {
        try {
          if (api?.locateMe) await api.locateMe();
          const loc = api?.getState?.()?.userLocation;
          addConversation(text, loc
            ? `${activeLang === 'es' ? 'Tu ubicación' : 'Location'}: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}${loc.accuracy ? ` (±${Math.round(loc.accuracy)} m)` : ''}.`
            : tt.fallback);
        } catch {
          addConversation(text, tt.fallback);
        }
        return;
      }

      if (parsed.intent === 'help') {
        addConversation(text, `${tt.fallback} ${tt.examples.slice(0, 3).join(' · ')}`);
        return;
      }

      addConversation(text, tt.fallback);
    } finally {
      voiceReplyRef.current = null;
      llmReplyRef.current = null;
      setBusy(false);
    }
  };

  const voice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { addConversation(tr('Voz'), t.voiceUnsupported); return; }
    if (recording) return;
    const recognition = new Recognition(); recognition.lang = speechLocales[lang] || 'es-PE'; recognition.interimResults = false;
    recognition.onresult = event => send(event.results[0][0].transcript, { voice: true });
    recognition.onend = () => setRecording(false); recognition.onerror = () => { setRecording(false); addConversation(tr('Voz'), t.voiceUnsupported); };
    setRecording(true); recognition.start();
  };

  const languages = (supportedLanguages.length ? supportedLanguages : [['es', 'Español']]).filter(([code]) => content[code]);

  return <>
    <button className="gf-assistant-fab" onClick={() => setOpen(true)} title="GeoFastPe AI"><Bot size={22}/><span>{tr('Asistente')}</span></button>
    {open && <div className="gf-assistant-panel">
      <header><span><Bot size={20}/> GeoFastPe AI</span><button onClick={() => setOpen(false)} aria-label={tr('Cerrar asistente')}><X size={18}/></button></header>
      <div className="gf-assistant-tools">
        <span><Sparkles size={14}/> {tr('Asistente de navegación')}</span>
        <span><Map size={14}/> {tr('Mapa')}</span>
        <label className="gf-assistant-lang" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Languages size={14}/>
          <select value={lang} onChange={event => changeLanguage(event.target.value)} aria-label={tr('Idioma del asistente')} style={{ background: 'transparent', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>
            {languages.map(([code, label]) => <option key={code} value={code} style={{ color: '#111' }}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="gf-assistant-thread" ref={threadRef}>
        {items.map((message, index) => {
          const labels = searchTexts[message.lang || lang] || searchTexts.es;
          const hl = helpLabels[message.lang || lang] || helpLabels.es;
          return <div key={index} className={`gf-assistant-msg ${message.from}${message.list || message.draft || message.contacts ? ' wide' : ''}`}>
            <p>{message.text}</p>
            {message.from === 'bot' && <button onClick={() => speak(message.text, message.lang || lang)} title={tr('Escuchar')}><Volume2 size={14}/></button>}
            {message.list?.length > 0 && <ul className="gf-assistant-list">
              {message.list.map((item, i) => <li key={i}>
                <div><strong>{item.name}</strong><small>{item.address}</small><small>{(item.distance / 1000).toFixed(2)} km · {item.kind}</small></div>
                <div>
                  <button onClick={() => window.GeoFastPe?.focusAssistantPoint?.(item.lat, item.lng)}>{labels.show}</button>
                  <button onClick={() => window.GeoFastPe?.routeToCoordinates?.(item.lat, item.lng, item.name)}>{labels.route}</button>
                </div>
              </li>)}
            </ul>}
            {message.contacts?.length > 0 && <>
              <ul className="gf-assistant-list">
                {message.contacts.map(contact => <li key={contact.service}>
                  <div><strong>{contact.name}</strong><small>{contact.note}</small></div>
                  <div>{contact.number ? <a className="gf-assistant-call" href={`tel:${contact.number}`}>{contact.number}</a> : <small>—</small>}</div>
                </li>)}
              </ul>
              <small className="gf-assistant-note">{hl.emergencyNote}</small>
            </>}
            {message.draft && <div className="gf-assistant-draft">
              <strong>{message.draft.title}</strong>
              <small>{message.draft.category} · {message.draft.urgency}{message.draft.location ? ` · ${message.draft.location}` : ''}</small>
              <p>{message.draft.description}</p>
              {message.draftStatus === 'pending' && <div className="gf-assistant-draft-actions">
                <button onClick={() => publishHelp(index, message)}>{hl.publish}</button>
                <button onClick={() => updateItem(index, { draftStatus: 'cancelled' })}>{hl.cancel}</button>
              </div>}
              {message.draftStatus === 'publishing' && <small>…</small>}
              {message.draftStatus === 'published' && <small>✓ {hl.done}</small>}
              {message.draftStatus === 'cancelled' && <small>{hl.cancelled}</small>}
            </div>}
          </div>;
        })}
        {busy && <div className="gf-assistant-msg bot"><p className="gf-assistant-typing"><span/><span/><span/></p></div>}
        {recording && <div className="gf-assistant-listening">● {listeningLabel[lang]}</div>}
        {items.length === 1 && <div className="gf-assistant-suggestions">{t.examples.map(example => <button key={example} onClick={() => send(example)}>{example}</button>)}</div>}
      </div>
      <form onSubmit={event => { event.preventDefault(); send(); }} className="gf-assistant-compose"><button type="button" onClick={voice} className={recording ? 'recording' : ''} title={tr('Dictar')}><Mic size={18}/></button><input value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder}/><button type="submit" disabled={busy || !draft.trim()} title={tr('Enviar')}><Send size={18}/></button></form>
    </div>}
  </>;
}
