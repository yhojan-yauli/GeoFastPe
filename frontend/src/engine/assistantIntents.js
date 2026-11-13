// Motor de intenciones del asistente GeoFastPe.
// Determinista: normaliza el texto y aplica lexicos. No usa servicios externos ni LLM.
//
// La idea es que una persona que escribe en quechua, aimara, ingles, portugues,
// frances, aleman, italiano, chino, japones o arabe pueda pedir lo mismo que en
// espanol: buscar un servicio, ubicar un lugar en el mapa o trazar una ruta.

export const SUPPORTED_LANGUAGES = ['es', 'en', 'qu', 'ay', 'pt', 'fr', 'de', 'it', 'zh', 'ja', 'ar'];

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// 1. Deteccion de idioma
// ---------------------------------------------------------------------------

const LANGUAGE_MARKERS = {
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'que', 'por', 'para', 'con', 'mi', 'mis', 'es', 'esta', 'estoy', 'quiero', 'necesito', 'busca', 'buscar', 'busco', 'encuentra', 'cerca', 'donde', 'como', 'lleva', 'llevame', 'ruta', 'servicio', 'servicios', 'venta', 'ventas', 'evento', 'eventos', 'ayuda', 'gracias', 'hola', 'favor', 'mapa', 'publicacion'],
  en: ['the', 'an', 'i', 'im', 'my', 'me', 'need', 'want', 'find', 'search', 'looking', 'near', 'nearby', 'where', 'how', 'can', 'you', 'please', 'show', 'take', 'route', 'directions', 'to', 'open', 'help', 'service', 'services', 'sale', 'sales', 'event', 'events', 'thanks', 'hello'],
  pt: ['eu', 'quero', 'preciso', 'perto', 'onde', 'como', 'buscar', 'encontrar', 'rota', 'caminho', 'favor', 'obrigado', 'ola', 'servico', 'servicos', 'venda', 'vendas', 'evento', 'eventos', 'ajuda', 'levar', 'para', 'com', 'meu', 'minha', 'esta', 'sou'],
  fr: ['je', 'veux', 'besoin', 'pres', 'ou', 'comment', 'cherche', 'trouver', 'itineraire', 'route', 'merci', 'bonjour', 'hopital', 'plombier', 'aidez', 'vers', 'pour', 'avec', 'mon', 'ma', 'mes', 'suis', 'puis', 'aller', 'emmene', 'amene', 'moi'],
  de: ['ich', 'mochte', 'brauche', 'nahe', 'wo', 'wie', 'finde', 'suche', 'route', 'weg', 'bitte', 'danke', 'hallo', 'krankenhaus', 'klempner', 'zum', 'zur', 'nach', 'mit', 'fur', 'mein', 'meine', 'bin', 'mich', 'bring', 'der', 'die', 'das', 'ein', 'eine', 'in'],
  it: ['voglio', 'bisogno', 'vicino', 'dove', 'come', 'cerca', 'trova', 'percorso', 'strada', 'favore', 'grazie', 'ciao', 'ospedale', 'idraulico', 'verso', 'per', 'con', 'sono', 'mio', 'mia', 'portami', 'andare'],
  qu: ['nanta', 'nan', 'rikuchiy', 'maskay', 'qaylla', 'hampina', 'pusaway', 'pusay', 'yanapay', 'rimay', 'wasi', 'alli', 'ima', 'maypi', 'kay', 'chay', 'mikhuna', 'rantiy', 'willakuy', 'yachay', 'llamkay', 'qullqi', 'chayay', 'imayna', 'runa', 'simi', 'allinllachu', 'qichwa'],
  ay: ['thakhi', 'thakhita', 'thaqha', 'thaqham', 'jaka', "jak'a", 'qullan', 'qullana', 'irpita', 'irpim', 'ukan', 'manta', 'yanapt', 'aruskip', 'qillqt', 'suma', 'kamisaraki', 'aljana', 'yatiyawi', 'marka', 'jaqi', 'tama', 'kunjamsa', 'kunjam', 'puri', 'mantam']
};

export function detectLanguage(raw) {
  const text = String(raw || '');
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';

  const normalized = ' ' + normalizeText(text) + ' ';
  const tokens = new Set(normalized.split(/[^a-z']+/).filter(Boolean));
  const scores = {};
  SUPPORTED_LANGUAGES.forEach((code) => { scores[code] = 0; });

  Object.entries(LANGUAGE_MARKERS).forEach(([code, words]) => {
    words.forEach((word) => {
      const weight = code === 'qu' || code === 'ay' ? 2 : 1;
      if (tokens.has(word)) scores[code] += weight;
      else if ((code === 'qu' || code === 'ay') && word.length >= 4 && normalized.includes(word)) scores[code] += weight;
    });
  });

  // Una palabra de servicio en otro idioma pesa mas que una palabra suelta.
  SERVICE_LEXICON.forEach((entry) => {
    Object.entries(entry.words || {}).forEach(([code, words]) => {
      words.forEach((word) => {
        const needle = normalizeText(word);
        if (needle && normalized.includes(needle)) scores[code] = (scores[code] || 0) + 2;
      });
    });
  });

  let best = null;
  let second = 0;
  SUPPORTED_LANGUAGES.forEach((code) => {
    const value = scores[code] || 0;
    if (!best || value > (scores[best] || 0)) { second = best ? scores[best] : 0; best = code; }
    else if (value > second) second = value;
  });

  if (!best || (scores[best] || 0) < 3) return null;
  if ((scores[best] || 0) - second < 2) return null;
  return best;
}

// ---------------------------------------------------------------------------
// 2. Nombres de idioma (para "habla en ingles", "说中文", "rimay quechua")
// ---------------------------------------------------------------------------

const LANGUAGE_ALIASES = {
  es: ['espanol', 'castellano', 'spanish', 'espagnol', 'espanhol', 'spanisch', 'spagnolo', '西班牙语', 'スペイン語', 'الإسبانية'],
  en: ['ingles', 'english', 'anglais', 'englisch', 'inglese', '英语', '英語', 'الإنجليزية'],
  qu: ['quechua', 'quichua', 'qichwa', 'kichwa', 'runa simi', 'kechua', '克丘亚语', 'ケチュア語', 'الكيتشوا'],
  ay: ['aimara', 'aymara', 'aimar', 'aymara aru', '艾马拉语', 'アイマラ語', 'الأيمارا'],
  pt: ['portugues', 'portuguese', 'portugais', 'portugiesisch', 'portoghese', '葡萄牙语', 'ポルトガル語', 'البرتغالية'],
  fr: ['frances', 'french', 'francais', 'franzoesisch', 'francese', '法语', 'フランス語', 'الفرنسية'],
  de: ['aleman', 'german', 'allemand', 'deutsch', 'tedesco', '德语', 'ドイツ語', 'الألمانية'],
  it: ['italiano', 'italian', 'italien', 'italienisch', '意大利语', 'イタリア語', 'الإيطالية'],
  zh: ['chino', 'chinese', 'mandarin', 'chinois', 'chinesisch', 'cinese', '中文', '汉语', '中國話', 'الصينية'],
  ja: ['japones', 'japanese', 'japonais', 'japanisch', 'giapponese', '日语', '日本語', 'اليابانية'],
  ar: ['arabe', 'arabic', 'arabisch', 'arabo', '阿拉伯语', 'アラビア語', 'العربية']
};

const LANGUAGE_REQUEST_MARKERS = ['habla', 'hablar', 'hablame', 'idioma', 'lengua', 'language', 'langue', 'sprache', 'lingua', 'linguagem', 'switch to', 'change language', 'cambiar idioma', 'cambia el idioma', 'pon la app', 'poner la app', 'set language', 'use language', 'rimay', 'simi', 'aru', '语言', '言語', 'اللغة', 'لغة', '说', '說', '話して', 'تحدث', 'interfaz', 'interface', 'plataforma', 'platform', 'aplicacion', 'app', '界面', '改成', '改为', '切换', '应用', '应用程序', '请把', '设置', '变更', 'アプリ', 'にしてください', 'ください', '変更', '切り替え', 'にして', 'التطبيق', 'الواجهة', 'اجعل', 'غير', 'تغيير', 'باللغة'];

const LANGUAGE_LEARN_WORDS = ['clase', 'clases', 'curso', 'cursos', 'aprender', 'profesor', 'profesora', 'lecciones', 'learn', 'course', 'class', 'classes', 'teacher', 'cours', 'apprendre', 'kurs', 'lernen', 'corso', 'imparare', 'aula', 'curso', '学习', '課程', 'レッスン', 'دورة'];

function findLanguageRequest(normalized) {
  let found = null;
  Object.entries(LANGUAGE_ALIASES).forEach(([code, names]) => {
    names.forEach((name) => {
      const needle = normalizeText(name);
      if (needle && normalized.includes(needle)) found = code;
    });
  });
  if (!found) return null;

  const hasLearnWord = LANGUAGE_LEARN_WORDS.some((word) => normalized.includes(normalizeText(word)));
  if (hasLearnWord) return null;

  const hasMarker = LANGUAGE_REQUEST_MARKERS.some((marker) => normalized.includes(normalizeText(marker)));
  let withoutNames = normalized;
  (LANGUAGE_ALIASES[found] || []).forEach((name) => { withoutNames = withoutNames.split(normalizeText(name)).join(' '); });
  const onlyName = withoutNames.replace(/[^a-z\u4e00-\u9fff\u3040-\u30ff\u0600-\u06ff]/g, '').length === 0;

  return hasMarker || onlyName ? found : null;
}

// ---------------------------------------------------------------------------
// 3. Lexico de servicios y lugares (espanol interno + palabras extranjeras)
// ---------------------------------------------------------------------------

const SERVICE_LEXICON = [
  { section: 'Servicios', es: ['gasfitero', 'plomero', 'plomeria', 'sanitario', 'fuga', 'tuberia'], words: {
    en: ['plumber', 'plumbing', 'leak', 'pipe', 'drain'], fr: ['plombier', 'plomberie', 'fuite', 'tuyau'], de: ['klempner', 'installateur', 'rohr', 'wasserleck'], it: ['idraulico', 'perdita', 'tubo'], pt: ['encanador', 'hidraulico', 'vazamento', 'cano'], qu: ['yakuta allichaq', 'yakup nan'], ay: ['uma allicha', 'uma thakhi'], zh: ['水管工', '水管', '漏水', '管道'], ja: ['配管工', '水道', '水漏れ'], ar: ['سباك', 'تسرب', 'أنابيب'] } },
  { section: 'Servicios', es: ['electricista', 'electricidad', 'cableado', 'corto circuito'], words: {
    en: ['electrician', 'electrical', 'wiring', 'power'], fr: ['electricien', 'electricite', 'cablage'], de: ['elektriker', 'elektrik', 'verkabelung'], it: ['elettricista', 'elettricita'], pt: ['eletricista', 'eletrica', 'fiacao'], qu: ['electricidad ruwaq'], ay: ['electricidad luraña'], zh: ['电工', '电力', '电路'], ja: ['電気工事', '電気技師'], ar: ['كهربائي', 'كهرباء'] } },
  { section: 'Servicios', es: ['carpintero', 'carpinteria', 'mueble', 'madera'], words: {
    en: ['carpenter', 'carpentry', 'furniture', 'wood'], fr: ['charpentier', 'menuiserie', 'meuble'], de: ['tischler', 'schreiner', 'mobel'], it: ['falegname', 'falegnameria', 'mobile'], pt: ['carpinteiro', 'carpintaria', 'movel'], qu: ['keros ruwaq'], ay: ['khunu luraña'], zh: ['木工', '家具'], ja: ['大工', '家具'], ar: ['نجار', 'أثاث'] } },
  { section: 'Servicios', es: ['albanil', 'construccion', 'obra', 'cemento'], words: {
    en: ['mason', 'builder', 'construction'], fr: ['macon', 'construction', 'chantier'], de: ['maurer', 'bau', 'baustelle'], it: ['muratore', 'costruzione'], pt: ['pedreiro', 'construcao', 'obra'], qu: ['perqataq'], ay: ['utachaña'], zh: ['泥瓦匠', '建筑'], ja: ['左官', '建設'], ar: ['بناء', 'مقاول'] } },
  { section: 'Servicios', es: ['pintor', 'pintura', 'pintar'], words: {
    en: ['painter', 'painting', 'paint'], fr: ['peintre', 'peinture'], de: ['maler', 'anstrich', 'farbe'], it: ['pittore', 'pittura', 'imbianchino'], pt: ['pintor', 'pintura'], qu: ['llimpichiq'], ay: ['samichaña'], zh: ['油漆工', '粉刷'], ja: ['塗装', 'ペンキ'], ar: ['دهان', 'طلاء'] } },
  { section: 'Servicios', es: ['jardinero', 'jardineria', 'jardin', 'poda'], words: {
    en: ['gardener', 'gardening', 'garden'], fr: ['jardinier', 'jardinage', 'jardin'], de: ['gartner', 'garten'], it: ['giardiniere', 'giardinaggio'], pt: ['jardineiro', 'jardinagem'], qu: ['sachaq kamayuq'], ay: ['ali kamani'], zh: ['园丁', '园艺'], ja: ['庭師', '園芸'], ar: ['بستاني', 'حدائق'] } },
  { section: 'Servicios', es: ['limpieza', 'limpiar', 'aseo', 'empleada'], words: {
    en: ['cleaning', 'cleaner', 'clean'], fr: ['nettoyage', 'menage', 'femme de menage'], de: ['reinigung', 'putzfrau', 'sauber'], it: ['pulizia', 'colf'], pt: ['limpeza', 'faxina', 'diarista'], qu: ['pichay'], ay: ['pichaña'], zh: ['清洁', '保洁'], ja: ['清掃', '掃除'], ar: ['تنظيف', 'عاملة منزل'] } },
  { section: 'Servicios', es: ['tecnico', 'computadora', 'celular', 'reparacion', 'soporte'], words: {
    en: ['technician', 'computer', 'laptop', 'phone repair'], fr: ['technicien', 'ordinateur', 'reparation'], de: ['techniker', 'computer', 'reparatur'], it: ['tecnico', 'computer', 'riparazione'], pt: ['tecnico', 'computador', 'conserto'], qu: ['computadora allichaq'], ay: ['computadora allichaña'], zh: ['技术员', '电脑维修', '手机维修'], ja: ['技術者', 'パソコン修理'], ar: ['فني', 'إصلاح حاسوب'] } },
  { section: 'Servicios', es: ['cerrajero', 'cerradura', 'llave'], words: {
    en: ['locksmith', 'lock', 'key'], fr: ['serrurier', 'serrure', 'cle'], de: ['schlosser', 'schloss'], it: ['fabbro', 'serratura'], pt: ['chaveiro', 'fechadura'], qu: ['llave ruwaq'], ay: ['llave luraña'], zh: ['锁匠', '开锁'], ja: ['鍵屋', '鍵'], ar: ['حداد', 'قفل'] } },
  { section: 'Servicios', es: ['mecanico', 'taller', 'auto', 'carro'], words: {
    en: ['mechanic', 'garage', 'car repair'], fr: ['mecanicien', 'garage', 'voiture'], de: ['mechaniker', 'werkstatt', 'auto'], it: ['meccanico', 'officina', 'auto'], pt: ['mecanico', 'oficina', 'carro'], qu: ['carro allichaq'], ay: ['carro allichaña'], zh: ['修理工', '汽车维修'], ja: ['整備士', '車修理'], ar: ['ميكانيكي', 'إصلاح سيارة'] } },
  { section: 'Servicios', es: ['taxi', 'transporte', 'mudanza', 'flete'], words: {
    en: ['taxi', 'transport', 'moving', 'delivery'], fr: ['taxi', 'transport', 'demenagement'], de: ['taxi', 'transport', 'umzug'], it: ['taxi', 'trasporto', 'trasloco'], pt: ['taxi', 'transporte', 'mudanca'], qu: ['apaykachay'], ay: ['apayana'], zh: ['出租车', '运输', '搬家'], ja: ['タクシー', '運送', '引っ越し'], ar: ['سيارة أجرة', 'نقل', 'نقل أثاث'] } },
  { section: 'Servicios', es: ['niera', 'niera', 'cuidado de ninos', 'cuidar ninos'], words: {
    en: ['nanny', 'babysitter', 'childcare'], fr: ['nounou', 'baby-sitter', 'garde enfant'], de: ['babysitter', 'kinderbetreuung'], it: ['babysitter', 'bambinaia'], pt: ['babá', 'babysitter'], qu: ['wawa qhawaq'], ay: ['wawa uñjaña'], zh: ['保姆', '育儿'], ja: ['ベビーシッター', '育児'], ar: ['جليسة أطفال', 'رعاية أطفال'] } },
  { section: 'Servicios', es: ['profesor', 'clases', 'profesora', 'enseñanza', 'tutor'], words: {
    en: ['teacher', 'classes', 'tutor', 'lessons'], fr: ['professeur', 'cours', 'tuteur'], de: ['lehrer', 'unterricht', 'nachhilfe'], it: ['insegnante', 'lezioni', 'tutor'], pt: ['professor', 'aulas', 'tutor'], qu: ['yachachiq'], ay: ['yachachiqi'], zh: ['老师', '家教', '课程'], ja: ['先生', '家庭教師', '授業'], ar: ['مدرس', 'دروس'] } },
  { section: 'Servicios', es: ['cocinero', 'catering', 'comida', 'chef'], words: {
    en: ['cook', 'catering', 'chef', 'food'], fr: ['cuisinier', 'traiteur', 'repas'], de: ['koch', 'catering', 'essen'], it: ['cuoco', 'catering', 'cibo'], pt: ['cozinheiro', 'catering', 'comida'], qu: ['mikhuna ruwaq'], ay: ['manqha luraña'], zh: ['厨师', '餐饮'], ja: ['料理人', 'ケータリング'], ar: ['طباخ', 'تموين'] } },
  { section: 'Servicios', es: ['peluqueria', 'peluquero', 'barberia', 'corte de cabello'], words: {
    en: ['hairdresser', 'barber', 'haircut'], fr: ['coiffeur', 'coiffure'], de: ['friseur', 'friseur', 'haarschnitt'], it: ['parrucchiere', 'barbiere'], pt: ['cabeleireiro', 'barbeiro'], qu: ['chuqcha rutuq'], ay: ['chuqcha khuchuña'], zh: ['理发', '理发师'], ja: ['美容師', '理髪'], ar: ['حلاق', 'تصفيف شعر'] } },
  { section: 'Servicios', es: ['enfermera', 'enfermero', 'medico', 'salud', 'cuidador'], words: {
    en: ['nurse', 'doctor', 'health', 'caregiver'], fr: ['infirmier', 'medecin', 'sante'], de: ['krankenschwester', 'arzt', 'gesundheit'], it: ['infermiere', 'medico', 'salute'], pt: ['enfermeiro', 'medico', 'saude'], qu: ['hampikuq'], ay: ['qullañiri'], zh: ['护士', '医生'], ja: ['看護師', '医者'], ar: ['ممرض', 'طبيب'] } },
  { section: 'Servicios', es: ['veterinaria', 'veterinario', 'mascota'], words: {
    en: ['veterinarian', 'vet', 'pet'], fr: ['veterinaire', 'animal'], de: ['tierarzt', 'haustier'], it: ['veterinario', 'animale'], pt: ['veterinario', 'animal'], qu: ['uywa hampikuq'], ay: ['uywa qullañiri'], zh: ['兽医', '宠物'], ja: ['獣医', 'ペット'], ar: ['طبيب بيطري', 'حيوانات'] } }
];

const PLACE_LEXICON = [
  { es: 'hospital', words: ['hospital', 'hospital', 'hopital', 'krankenhaus', 'ospedale', 'hospital', 'hampina wasi', 'qullan uta', '医院', '病院', 'مستشفى', 'posta medica', 'clinica', 'clinique', 'klinik', 'clinica'] },
  { es: 'farmacia', words: ['farmacia', 'pharmacy', 'pharmacie', 'apotheke', 'farmacia', 'botica', '药店', '薬局', 'صيدلية'] },
  { es: 'policia', words: ['policia', 'police', 'polizei', 'polizia', 'policia', 'comisaria', '警察', '警察署', 'شرطة'] },
  { es: 'mercado', words: ['mercado', 'market', 'marche', 'markt', 'mercato', 'mercado', 'qhatu', '市场', '市場', 'سوق'] },
  { es: 'restaurante', words: ['restaurante', 'restaurant', 'restaurant', 'restaurant', 'ristorante', 'restaurante', 'mikhuna wasi', 'manqha uta', '餐厅', 'レストラン', 'مطعم'] },
  { es: 'plaza de armas', words: ['plaza de armas', 'plaza', 'main square', 'place principale', 'hauptplatz', 'piazza', 'praca', 'plaza', '广场', '広場', 'ساحة'] },
  { es: 'aeropuerto', words: ['aeropuerto', 'airport', 'aeroport', 'flughafen', 'aeroporto', 'aeroporto', '机场', '空港', 'مطار'] },
  { es: 'terminal', words: ['terminal', 'bus station', 'gare routiere', 'bushaltestelle', 'stazione', 'terminal', 'paradero', '汽车站', 'バスターミナル', 'محطة حافلات'] },
  { es: 'banco', words: ['banco', 'bank', 'banque', 'bank', 'banca', 'banco', 'cajero', '银行', '銀行', 'بنك'] },
  { es: 'universidad', words: ['universidad', 'university', 'universite', 'universitat', 'universita', 'universidade', '大学', '大學', 'جامعة'] },
  { es: 'colegio', words: ['colegio', 'school', 'ecole', 'schule', 'scuola', 'escola', 'escuela', '学校', '学校', 'مدرسة'] },
  { es: 'parque', words: ['parque', 'park', 'parc', 'park', 'parco', 'parque', 'parki', '公园', '公園', 'حديقة'] },
  { es: 'gasolinera', words: ['gasolinera', 'gas station', 'station service', 'tankstelle', 'distributore', 'posto de gasolina', 'grifo', '加油站', 'ガソリンスタンド', 'محطة وقود'] },
  { es: 'hotel', words: ['hotel', 'hotel', 'hotel', 'hotel', 'albergo', 'hotel', 'hospedaje', '酒店', 'ホテル', 'فندق'] }
];

const SECTION_LEXICON = [
  { section: 'Eventos', engine: 'Eventos', words: ['evento', 'eventos', 'event', 'events', 'evenement', 'evenements', 'veranstaltung', 'veranstaltungen', 'eventi', 'evento', '活动', 'イベント', 'فعالية'] },
  { section: 'Servicios', engine: 'Servicios', words: ['servicio', 'servicios', 'service', 'services', 'servico', 'servicos', 'servizio', 'servizi', 'dienst', 'dienste', '服务', 'サービス', 'خدمة'] },
  { section: 'Ventas', engine: 'Ventas', words: ['venta', 'ventas', 'comprar', 'compra', 'sale', 'sales', 'buy', 'achat', 'acheter', 'vente', 'kaufen', 'verkauf', 'comprare', 'vendita', '买', '購入', 'بيع', 'شراء'] },
  { section: 'Reportes', engine: 'Reportes', words: ['reporte', 'reportes', 'report', 'reports', 'signalement', 'meldung', 'segnalazione', 'relatorio', '报告', 'レポート', 'بلاغ'] },
  { section: 'Emergencias (SOS)', engine: 'Emergencia', words: ['emergencia', 'emergencias', 'sos', 'emergency', 'urgence', 'notfall', 'emergenza', 'emergencia', '紧急', '緊急', 'طوارئ'] },
  { section: 'Solidaridad', engine: 'Solidaridad', words: ['solidaridad', 'donacion', 'donaciones', 'donation', 'solidarieta', 'doacao', '捐赠', '寄付', 'تبرع'] },
  { section: 'Mensajes', engine: null, words: ['mensaje', 'mensajes', 'message', 'messages', 'chat', 'nachricht', 'messaggi', 'mensagem', '消息', 'メッセージ', 'رسائل'] },
  { section: 'Mi Perfil', engine: null, words: ['perfil', 'profile', 'profil', 'perfil', '资料', 'プロフィール', 'ملف'] },
  { section: 'Configuración', engine: null, words: ['configuracion', 'ajustes', 'settings', 'parametres', 'einstellungen', 'impostazioni', 'configuracoes', '设置', '設定', 'إعدادات'] }
];

const SEARCH_MARKERS = ['busca', 'buscar', 'busco', 'busque', 'encuentra', 'encontrar', 'necesito', 'quiero', 'muestra', 'muestrame', 'hay', 'donde', 'donde esta', 'cerca de mi', 'cerca', 'find', 'search', 'looking for', 'look for', 'need', 'want', 'where', 'near me', 'nearby', 'show me', 'show', 'trouve', 'trouver', 'cherche', 'besoin', 'ou est', 'pres de moi', 'such', 'finde', 'suche', 'brauche', 'nahe', 'wo ist', 'trova', 'cercare', 'bisogno', 'vicino', 'procuro', 'preciso', 'perto', 'quero', 'onde', 'maskay', 'thaqha', 'thaqham', 'jikxata', '找', '寻找', '附近', '探す', '近く', 'أبحث', 'ابحث', 'قريب'];

const HELP_WORDS = ['ayuda', 'help', 'aide', 'hilfe', 'aiuto', 'ajuda', '帮助', 'ヘルプ', 'مساعدة', 'yanapay', 'yanapt'];

const OPEN_MARKERS = ['abre', 'abrir', 'abreme', 'ir a', 've a', 'vamos a', 'open', 'go to', 'goto', 'ouvre', 'ouvrir', 'offne', 'apri', 'aprire', 'abre', 'vai a', 'abra', '打开', '開く', 'افتح', 'yaykuy'];

const ROUTE_TRIGGERS = [
  'como puedo llegar a', 'como puedo llegar', 'como llego a', 'como llego', 'como llegar a', 'como llegar', 'como ir a', 'como ir',
  'dame la ruta a', 'dame la ruta', 'marcame la ruta a', 'marcame la ruta', 'marcame', 'traza la ruta a', 'traza la ruta', 'traza', 'trazame',
  'llévame a', 'llevame a', 'llévame', 'llevame', 'me llevas a', 'me llevas', 'llevarme a', 'llevarme',
  'muestrame la ruta a', 'muestrame la ruta', 'indicaciones a', 'indicaciones para', 'indicaciones', 'dirigeme a', 'dirigeme', 'guiame a', 'guiame',
  'navega a', 'navegar a', 'ruta a', 'ruta hacia', 'ruta hasta', 'ruta', 'camino a', 'camino hacia', 'camino',
  'direccion a', 'ir a', 'vamos a', 'hacia', 'hasta',
  'show me the route to', 'show me the way to', 'show me the route', 'show me the way', 'take me to', 'take me',
  'give me the route to', 'give me the route', 'directions to', 'directions', 'how do i get to', 'how to get to', 'how do i get',
  'navigate to', 'navigate', 'guide me to', 'guide me', 'route to', 'route', 'way to', 'get to', 'go to', 'bring me to', 'bring me',
  'itineraire vers', 'itineraire', 'itineraire pour', 'emmene moi a', 'emmene moi', 'amene moi a', 'amene moi',
  'comment aller a', 'comment aller', 'comment arriver a', 'comment arriver', 'chemin vers', 'chemin', 'route vers', 'route',
  'direction vers', 'direction', 'guide moi', 'va a', 'aller a', 'conduis moi',
  'bring mich zu', 'bring mich', 'wie komme ich zu', 'wie komme ich', 'route zu', 'route', 'weg zu', 'weg', 'hinfahren', 'navigation', 'richtung', 'geh zu', 'fahrt zu', 'fahre zu',
  'percorso per', 'percorso', 'strada per', 'strada', 'portami a', 'portami', 'come arrivo a', 'come arrivo', 'indicazioni per', 'indicazioni', 'vai a', 'andare a', 'guidami',
  'rota para', 'rota', 'caminho para', 'caminho', 'leve me a', 'leve me', 'me leve a', 'me leve', 'como chegar a', 'como chegar', 'direcoes para', 'direcoes', 'ir para', 'guie me',
  'nanta rikuchiy', 'nanta rikuchiway', 'nanta', 'nan rikuchiy', 'rikuchiy', 'pusaway', 'pusapuway', 'pusay', 'chayay', 'imayna chayay', 'maypi',
  'thakhi uñacht’ayi', "thakhi unacht'ayi", 'thakhita', 'thakhi', "uñacht'ayi", "unacht'ayi", 'irpita', 'irpim', 'kunjamsa purina', 'kunjam puri',
  'route to', '怎么去', '怎么走', '带我去', '带我到', '路线', '导航', '去', '到',
  'ルート', '道順', '行き方', '連れて行って', '案内して', '案内', 'まで', 'に行きたい', 'へ行きたい',
  'المسار إلى', 'المسار', 'الطريق إلى', 'الطريق', 'خذني إلى', 'خذني', 'كيف أصل إلى', 'كيف أصل', 'دلني', 'إلى', 'الى', 'اذهب إلى'
];

const POLITENESS = ['por favor', 'please', 'bitte', 's il te plait', 's\'il te plait', 'per favore', 'por gentileza', 'obrigado', 'gracias', 'thanks', 'thank you', 'merci', 'danke', 'grazie', '请', '請', 'お願いします', 'من فضلك', 'por favorn'];

// ---------------------------------------------------------------------------
// 4. Utilidades de extraccion
// ---------------------------------------------------------------------------

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripPhrases(text, phrases) {
  let value = ' ' + normalizeText(text) + ' ';
  const ordered = [...phrases].map((item) => normalizeText(item)).filter(Boolean).sort((a, b) => b.length - a.length);
  ordered.forEach((phrase) => {
    const pattern = new RegExp(`(^|[^a-z'])${escapeRegExp(phrase)}(?=$|[^a-z'])`, 'g');
    value = value.replace(pattern, '$1 ');
  });
  return value.replace(/\s+/g, ' ').trim();
}

function stripLeading(value) {
  let text = value;
  const leading = ['a la', 'a las', 'al', 'a', 'hacia', 'hasta', 'para', 'to the', 'to', 'towards', 'the', 'au', 'a la', 'vers', 'zum', 'zur', 'nach', 'der', 'die', 'das', 'il', 'lo', 'la', 'per', 'para', 'at', 'in', 'へ', 'に', 'まで', 'إلى', 'الى'];
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of leading) {
      const pattern = new RegExp(`^${prefix}\\s+`, 'i');
      if (pattern.test(text)) { text = text.replace(pattern, ''); changed = true; }
    }
  }
  return text.trim();
}

const ROUTE_REQUEST_PHRASES = [
  'quiero ir', 'quiero', 'necesito', 'quisiera', 'me gustaria', 'por favor',
  'je veux', 'je voudrais', 'veux', 'voudrais', 'besoin de', 'besoin',
  'i want to go', 'i want', 'i need', 'need', 'want',
  'ich mochte', 'ich will', 'mochte', 'brauche',
  'voglio andare', 'voglio', 'vorrei', 'ho bisogno di', 'bisogno',
  'quero ir', 'quero', 'preciso', 'gostaria',
  'munani', 'munay', 'munaña',
  'caminando', 'a pie', 'walking', 'on foot', 'a pied', 'zu fuss', 'a piedi', 'a pe', 'walk',
  'en bicicleta', 'bicicleta', 'bici', 'cycling', 'bike', 'bicycle', 'velo', 'fahrrad', 'bicicletta',
  'en coche', 'en auto', 'conducir', 'driving', 'by car', 'voiture', 'fahren', 'macchina', 'guida', 'de carro'
];

function cleanDestination(text, language) {
  let value = stripPhrases(text, [...ROUTE_TRIGGERS, ...ROUTE_REQUEST_PHRASES, ...POLITENESS]);
  value = stripLeading(value);
  value = value.replace(/^(?:por|para|de|del|the|of)\s+/, '');
  if (language === 'qu') value = value.replace(/([a-z])man$/, '$1');
  value = value.replace(/\s+/g, ' ').trim();
  return value;
}

function findPlace(text) {
  const normalized = normalizeText(text);
  for (const place of PLACE_LEXICON) {
    for (const word of place.words) {
      const needle = normalizeText(word);
      if (needle && normalized.includes(needle)) return { es: place.es, word };
    }
  }
  return null;
}

function findService(text) {
  const normalized = normalizeText(text);
  for (const entry of SERVICE_LEXICON) {
    const words = [...entry.es, ...Object.values(entry.words || {}).flat()];
    for (const word of words) {
      const needle = normalizeText(word);
      if (needle && normalized.includes(needle)) return entry;
    }
  }
  return null;
}

function findSection(text) {
  const normalized = normalizeText(text);
  for (const entry of SECTION_LEXICON) {
    for (const word of entry.words) {
      const needle = normalizeText(word);
      if (needle && new RegExp(`(^|[^a-z'])${needle}($|[^a-z'])`).test(normalized)) return entry;
    }
  }
  return null;
}

function hasAny(text, words) {
  const normalized = normalizeText(text);
  return words.some((word) => {
    const needle = normalizeText(word);
    return needle && new RegExp(`(^|[^a-z'])${needle}($|[^a-z'])`).test(normalized);
  });
}

// Comida y recomendaciones en lenguaje natural: "el lugar de la esquina que vende lechon".
const FOOD_LEXICON = [
  { es: 'lechon', placesQuery: 'restaurante lechon', words: ['lechon', 'lechón', 'cochinillo', 'roast pork', 'porc roti', 'cochon', 'porco assado', 'schweinebraten', 'porchetta', 'leitao', 'kuchi', '烤猪', '乳猪', 'لحم خنزير'] },
  { es: 'pollo', placesQuery: 'pollo a la brasa', words: ['pollo', 'pollo a la brasa', 'chicken', 'poulet', 'huhn', 'hahnchen', 'pollo', 'frango', '鸡', '鶏肉', 'دجاج'] },
  { es: 'cuy', placesQuery: 'cuy restaurante', words: ['cuy', 'guinea pig', 'cochon d inde', 'meerschweinchen', 'porcellino d india', 'cobaia', '豚鼠', 'モルモット'] },
  { es: 'ceviche', placesQuery: 'cevicheria', words: ['ceviche', 'cevicheria', 'seafood', 'fish', 'poisson', 'fisch', 'pesce', 'peixe', '海鲜', '鱼', '魚', 'سمك'] },
  { es: 'pizza', placesQuery: 'pizzeria', words: ['pizza', 'pizzeria', 'pizzaria', 'pizzería', '披萨', 'ピザ', 'بيتزا'] },
  { es: 'hamburguesa', placesQuery: 'hamburgueseria', words: ['hamburguesa', 'hamburguesas', 'burger', 'hamburger', '汉堡', 'ハンバーガー', 'برغر'] },
  { es: 'chifa', placesQuery: 'chifa', words: ['chifa', 'chifa'] },
  { es: 'cafe', placesQuery: 'cafeteria', words: ['cafe', 'cafeteria', 'coffee', 'kaffee', 'caffe', 'café', '咖啡', 'コーヒー', 'قهوة'] }
];

const HUNGER_WORDS = ['hambre', 'hungry', 'faim', 'hunger', 'hungrig', 'fame', 'fome', 'yarqha', 'yarqhasqa', '饿', '空腹', 'お腹がすいた', '腹が減った', 'جائع', 'جوعان'];

const RECOMMEND_MARKERS = ['recomendo', 'recomiendan', 'recomendaron', 'recomendado', 'recomendou', 'recomendaria', 'recomienda', 'recommended', 'recommend', 'recommande', 'empfohlen', 'consigliato', 'vende', 'venden', 'vendem', 'vendono', 'sirve', 'sirven', 'sells', 'vend', 'verkauft', '推荐', '推薦', 'おすすめ', 'نصحني'];

const NATURAL_FILLERS = ['mi amigo', 'mi amiga', 'mi companero', 'mi companera', 'mi vecino', 'mi vecina', 'mi familiar', 'mi mama', 'mi papa',
  'me recomendo', 'me recomendaron', 'me recomiendan', 'me dijo', 'me dijeron', 'me comento', 'me conto',
  'el lugar', 'un lugar', 'lugar de', 'la esquina', 'esquina', 'que vende', 'que venden', 'que sirve', 'que sirven', 'donde venden', 'donde sirven', 'donde hay', 'hay un', 'hay una', 'tengo ganas de',
  'my friend', 'a friend', 'recommended', 'told me', 'the place', 'the corner', 'that sells', 'who sells',
  'mon ami', 'mein freund', 'un amico', 'meu amigo', 'ein ort', 'une place',
  '朋友', '友达', '推荐', '友達', 'おすすめ', 'صديقي', 'نصحني'];

function hasWord(normalized, word) {
  const needle = normalizeText(word);
  if (!needle) return false;
  if (/^[a-z0-9 ']+$/.test(needle)) return new RegExp(`(^|[^a-z])${escapeRegExp(needle)}($|[^a-z])`).test(normalized);
  return normalized.includes(needle);
}

function findFood(normalized) {
  return FOOD_LEXICON.find((entry) => entry.words.some((word) => hasWord(normalized, word))) || null;
}

function detectRouteMode(normalized) {
  if (/(^|\s)(a pie|caminando|walking|on foot|a pied|zu fuss|a piedi|a pe|walk|徒步|徒歩|سيرا)(\s|$)/.test(normalized)) return 'walking';
  if (/(^|\s)(bicicleta|bici|cycling|bike|bicycle|velo|fahrrad|bicicletta|bike|自行车|自転車|دراجة)(\s|$)/.test(normalized)) return 'cycling';
  if (/(^|\s)(en auto|en coche|conducir|driving|by car|voiture|fahren|macchina|guida|de carro|汽车|車|سيارة)(\s|$)/.test(normalized)) return 'driving';
  return null;
}

// ---------------------------------------------------------------------------
// 5. Parser principal
// ---------------------------------------------------------------------------

export function parseInstruction(raw) {
  const original = String(raw || '').trim();
  const normalized = normalizeText(original);
  const language = detectLanguage(original);

  if (!normalized) return { intent: 'empty', language };

  // Cambio de idioma explicito.
  const requestedLanguage = findLanguageRequest(normalized);
  if (requestedLanguage) return { intent: 'language', language: requestedLanguage };

  const section = findSection(original);
  const service = findService(original);
  const place = findPlace(original);
  const mode = detectRouteMode(normalized);
  const hasRouteTrigger = hasAny(original, ROUTE_TRIGGERS);
  const hasSearchTrigger = hasAny(original, SEARCH_MARKERS);
  const hasOpenTrigger = hasAny(original, OPEN_MARKERS);
  const hasRecommend = hasAny(original, RECOMMEND_MARKERS);

  // Solo el modo de ruta ("ir a pie", "walking").
  if (mode && !hasRouteTrigger && !service && !place && !section) {
    return { intent: 'route-mode', mode, language };
  }

  // Ruta: destino = lugar conocido o el texto restante.
  if (hasRouteTrigger || (place && /(^|\s)(ve|voy|ir|quiero|necesito|quisiera|veux|voudrais|besoin|need|want|voglio|vorrei|brauche|mochte|quero|preciso|去|行く|اذهب|أريد|اريد)(\s|$)/.test(normalized))) {
    let destination = cleanDestination(original, language);
    const foodInRoute = findFood(normalized);
    if (foodInRoute) destination = foodInRoute.placesQuery;
    if (place) {
      const words = normalizeText(destination).split(/\s+/).filter(Boolean);
      if (words.length <= 3) destination = place.es;
    }
    return { intent: 'route', destination, mode, place: place?.es || null, language, query: original };
  }

  // Comida o recomendaciones: busca el plato o el tipo de lugar aunque la frase sea larga.
  const food = findFood(normalized);
  if (food) {
    return { intent: 'search', section: null, engine: null, terms: [food.es], placesQuery: food.placesQuery, query: original, language, place: food.placesQuery };
  }
  if (HUNGER_WORDS.some((word) => normalized.includes(normalizeText(word)))) {
    return { intent: 'search', section: null, engine: null, terms: ['restaurante'], placesQuery: 'restaurante', query: original, language, place: 'restaurante' };
  }

  // Capas del mapa.
  if (/(satelit|satellite|satellit|空间|卫星|衛星|قمر)/.test(normalized)) return { intent: 'layer', layer: 'satellite', language };
  if (/(transporte|transport|verkehr|trasporti|交通|النقل)/.test(normalized)) return { intent: 'layer', layer: 'transport', language };
  if (/(relieve|relief|3d|gelande|rilievo|relevo|地形|تضاريس)/.test(normalized)) return { intent: 'layer', layer: 'relief', language };
  if (/(oscuro|dark|dunkel|scuro|escuro|深色|暗い|داكن)/.test(normalized)) return { intent: 'layer', layer: 'dark', language };
  if (/(claro|light|hell|chiaro|浅色|明るい|فاتح)/.test(normalized)) return { intent: 'layer', layer: 'light', language };

  // Radio de busqueda.
  if (/(radio|radius|rayon|suchradius|raggio|raio|半径|نطاق)/.test(normalized)) {
    if (/(aumenta|amplia|incrementa|increase|expand|erhohen|agrandir|aumentar|增加|広げ|زد)/.test(normalized)) return { intent: 'radius', factor: 2, language };
    if (/(reduce|disminuye|decrease|smaller|reduire|verkleinern|riduci|diminuisci|diminuir|减少|縮小|قلل)/.test(normalized)) return { intent: 'radius', factor: 0.5, language };
  }

  // Notificaciones.
  if (/(notificacion|notificaciones|notification|notifications|benachrichtigung|notifica|notifiche|notificacoes|通知|إشعار)/.test(normalized)) {
    const off = /(desactiva|apaga|quita|off|disable|desactivar|aus|disattiva|desligar|关闭|オフ|إيقاف)/.test(normalized);
    return { intent: 'notifications', enabled: !off, language };
  }

  // Ubicacion del usuario.
  if (/(mi ubicacion|donde estoy|my location|where am i|ou suis je|wo bin ich|dove sono|onde estou|我在哪|現在地|اين انا|maypi kani|kawkhans)/.test(normalized)) {
    return { intent: 'location', language };
  }

  // Ayuda sola.
  if (HELP_WORDS.some((word) => normalized === normalizeText(word))) return { intent: 'help', language };

  // Abrir una seccion.
  if (hasOpenTrigger && section) return { intent: 'section', section: section.section, engine: section.engine, language };

  // Buscar un servicio concreto (lexico) o una categoria.
  if (service) {
    return { intent: 'search', section: service.section, engine: service.engine || 'Servicios', terms: service.es, query: original, language };
  }
  if (section) {
    return { intent: 'search', section: section.section, engine: section.engine, terms: [], query: original, language };
  }
  if (place && (hasSearchTrigger || hasRecommend)) {
    return { intent: 'search', section: null, engine: null, terms: [place.es], query: original, language, place: place.es };
  }

  // Busqueda libre (incluye frases naturales con recomendaciones).
  if (hasSearchTrigger || hasRecommend) {
    let query = stripPhrases(original, [...SEARCH_MARKERS, ...RECOMMEND_MARKERS, ...NATURAL_FILLERS, ...POLITENESS]);
    query = stripLeading(query).replace(/^(?:un|una|el|la|los|las|the|a|an|some|des|der|die|das)\s+/, '').trim();
    if (query) return { intent: 'search', section: null, engine: null, terms: [query], query, language };
  }

  return { intent: 'fallback', language, query: original };
}
