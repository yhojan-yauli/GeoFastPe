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

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
