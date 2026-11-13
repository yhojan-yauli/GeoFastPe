import React, { useEffect } from 'react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';

// Vista SearchView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="search-container">
        <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="search-input" placeholder="Buscar en GeoFastPe...">
            <button id="search-voice-btn" type="button" title="Buscar por voz" aria-label="Buscar por voz">🎙</button><button id="search-btn">Buscar</button>
        </div>
        <div id="search-results"></div>
    </div>`;

export default function SearchView() {
  const { tr } = usePreferences();

  useEffect(() => {
    const input = document.getElementById('search-input');
    if (input) input.placeholder = tr('Buscar en GeoFastPe...');
    const voice = document.getElementById('search-voice-btn');
    if (voice) {
      voice.title = tr('Buscar por voz');
      voice.setAttribute('aria-label', tr('Buscar por voz'));
    }
    const button = document.getElementById('search-btn');
    if (button) button.textContent = tr('Buscar');
  }, [tr]);

  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
