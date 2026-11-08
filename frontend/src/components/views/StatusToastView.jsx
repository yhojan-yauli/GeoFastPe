import React from 'react';

// Vista StatusToastView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="status-toast"></div>`;

export default function StatusToastView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
