import React, { useEffect } from 'react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';

// Vista LayerSwitcherView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="layer-switcher">
        <button class="layer-btn active" data-layer="light">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            Claro
        </button>
        <button class="layer-btn" data-layer="dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            Oscuro
        </button>
        <button class="layer-btn" data-layer="transport">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/></svg>
            Transporte
        </button>
        <button class="layer-btn" data-layer="satellite">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M4 4l4 4m8 8 4 4M4 20l4-4m8-8 4-4"/></svg>
            Satélite HD
        </button>
        <button class="layer-btn" data-layer="relief">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18L12 4z"/><path d="M8 14l4-4 4 4"/></svg>
            Relieve 3D
        </button>
    </div>`;

const LABELS = {
  light: 'Claro',
  dark: 'Oscuro',
  transport: 'Transporte',
  satellite: 'Satélite HD',
  relief: 'Relieve 3D'
};

// Actualiza solo el nodo de texto para no perder los listeners del motor.
const updateLabel = (button, label) => {
  for (let index = button.childNodes.length - 1; index >= 0; index -= 1) {
    const node = button.childNodes[index];
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = `\n            ${label}\n        `;
      return;
    }
  }
};

export default function LayerSwitcherView() {
  const { tr } = usePreferences();

  useEffect(() => {
    document.querySelectorAll('#layer-switcher .layer-btn').forEach((button) => {
      const label = LABELS[button.dataset.layer];
      if (label) updateLabel(button, tr(label));
    });
  }, [tr]);

  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
