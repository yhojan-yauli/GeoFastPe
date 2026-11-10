import React from 'react';

// Vista ConnectivityView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="connectivity-badge">En línea</div>`;

export default function ConnectivityView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
