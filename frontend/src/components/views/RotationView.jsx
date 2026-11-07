import React from 'react';

// Vista RotationView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="rotation-control">
        <div id="rotation-compass" title="Arrastra para rotar / Clic para restablecer">
            <svg id="compass-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 L16 18 L12 14 L8 18 Z" fill="#3b82f6" stroke="#1e293b"/></svg>
        </div>
        <div id="rotation-value">0°</div>
    </div>`;

export default function RotationView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
