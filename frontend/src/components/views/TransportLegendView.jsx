import React from 'react';

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

export default function TransportLegendView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
