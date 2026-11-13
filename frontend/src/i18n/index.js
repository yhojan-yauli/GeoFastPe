import en from './locales/en.js';
import es from './locales/es.js';
import pt from './locales/pt.js';
import qu from './locales/qu.js';
import ay from './locales/ay.js';
import fr from './locales/fr.js';
import de from './locales/de.js';
import it from './locales/it.js';
import zh from './locales/zh.js';
import ja from './locales/ja.js';
import ar from './locales/ar.js';

import extraEn from './locales/extra-en.js';
import extraQu from './locales/extra-qu.js';
import extraAy from './locales/extra-ay.js';
import extraPt from './locales/extra-pt.js';
import extraFr from './locales/extra-fr.js';
import extraDe from './locales/extra-de.js';
import extraIt from './locales/extra-it.js';
import extraZh from './locales/extra-zh.js';
import extraJa from './locales/extra-ja.js';
import extraAr from './locales/extra-ar.js';

const merge = (base, extra) => ({ ...base, ...extra });

export const uiDictionaries = {
  es,
  en: merge(en, extraEn),
  pt: merge(pt, extraPt),
  qu: merge(qu, extraQu),
  ay: merge(ay, extraAy),
  fr: merge(fr, extraFr),
  de: merge(de, extraDe),
  it: merge(it, extraIt),
  zh: merge(zh, extraZh),
  ja: merge(ja, extraJa),
  ar: merge(ar, extraAr),
};

export const RTL_LANGUAGES = ['ar'];

export function translateText(language, text) {
  const value = String(text ?? '');
  if (!value) return value;
  if (!language || language === 'es') return value;
  return uiDictionaries[language]?.[value] ?? value;
}
