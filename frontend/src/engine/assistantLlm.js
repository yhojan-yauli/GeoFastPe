import { API_BASE } from '../api/client.js';

// Interpretacion con LLM (backend /asistente/interpretar).
// Si el servicio no esta configurado o falla, devuelve null y el asistente usa el motor local.

export const LLM_LANGUAGES = ['es', 'en', 'qu', 'ay', 'pt', 'fr', 'de', 'it', 'zh', 'ja', 'ar'];

const SECTION_FROM_LLM = { Configuracion: 'Configuración' };

export async function interpretWithLlm(text, uiLanguage, history = []) {
  try {
    const response = await fetch(`${API_BASE}/asistente/interpretar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, uiLanguage, history }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function llmToParsed(result, text) {
  const language = LLM_LANGUAGES.includes(result.language) ? result.language : null;
  const reply = String(result.reply || '').trim() || null;
  const base = { language, reply, query: text, llm: true };

  switch (result.action) {
    case 'search': {
      const term = result.query || result.placesQuery || text;
      return { ...base, intent: 'search', section: null, engine: result.category || null, terms: [term], placesQuery: result.placesQuery || term };
    }
    case 'route': {
      const destination = result.destination || result.placesQuery || '';
      return { ...base, intent: 'route', destination, mode: result.mode || null };
    }
    case 'language':
      return { ...base, intent: 'language', language: LLM_LANGUAGES.includes(result.uiLanguage) ? result.uiLanguage : language };
    case 'section':
      return { ...base, intent: 'section', section: SECTION_FROM_LLM[result.section] || result.section };
    case 'layer':
      return { ...base, intent: 'layer', layer: result.layer };
    case 'radius':
      return { ...base, intent: 'radius', factor: Number(result.radiusFactor) || 2 };
    case 'help_request':
      return {
        ...base,
        intent: 'help_request',
        draft: {
          title: result.title || '',
          description: result.description || '',
          category: result.helpCategory || 'Otros',
          urgency: result.urgency || 'Media',
          location: result.location || null,
        },
      };
    case 'emergency_info':
      return { ...base, intent: 'emergency_info', contacts: Array.isArray(result.contacts) ? result.contacts : [] };
    default:
      return { ...base, intent: 'chat' };
  }
}
