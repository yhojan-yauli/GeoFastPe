import React from 'react';

// Vista WeatherView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="weather-card"></div>`;

export default function WeatherView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
