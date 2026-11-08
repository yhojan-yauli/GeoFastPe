import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import './styles/global.css';

// El motor MapLibre administra listeners y controles imperativos; no debe
// inicializarse dos veces en modo desarrollo mediante StrictMode.
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider><App /></AuthProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => console.warn('No se pudo activar el modo offline:', error));
  });
}
