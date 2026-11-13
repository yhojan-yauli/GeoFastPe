import { X } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './LoginRequired.css';

export default function LoginRequired({ onClose, onLogin, onRegister }) {
  const { tr } = usePreferences();
  return (
    <div className="login-required-overlay" role="dialog" aria-modal="true" aria-labelledby="login-required-title">
      <div className="login-required-card gf-join-card">
        <button type="button" className="gf-join-close" onClick={onClose} aria-label={tr('Cerrar ventana')}><X size={18} /></button>
        <div className="gf-join-logo" aria-hidden="true">G</div>
        <h2 id="login-required-title" className="gf-join-title">{tr('Únete a GeoFastPe')}</h2>
        <p className="gf-join-description">{tr('Inicia sesión o crea una cuenta para publicar servicios, reportar emergencias y conectar con tu comunidad.')}</p>
        <div className="gf-join-actions">
          <button type="button" className="gf-join-button gf-join-primary" onClick={onLogin}>{tr('Iniciar sesión')}</button>
          <button type="button" className="gf-join-button gf-join-secondary" onClick={onRegister}>{tr('Crear cuenta')}</button>
        </div>
        <button type="button" className="gf-join-explore" onClick={onClose}>{tr('Seguir explorando el mapa')}</button>
      </div>
    </div>
  );
}
