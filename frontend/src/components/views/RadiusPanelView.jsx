import React from 'react';

// Vista RadiusPanelView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="radius-panel">
        <div class="row-1">
            <select class="city-select" id="city-selector">
                <option value="lima">Lima</option>
                <option value="arequipa">Arequipa</option>
                <option value="cusco">Cusco</option>
            </select>
            <div class="radius-info">Radio <span id="radius-value">1000</span> m</div>
        </div>
        <input type="range" id="radius-slider" min="500" max="5000" step="500" value="1000">
    </div>`;

export default function RadiusPanelView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
