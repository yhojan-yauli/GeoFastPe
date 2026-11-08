import React from 'react';

// Selector de ciudad del mapa. El control de radio vive en la barra lateral (SidePanel).
const markup = `<div id="radius-panel">
        <div class="row-1">
            <select class="city-select" id="city-selector">
                <option value="lima">Lima</option>
                <option value="arequipa">Arequipa</option>
                <option value="cusco">Cusco</option>
            </select>
        </div>
    </div>`;

export default function RadiusPanelView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
