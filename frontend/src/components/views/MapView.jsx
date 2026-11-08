import React from 'react';

// Vista MapView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="map"></div>`;

export default function MapView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
