import React, { useEffect } from 'react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';

// Vista TransportLegendView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="transport-legend">
        <div class="leg-title">Tipos de vía</div>
        <div class="leg-row"><span class="leg-dot" style="background:#e63946"></span>Autopista</div>
        <div class="leg-row"><span class="leg-dot" style="background:#f77f00"></span>Troncal</div>
        <div class="leg-row"><span class="leg-dot" style="background:#fcbf49"></span>Primaria</div>
        <div class="leg-row"><span class="leg-dot" style="background:#06d6a0"></span>Secundaria</div>
        <div class="leg-row"><span class="leg-dot" style="background:#118ab2"></span>Terciaria</div>
        <div class="leg-row"><span class="leg-dot" style="background:#94a3b8"></span>Residencial</div>
        <div class="leg-row"><span class="leg-dot" style="background:#a78bfa"></span>Ciclovía / Sendero</div>
    </div>`;

const ROWS = ['Autopista', 'Troncal', 'Primaria', 'Secundaria', 'Terciaria', 'Residencial', 'Ciclovía / Sendero'];

const setRowText = (row, label) => {
  for (let index = row.childNodes.length - 1; index >= 0; index -= 1) {
    const node = row.childNodes[index];
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = label;
      return;
    }
  }
};

export default function TransportLegendView() {
  const { tr } = usePreferences();

  useEffect(() => {
    const legend = document.getElementById('transport-legend');
    if (!legend) return;
    const title = legend.querySelector('.leg-title');
    if (title) title.textContent = tr('Tipos de vía');
    legend.querySelectorAll('.leg-row').forEach((row, index) => {
      if (ROWS[index]) setRowText(row, tr(ROWS[index]));
    });
  }, [tr]);

  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
