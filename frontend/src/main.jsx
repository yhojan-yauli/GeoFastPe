import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PreferencesProvider } from './preferences/PreferencesContext.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import './styles/global.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </AuthProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  } else {
    // En desarrollo no se usa Service Worker: evita servir módulos o HTML obsoletos.
    navigator.serviceWorker.getRegistrations()
      .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
      .catch(() => {});
    if (window.caches?.keys) {
      caches.keys()
        .then(keys => Promise.all(keys.map(key => caches.delete(key))))
        .catch(() => {});
    }
  }
}
